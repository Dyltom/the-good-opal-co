'use server'

/**
 * Cart Server Actions
 *
 * Server-side mutations for cart operations.
 * These actions modify the cart cookie and revalidate affected pages.
 *
 * Pattern: Server Actions are the modern way to handle mutations in Next.js 15+
 * They replace the need for API routes for internal data operations.
 */

import { revalidatePath } from 'next/cache'
import {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart as clearCartUtil,
  type CartItem,
  type Cart,
} from '@/lib/cart'

/**
 * Action result type for consistent error handling
 */
interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Add an item to the cart
 * Can be called from Server Components via form action or from Client Components
 *
 * @param item - Product details to add (quantity defaults to 1)
 * @returns ActionResult with updated cart
 */
export async function addToCart(
  item: Omit<CartItem, 'quantity'>
): Promise<ActionResult<Cart>> {
  try {
    const cart = await addItemToCart(item)
    revalidatePath('/', 'layout')
    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to add item to cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to cart',
    }
  }
}

/**
 * Remove an item from the cart
 *
 * @param productId - ID of the product to remove
 * @returns ActionResult with updated cart
 */
export async function removeFromCart(productId: string): Promise<ActionResult<Cart>> {
  try {
    const cart = await removeItemFromCart(productId)
    revalidatePath('/', 'layout')
    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to remove item from cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item from cart',
    }
  }
}

/**
 * Update the quantity of a cart item
 *
 * @param productId - ID of the product to update
 * @param quantity - New quantity (0 removes the item)
 * @returns ActionResult with updated cart
 */
export async function updateQuantity(
  productId: string,
  quantity: number
): Promise<ActionResult<Cart>> {
  try {
    const cart = await updateCartItemQuantity(productId, quantity)
    revalidatePath('/', 'layout')
    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to update quantity:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update quantity',
    }
  }
}

/**
 * Clear all items from the cart
 *
 * @returns ActionResult with empty cart
 */
export async function clearCart(): Promise<ActionResult<Cart>> {
  try {
    const cart = await clearCartUtil()
    revalidatePath('/', 'layout')
    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to clear cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cart',
    }
  }
}

/**
 * Get the current cart state
 * Useful for Server Components that need cart data
 *
 * @returns ActionResult with current cart
 */
export async function fetchCart(): Promise<ActionResult<Cart>> {
  try {
    const cart = await getCart()
    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cart',
    }
  }
}

/**
 * Form action version of addToCart for use with forms
 * Extracts product data from FormData
 *
 * @param formData - Form data containing product details
 * @returns ActionResult with updated cart
 */
export async function addToCartFormAction(formData: FormData): Promise<ActionResult<Cart>> {
  const productId = formData.get('productId') as string
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const priceStr = formData.get('price') as string
  const image = formData.get('image') as string | null

  if (!productId || !slug || !name || !priceStr) {
    return {
      success: false,
      error: 'Missing required product information',
    }
  }

  const price = parseFloat(priceStr)
  if (isNaN(price) || price < 0) {
    return {
      success: false,
      error: 'Invalid price',
    }
  }

  return addToCart({
    productId,
    slug,
    name,
    price,
    image: image ?? undefined,
  })
}

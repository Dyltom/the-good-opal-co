/**
 * Cookie-based Cart Utilities
 *
 * Server-side cart management using HTTP-only cookies.
 * This approach works seamlessly with Server Components and SSR.
 *
 * Benefits over Context/localStorage:
 * - Works with Server Components
 * - SEO-friendly (cart visible to server)
 * - Secure (HTTP-only cookies)
 * - No hydration mismatch issues
 */

import { cookies } from 'next/headers'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'

/**
 * Represents an item in the shopping cart
 */
export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  quantity: number
  image?: string
}

/**
 * Represents the complete cart state
 */
export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

const CART_COOKIE_NAME = 'cart'
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const MAX_CART_LINES = 20

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  return { total, itemCount }
}

/**
 * Get the current cart from cookies with price validation
 * Safe to call from Server Components and Server Actions
 * Validates current prices against database to prevent stale pricing
 *
 * @returns Promise<Cart> - The current cart state with updated prices
 */
export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(CART_COOKIE_NAME)

  if (!cartCookie?.value) {
    return { items: [], total: 0, itemCount: 0 }
  }

  try {
    const storedItems: CartItem[] = JSON.parse(cartCookie.value)

    // Validate that items is an array
    if (!Array.isArray(storedItems)) {
      return { items: [], total: 0, itemCount: 0 }
    }

    // Validate prices against current database values to prevent stale pricing
    const validatedItems: CartItem[] = []
    const payload = await getPayload()

    for (const item of storedItems) {
      if (
        !item ||
        typeof item.productId !== 'string' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        continue
      }

      try {
        const { docs: [product] } = await payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { equals: item.productId } },
              { status: { equals: 'published' } },
            ],
          },
          limit: 1,
          depth: 1,
        })

        const availableStock = product?.stock ?? 0
        if (product && availableStock > 0) {
          const primaryImage = product.images?.[0]?.image
          const image =
            primaryImage && typeof primaryImage === 'object'
              ? resolveMediaUrl(primaryImage.url)
              : undefined

          validatedItems.push({
            productId: String(product.id),
            slug: product.slug,
            price: product.price,
            name: product.name,
            quantity: Math.min(item.quantity, availableStock),
            image,
          })
        }
        // Skip items that are no longer available or out of stock
      } catch (error) {
        // Skip items that couldn't be validated
        console.warn(`Failed to validate cart item ${item.productId}:`, error)
      }
    }

    const { total, itemCount } = calculateCartTotals(validatedItems)
    return { items: validatedItems, total, itemCount }
  } catch {
    // Invalid JSON in cookie, return empty cart
    return { items: [], total: 0, itemCount: 0 }
  }
}

/**
 * Set the cart items in the cookie
 * Only callable from Server Actions or Route Handlers
 *
 * @param items - Array of cart items to store
 */
export async function setCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies()
  const storedItems = items.slice(0, MAX_CART_LINES).map(({ productId, quantity }) => ({
    productId,
    quantity,
  }))

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(storedItems), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Add an item to the cart or increment quantity if already exists
 *
 * @param item - Cart item to add (without quantity, defaults to 1)
 * @returns Promise<Cart> - Updated cart state
 */
export async function addItemToCart(item: Omit<CartItem, 'quantity'>): Promise<Cart> {
  return addItemToCartWithQuantity(item, 1)
}

/**
 * Add an item to the cart with a specific quantity
 *
 * @param item - Cart item to add (without quantity)
 * @param quantity - Number of items to add
 * @returns Promise<Cart> - Updated cart state
 * @throws Error if insufficient stock available
 */
export async function addItemToCartWithQuantity(
  item: Omit<CartItem, 'quantity'>,
  quantity: number
): Promise<Cart> {
  // Validate stock before adding to cart
  const payload = await getPayload()
  const { docs: [product] } = await payload.find({
    collection: 'products',
    where: {
      and: [
        { id: { equals: item.productId } },
        { status: { equals: 'published' } },
      ],
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  const cart = await getCart()
  const existingItem = cart.items.find(i => i.productId === item.productId)
  const currentCartQuantity = existingItem?.quantity || 0
  const requestedTotalQuantity = currentCartQuantity + quantity

  const availableStock = product.stock ?? 0
  if (availableStock < requestedTotalQuantity) {
    throw new Error(`Insufficient stock available. Only ${availableStock} items in stock, but ${requestedTotalQuantity} requested.`)
  }

  const existingIndex = cart.items.findIndex((i) => i.productId === item.productId)

  if (existingIndex >= 0) {
    // Increment quantity of existing item
    const existingItem = cart.items[existingIndex]
    if (existingItem) {
      existingItem.quantity += quantity
    }
  } else {
    // Add new item with specified quantity
    const primaryImage = product.images?.[0]?.image
    const image =
      primaryImage && typeof primaryImage === 'object' ? resolveMediaUrl(primaryImage.url) : undefined

    if (cart.items.length >= MAX_CART_LINES) {
      throw new Error(`Your cart can contain up to ${MAX_CART_LINES} different items`)
    }

    cart.items.push({
      productId: String(product.id),
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image,
    })
  }

  await setCart(cart.items)
  const { total, itemCount } = calculateCartTotals(cart.items)
  return { items: cart.items, total, itemCount }
}

/**
 * Remove an item from the cart entirely
 *
 * @param productId - ID of the product to remove
 * @returns Promise<Cart> - Updated cart state
 */
export async function removeItemFromCart(productId: string): Promise<Cart> {
  const cart = await getCart()
  const items = cart.items.filter((i) => i.productId !== productId)
  await setCart(items)
  const { total, itemCount } = calculateCartTotals(items)
  return { items, total, itemCount }
}

/**
 * Update the quantity of a cart item
 *
 * @param productId - ID of the product to update
 * @param quantity - New quantity (0 or less removes the item)
 * @returns Promise<Cart> - Updated cart state
 * @throws Error if insufficient stock available
 */
export async function updateCartItemQuantity(productId: string, quantity: number): Promise<Cart> {
  const cart = await getCart()

  if (quantity <= 0) {
    return removeItemFromCart(productId)
  }

  // Validate stock before updating quantity
  const payload = await getPayload()
  const { docs: [product] } = await payload.find({
    collection: 'products',
    where: {
      and: [{ id: { equals: productId } }, { status: { equals: 'published' } }],
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  const availableStock = product.stock ?? 0
  if (availableStock < quantity) {
    throw new Error(`Insufficient stock available. Only ${availableStock} items in stock.`)
  }

  const item = cart.items.find((i) => i.productId === productId)
  if (item) {
    item.quantity = quantity
    await setCart(cart.items)
  }

  const { total, itemCount } = calculateCartTotals(cart.items)
  return { items: cart.items, total, itemCount }
}

/**
 * Clear all items from the cart
 *
 * @returns Promise<Cart> - Empty cart state
 */
export async function clearCart(): Promise<Cart> {
  await setCart([])
  return { items: [], total: 0, itemCount: 0 }
}

/**
 * Get the number of items in the cart (sum of quantities)
 *
 * @returns Promise<number> - Total item count
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart()
  return cart.itemCount
}

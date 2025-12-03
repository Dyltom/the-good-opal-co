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

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  return { total, itemCount }
}

/**
 * Get the current cart from cookies
 * Safe to call from Server Components and Server Actions
 *
 * @returns Promise<Cart> - The current cart state
 */
export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(CART_COOKIE_NAME)

  if (!cartCookie?.value) {
    return { items: [], total: 0, itemCount: 0 }
  }

  try {
    const items: CartItem[] = JSON.parse(cartCookie.value)

    // Validate that items is an array
    if (!Array.isArray(items)) {
      return { items: [], total: 0, itemCount: 0 }
    }

    const { total, itemCount } = calculateCartTotals(items)
    return { items, total, itemCount }
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
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
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
  const cart = await getCart()
  const existingIndex = cart.items.findIndex((i) => i.productId === item.productId)

  if (existingIndex >= 0) {
    // Increment quantity of existing item
    const existingItem = cart.items[existingIndex]
    if (existingItem) {
      existingItem.quantity += 1
    }
  } else {
    // Add new item with quantity 1
    cart.items.push({ ...item, quantity: 1 })
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
 */
export async function updateCartItemQuantity(productId: string, quantity: number): Promise<Cart> {
  const cart = await getCart()

  if (quantity <= 0) {
    return removeItemFromCart(productId)
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

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

/**
 * Cart item interface
 */
export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Cart Provider
 *
 * Provides shared cart state across all components
 * Fixes hydration and instant update issues
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Add item to cart
  const addItem = useCallback((item: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id)

      if (existingItem) {
        // Increment quantity
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }

      // Add new item
      return [...currentItems, item]
    })
  }, [])

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    )
  }, [])

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Calculate total items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate total price
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/**
 * useCart Hook
 *
 * Access shared cart state from context
 */
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

/**
 * Optimistic cart updates for better UX
 * Updates UI immediately while server action is in progress
 */

import { useOptimistic, useCallback } from 'react'
import type { Cart, CartItem } from '@/lib/cart'

export type OptimisticCartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'REVERT'; cart: Cart }

/**
 * Reducer for optimistic cart updates
 */
function optimisticCartReducer(state: Cart, action: OptimisticCartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.item.productId
      )

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex]!,
          quantity: updatedItems[existingItemIndex]!.quantity + action.item.quantity,
        }

        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        }
      }

      // Add new item
      const newItems = [...state.items, action.item]
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.productId === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      )

      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(
        item => item.productId !== action.productId
      )

      return {
        items: filteredItems,
        total: calculateTotal(filteredItems),
        itemCount: calculateItemCount(filteredItems),
      }
    }

    case 'CLEAR_CART': {
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }
    }

    case 'REVERT': {
      return action.cart
    }

    default:
      return state
  }
}

/**
 * Calculate cart total
 */
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/**
 * Calculate total item count
 */
function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Hook for optimistic cart updates
 */
export function useOptimisticCart(initialCart: Cart) {
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    initialCart,
    optimisticCartReducer
  )

  // Optimistic add to cart
  const optimisticAddToCart = useCallback(
    async (
      item: Omit<CartItem, 'quantity'>,
      serverAction: () => Promise<void>
    ) => {
      // Optimistically update UI
      setOptimisticCart({
        type: 'ADD_ITEM',
        item: { ...item, quantity: 1 },
      })

      try {
        await serverAction()
        // Server action will trigger revalidation
      } catch (error) {
        // Revert on error
        setOptimisticCart({
          type: 'REVERT',
          cart: initialCart,
        })
        throw error
      }
    },
    [setOptimisticCart, initialCart]
  )

  // Optimistic update quantity
  const optimisticUpdateQuantity = useCallback(
    async (
      productId: string,
      quantity: number,
      serverAction: () => Promise<void>
    ) => {
      // Store previous state for rollback
      const previousCart = optimisticCart

      // Optimistically update UI
      setOptimisticCart({
        type: 'UPDATE_QUANTITY',
        productId,
        quantity,
      })

      try {
        await serverAction()
      } catch (error) {
        // Revert on error
        setOptimisticCart({
          type: 'REVERT',
          cart: previousCart,
        })
        throw error
      }
    },
    [setOptimisticCart, optimisticCart]
  )

  // Optimistic remove item
  const optimisticRemoveItem = useCallback(
    async (productId: string, serverAction: () => Promise<void>) => {
      // Store previous state for rollback
      const previousCart = optimisticCart

      // Optimistically update UI
      setOptimisticCart({
        type: 'REMOVE_ITEM',
        productId,
      })

      try {
        await serverAction()
      } catch (error) {
        // Revert on error
        setOptimisticCart({
          type: 'REVERT',
          cart: previousCart,
        })
        throw error
      }
    },
    [setOptimisticCart, optimisticCart]
  )

  return {
    cart: optimisticCart,
    optimisticAddToCart,
    optimisticUpdateQuantity,
    optimisticRemoveItem,
  }
}

/**
 * Hook for animating cart item changes
 */
export function useCartItemAnimation() {
  const getItemAnimation = useCallback((action: 'add' | 'remove' | 'update') => {
    switch (action) {
      case 'add':
        return {
          initial: { opacity: 0, scale: 0.8, y: -20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.8, y: 20 },
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }
      case 'remove':
        return {
          exit: {
            opacity: 0,
            scale: 0.8,
            x: 100,
            transition: { duration: 0.2 }
          },
        }
      case 'update':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 0.3 },
        }
      default:
        return {}
    }
  }, [])

  return { getItemAnimation }
}
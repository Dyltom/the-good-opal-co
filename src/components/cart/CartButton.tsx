'use client'

/**
 * Cart Button Component
 *
 * Shows cart item count and opens cart drawer.
 * Uses server actions for cart data fetching.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { fetchCart } from '@/app/(marketing)/cart/actions'
import type { Cart } from '@/lib/cart'

export function CartButton() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const prevCountRef = useRef(0)

  // Fetch cart data on mount and when cart updates
  const loadCart = useCallback(async () => {
    const result = await fetchCart()
    if (result.success && result.data) {
      setCart(result.data)
      prevCountRef.current = result.data.itemCount
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Listen for cart updates (custom event fired by cart actions)
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCart()
    }
    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [loadCart])

  const itemCount = cart?.itemCount ?? 0
  const itemText = itemCount === 1 ? 'item' : 'items'

  return (
    <CartDrawer onCartUpdate={loadCart}>
      <Button
        variant="outline"
        size="sm"
        className="relative gap-1.5 font-semibold border-opal-blue text-opal-blue hover:bg-opal-blue hover:text-white hover:border-opal-blue transition-all duration-200"
      >
        Cart
        {!isLoading && itemCount > 0 && (
          <span className="text-xs opacity-70">
            ({itemCount} {itemText})
          </span>
        )}
      </Button>
    </CartDrawer>
  )
}

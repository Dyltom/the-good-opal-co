'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useEffect, useState, useRef } from 'react'

/**
 * Cart Button Component
 *
 * Shows cart item count and opens cart drawer
 * Uses localStorage-based cart (ready for Payload ecommerce integration)
 * Includes pulse animation when items are added
 */
export function CartButton() {
  const { itemCount, isLoaded } = useCart()
  const prevCountRef = useRef(itemCount)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Only animate if cart is loaded and count actually increased
    if (isLoaded && itemCount > prevCountRef.current && itemCount > 0) {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 600)
    }
    prevCountRef.current = itemCount
  }, [itemCount, isLoaded])

  // Don't render badge until cart is loaded (prevents hydration mismatch)
  if (!isLoaded) {
    return (
      <CartDrawer>
        <Button variant="outline" size="sm" className="relative">
          🛒 Cart
        </Button>
      </CartDrawer>
    )
  }

  return (
    <CartDrawer>
      <Button variant="outline" size="sm" className="relative">
        🛒 Cart
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs transition-all ${
              animate ? 'animate-ping-once' : ''
            }`}
          >
            {itemCount}
          </Badge>
        )}
      </Button>
    </CartDrawer>
  )
}

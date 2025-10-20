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
        <Button
          variant="outline"
          size="sm"
          className="relative gap-1.5 font-semibold border-opal-blue text-opal-blue hover:bg-opal-blue hover:text-white hover:border-opal-blue transition-all duration-200"
        >
          Cart
        </Button>
      </CartDrawer>
    )
  }

  const itemText = itemCount === 1 ? 'item' : 'items'

  return (
    <CartDrawer>
      <Button
        variant="outline"
        size="sm"
        className="relative gap-1.5 font-semibold border-opal-blue text-opal-blue hover:bg-opal-blue hover:text-white hover:border-opal-blue transition-all duration-200"
      >
        Cart
        {itemCount > 0 && (
          <span className="text-xs opacity-70">
            ({itemCount} {itemText})
          </span>
        )}
      </Button>
    </CartDrawer>
  )
}

'use client'

import { useEffect } from 'react'
import { clearCart } from '../../cart/actions'
import { trackPurchase } from '@/lib/analytics'
import type { CartItem } from '@/lib/cart'

interface PurchaseAnalytics {
  transactionId: string
  items: CartItem[]
  total: number
  shipping: number
  tax: number
}

export function ClearCartOnSuccess({ purchase }: { purchase: PurchaseAnalytics }) {
  useEffect(() => {
    trackPurchase(
      purchase.transactionId,
      purchase.items,
      purchase.total,
      purchase.shipping,
      purchase.tax
    )

    void clearCart().then((result) => {
      if (result.success) window.dispatchEvent(new CustomEvent('cart-updated'))
    })
  }, [purchase])

  return null
}

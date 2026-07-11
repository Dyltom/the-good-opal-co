'use client'

import { useEffect } from 'react'
import { clearCart } from '../../cart/actions'

export function ClearCartOnSuccess() {
  useEffect(() => {
    void clearCart().then((result) => {
      if (result.success) window.dispatchEvent(new CustomEvent('cart-updated'))
    })
  }, [])

  return null
}

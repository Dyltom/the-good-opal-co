'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatedCartDrawer } from '@/components/cart/AnimatedCartDrawer'
import { fetchCart } from '@/app/(marketing)/cart/actions'

export function CartButton() {
  const [itemCount, setItemCount] = useState<number | null>(null)

  const loadCart = useCallback(async () => {
    const result = await fetchCart()
    setItemCount(result.success && result.data ? result.data.itemCount : 0)
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [loadCart])

  const count = itemCount ?? 0

  return (
    <AnimatedCartDrawer>
      <button
        type="button"
        aria-label={`Bag, ${count} ${count === 1 ? 'item' : 'items'}`}
        className="inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-sm border border-rule-2 px-2.5 py-1.5 text-[13.5px] text-ink transition-colors hover:border-ink-2 md:px-3 md:py-[7px]"
      >
        <span className="hidden md:inline">Bag</span>
        <svg
          className="h-[18px] w-[18px] flex-none fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M5.5 8h13l-1 12.5h-11z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
        <b className="min-w-[1ch] font-medium tabular-nums">{itemCount ?? ''}</b>
      </button>
    </AnimatedCartDrawer>
  )
}

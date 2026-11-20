'use client'

import { useRef, useState, useTransition } from 'react'
import { Lock } from 'lucide-react'
import { createCheckoutSession, type ShippingRegion } from '@/app/(marketing)/checkout/actions'
import { Button } from '@/components/ui/button'
import { trackBeginCheckout, trackCheckoutError } from '@/lib/analytics'
import type { Cart } from '@/lib/cart'
import { cn } from '@/lib/utils'

export type { ShippingRegion }

interface ShippingRegionToggleProps {
  value: ShippingRegion
  onChange: (region: ShippingRegion) => void
  className?: string
}

const REGIONS: { value: ShippingRegion; label: string }[] = [
  { value: 'AU', label: 'Australia' },
  { value: 'INTL', label: 'Overseas' },
]

export function ShippingRegionToggle({ value, onChange, className }: ShippingRegionToggleProps) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/60">
        Shipping to
      </legend>
      <div className="grid grid-cols-2 border border-warm-grey/70 bg-white p-0.5">
        {REGIONS.map((region) => (
          <label
            key={region.value}
            className={cn(
              'cursor-pointer px-3 py-2 text-center text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-opal-electric-accessible',
              value === region.value ? 'bg-charcoal text-cream' : 'text-charcoal/70 hover:text-charcoal'
            )}
          >
            <input
              type="radio"
              name="shipping-region"
              value={region.value}
              checked={value === region.value}
              onChange={() => onChange(region.value)}
              className="sr-only"
            />
            {region.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface CheckoutButtonProps {
  cart: Cart
  region: ShippingRegion
  className?: string
  label?: string
}

export function CheckoutButton({ cart, region, className, label = 'Checkout' }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const attemptId = useRef<string>(null)

  const startCheckout = () => {
    setError(undefined)
    attemptId.current ??= crypto.randomUUID()
    const checkoutAttemptId = attemptId.current
    startTransition(async () => {
      trackBeginCheckout(cart.items, cart.total)
      const result = await createCheckoutSession({ region, checkoutAttemptId })
      if (result.success && result.url) {
        window.location.assign(result.url)
        return
      }
      attemptId.current = null
      const message = result.error ?? 'Payment could not be started. Please try again.'
      trackCheckoutError(message)
      setError(message)
    })
  }

  return (
    <div className="min-w-0">
      <Button
        type="button"
        size="lg"
        onClick={startCheckout}
        disabled={isPending || cart.items.length === 0}
        aria-busy={isPending}
        className={cn('w-full bg-opal-electric-accessible bg-none hover:bg-opal-deep', className)}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Opening secure checkout' : label}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-fire-coral">
          {error}
        </p>
      ) : null}
    </div>
  )
}

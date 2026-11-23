'use client'

import { useCallback, useRef, useState, useSyncExternalStore, useTransition } from 'react'
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

const REGION_COOKIE = 'shipping-region'

function readRegion(): ShippingRegion | undefined {
  const match = document.cookie.match(/(?:^|; )shipping-region=(AU|INTL)(?:;|$)/)
  return match ? (match[1] as ShippingRegion) : undefined
}

function subscribeToRegion(onChange: () => void) {
  window.addEventListener(REGION_COOKIE, onChange)
  return () => window.removeEventListener(REGION_COOKIE, onChange)
}

export function useShippingRegion(initialRegion: ShippingRegion = 'AU') {
  const region = useSyncExternalStore(
    subscribeToRegion,
    () => readRegion() ?? initialRegion,
    () => initialRegion
  )
  const setRegion = useCallback((next: ShippingRegion) => {
    document.cookie = `${REGION_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    window.dispatchEvent(new Event(REGION_COOKIE))
  }, [])
  return [region, setRegion] as const
}

export function ShippingRegionToggle({ value, onChange, className }: ShippingRegionToggleProps) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
        Shipping to
      </legend>
      <div className="grid grid-cols-2 border border-rule bg-bg p-0.5">
        {REGIONS.map((region) => (
          <label
            key={region.value}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center px-3 text-center text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-accent',
              value === region.value ? 'bg-ink text-bg' : 'text-ink-2 hover:text-ink'
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
  giftVoucherCode?: string | undefined
}

export function CheckoutButton({
  cart,
  region,
  className,
  label = 'Checkout',
  giftVoucherCode,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const attemptId = useRef<string>(null)

  const startCheckout = () => {
    setError(undefined)
    attemptId.current ??= crypto.randomUUID()
    const checkoutAttemptId = attemptId.current
    startTransition(async () => {
      trackBeginCheckout(cart.items, cart.total)
      const result = await createCheckoutSession({ region, checkoutAttemptId, giftVoucherCode })
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
        className={cn('w-full', className)}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Opening secure checkout' : label}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

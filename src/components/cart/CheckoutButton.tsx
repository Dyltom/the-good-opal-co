'use client'

import { useCallback, useId, useRef, useState, useSyncExternalStore, useTransition } from 'react'
import { Lock } from 'lucide-react'
import { createCheckoutSession } from '@/app/(marketing)/checkout/actions'
import { Button } from '@/components/ui/button'
import { trackBeginCheckout, trackCheckoutError } from '@/lib/analytics'
import type { Cart } from '@/lib/cart'
import {
  isShippingCountry,
  SHIPPING_COUNTRIES,
  SHIPPING_COUNTRY_NAMES,
  type ShippingCountry,
} from '@/lib/constants/shipping'
import { cn } from '@/lib/utils'

const COUNTRY_COOKIE = 'shipping-country'

function readCountry(): ShippingCountry | undefined {
  const value = document.cookie.match(/(?:^|; )shipping-country=([A-Z]{2})(?:;|$)/)?.[1]
  return isShippingCountry(value) ? value : undefined
}

function subscribeToCountry(onChange: () => void) {
  window.addEventListener(COUNTRY_COOKIE, onChange)
  return () => window.removeEventListener(COUNTRY_COOKIE, onChange)
}

export function useShippingCountry(initialCountry: ShippingCountry = 'AU') {
  const country = useSyncExternalStore(
    subscribeToCountry,
    () => readCountry() ?? initialCountry,
    () => initialCountry
  )
  const setCountry = useCallback((next: ShippingCountry) => {
    document.cookie = `${COUNTRY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    window.dispatchEvent(new Event(COUNTRY_COOKIE))
  }, [])
  return [country, setCountry] as const
}

interface ShippingCountrySelectProps {
  value: ShippingCountry
  onChange: (country: ShippingCountry) => void
  className?: string
}

export function ShippingCountrySelect({ value, onChange, className }: ShippingCountrySelectProps) {
  const id = useId()
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-2 block text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
        Shipping to
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          if (isShippingCountry(next)) onChange(next)
        }}
        className="flex h-11 w-full rounded-sm border border-rule-2 bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        {SHIPPING_COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {SHIPPING_COUNTRY_NAMES[country]}
          </option>
        ))}
      </select>
    </div>
  )
}

interface CheckoutButtonProps {
  cart: Cart
  country: ShippingCountry
  className?: string
  label?: string
  giftVoucherCode?: string | undefined
}

export function CheckoutButton({
  cart,
  country,
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
      const result = await createCheckoutSession({ country, checkoutAttemptId, giftVoucherCode })
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

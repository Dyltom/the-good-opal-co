'use client'

import { useCallback, useId, useRef, useState, useSyncExternalStore, useTransition } from 'react'
import { Lock } from 'lucide-react'
import { createCheckoutSession, createPayPalCheckout } from '@/app/(marketing)/checkout/actions'
import { Button } from '@/components/ui/button'
import { trackBeginCheckout, trackCheckoutError } from '@/lib/analytics'
import type { Cart } from '@/lib/cart'
import { calculateCheckoutPricing } from '@/lib/checkout-pricing'
import {
  isShippingCountry,
  SHIPPING_COUNTRIES,
  SHIPPING_COUNTRY_NAMES,
  shippingRestriction,
  type ShippingCountry,
} from '@/lib/constants/shipping'
import { cn } from '@/lib/utils'
import type { CheckoutEmail } from './CheckoutEmailFields'

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
  contact?: CheckoutEmail | undefined
}

export function CheckoutButton({
  cart,
  country,
  className,
  label = 'Checkout',
  giftVoucherCode,
  contact,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const attemptId = useRef<string>(null)
  const restriction = shippingRestriction(country, cart.items)

  const startCheckout = () => {
    setError(undefined)
    attemptId.current ??= crypto.randomUUID()
    const checkoutAttemptId = attemptId.current
    startTransition(async () => {
      trackBeginCheckout(cart.items, cart.total)
      const result = await createCheckoutSession({
        country,
        checkoutAttemptId,
        giftVoucherCode,
        email: contact?.email.trim() || undefined,
        marketingConsent: contact?.marketingConsent === true,
        js: '1',
      })
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
        disabled={isPending || cart.items.length === 0 || restriction !== null}
        aria-busy={isPending}
        className={cn('w-full', className)}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Opening secure checkout' : label}
      </Button>
      {restriction || error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {restriction ?? error}
        </p>
      ) : null}
    </div>
  )
}

function PayPalWordmark() {
  return (
    <svg viewBox="0 0 92 28" className="h-6 w-auto" aria-hidden="true" focusable="false">
      <text
        x="0"
        y="22"
        fontFamily="Verdana, Arial, sans-serif"
        fontSize="23"
        fontStyle="italic"
        fontWeight="700"
      >
        <tspan className="fill-paypal-blue">Pay</tspan>
        <tspan className="fill-paypal-sky">Pal</tspan>
      </text>
    </svg>
  )
}

interface PayPalCheckoutButtonProps {
  cart: Cart
  country: ShippingCountry
  contact?: CheckoutEmail | undefined
  className?: string
}

export function PayPalCheckoutButton({ cart, country, contact, className }: PayPalCheckoutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const attemptId = useRef<string>(null)
  const restriction = shippingRestriction(country, cart.items)
  const pricing = calculateCheckoutPricing(cart.items, country)
  const shipsBy = pricing.shippedSubtotal > 0 ? pricing.shippingOptions[0]?.label : undefined

  const startCheckout = () => {
    setError(undefined)
    attemptId.current ??= crypto.randomUUID()
    const checkoutAttemptId = attemptId.current
    startTransition(async () => {
      trackBeginCheckout(cart.items, cart.total)
      const result = await createPayPalCheckout({
        country,
        checkoutAttemptId,
        email: contact?.email.trim() || undefined,
        marketingConsent: contact?.marketingConsent === true,
        js: '1',
      })
      if (result.success && result.url) {
        window.location.assign(result.url)
        return
      }
      attemptId.current = null
      const message = result.error ?? 'PayPal could not be started. Please try again.'
      trackCheckoutError(message)
      setError(message)
    })
  }

  return (
    <div className={cn('min-w-0', className)}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isPending || cart.items.length === 0 || restriction !== null}
        aria-busy={isPending}
        aria-label="Pay with PayPal"
        className="flex h-12 w-full items-center justify-center rounded-sm bg-paypal transition-colors hover:bg-paypal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="text-sm font-medium text-paypal-blue">Opening PayPal</span>
        ) : (
          <PayPalWordmark />
        )}
      </button>
      <p className="mt-2 text-[12.5px] leading-5 text-ink-2">
        {shipsBy ? `PayPal orders ship by ${shipsBy}; codes` : 'Codes'} and gift vouchers apply at
        card checkout.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

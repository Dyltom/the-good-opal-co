'use client'

import { useCallback, useId, useRef, useState, useSyncExternalStore, useTransition } from 'react'
import { ChevronDown, Lock } from 'lucide-react'
import { createCheckoutSession, createPayPalCheckout } from '@/app/(marketing)/checkout/actions'
import { Button } from '@/components/ui/button'
import { trackBeginCheckout, trackCheckoutError } from '@/lib/analytics'
import type { Cart } from '@/lib/cart'
import {
  isShippingCountry,
  SHIPPING_COUNTRIES,
  SHIPPING_COUNTRY_NAMES,
  shippingRestriction,
  type Postage,
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
}

export function ShippingCountrySelect({ value, onChange }: ShippingCountrySelectProps) {
  const id = useId()
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <label htmlFor={id} className="text-ink-2">
        Shipping to
      </label>
      <span className="relative inline-flex items-center">
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (isShippingCountry(next)) onChange(next)
          }}
          className="min-h-11 cursor-pointer appearance-none bg-transparent pr-5 [field-sizing:content] text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {SHIPPING_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {SHIPPING_COUNTRY_NAMES[country]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-2"
          aria-hidden="true"
        />
      </span>
    </div>
  )
}

interface CheckoutButtonProps {
  cart: Cart
  country: ShippingCountry
  postage?: Postage | undefined
  className?: string
  label?: string
  giftVoucherCode?: string | undefined
  contact?: CheckoutEmail | undefined
}

export function CheckoutButton({
  cart,
  country,
  postage,
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
        postage,
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
  postage: Postage
  contact?: CheckoutEmail | undefined
}

export function PayPalCheckoutButton({ cart, country, postage, contact }: PayPalCheckoutButtonProps) {
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
      const result = await createPayPalCheckout({
        country,
        postage,
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
    <div className="min-w-0">
      <button
        type="button"
        onClick={startCheckout}
        disabled={isPending || cart.items.length === 0 || restriction !== null}
        aria-busy={isPending}
        aria-label="Pay with PayPal"
        className="flex min-h-[52px] w-full items-center justify-center rounded-sm bg-paypal transition-colors hover:bg-paypal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="text-sm font-medium text-paypal-blue">Opening PayPal</span>
        ) : (
          <PayPalWordmark />
        )}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

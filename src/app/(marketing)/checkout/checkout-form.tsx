'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle, LockKeyhole, PackageCheck, RotateCcw, ShoppingBag, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { trackBeginCheckout } from '@/lib/analytics'
import { calculateCheckoutPricing } from '@/lib/checkout-pricing'
import type { Cart } from '@/lib/cart'
import { cn, formatCurrency } from '@/lib/utils'
import { createCheckoutSession } from './actions'
import {
  CHECKOUT_COUNTRIES,
  CHECKOUT_NAME_MAX_LENGTH,
  type CheckoutCountry,
  validateCheckoutEmail,
  validateCheckoutName,
} from './validation'

const countryLabels: Record<CheckoutCountry, string> = {
  AU: 'Australia',
  NZ: 'New Zealand',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  SG: 'Singapore',
  HK: 'Hong Kong',
  JP: 'Japan',
}

interface CheckoutFormProps {
  cart: Cart
}

interface FormErrors {
  name?: string
  email?: string
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<{
    name: string
    email: string
    country: CheckoutCountry
  }>({
    name: '',
    email: '',
    country: 'AU',
  })
  const [touchedFields, setTouchedFields] = useState<Set<keyof FormErrors>>(new Set())
  const [errors, setErrors] = useState<FormErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const checkoutAttemptRef = useRef<string | null>(null)
  const { toast } = useToast()
  const pricing = calculateCheckoutPricing(
    cart.total,
    formData.country === 'AU' ? 'AUSTRALIA' : 'INTERNATIONAL'
  )

  const validateField = (name: keyof FormErrors, value: string) =>
    name === 'name' ? validateCheckoutName(value) : validateCheckoutEmail(value)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof FormErrors
    const value = event.target.value
    setFormData((current) => ({ ...current, [field]: value }))

    if (touchedFields.has(field)) {
      setErrors((current) => ({ ...current, [field]: validateField(field, value) }))
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof FormErrors
    setTouchedFields((current) => new Set(current).add(field))
    setErrors((current) => ({
      ...current,
      [field]: validateField(field, event.target.value),
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {
      name: validateCheckoutName(formData.name),
      email: validateCheckoutEmail(formData.email),
    }
    setTouchedFields(new Set(['name', 'email']))
    setErrors(nextErrors)

    if (nextErrors.name || nextErrors.email) {
      const firstInvalidField = nextErrors.name ? nameRef.current : emailRef.current
      firstInvalidField?.focus()
      return
    }

    startTransition(async () => {
      trackBeginCheckout(cart.items, pricing.total)

      const form = new FormData()
      form.set('name', formData.name.trim())
      form.set('email', formData.email.trim())
      form.set('country', formData.country)
      const checkoutAttemptId = checkoutAttemptRef.current ?? crypto.randomUUID()
      checkoutAttemptRef.current = checkoutAttemptId
      form.set('checkoutAttemptId', checkoutAttemptId)
      const result = await createCheckoutSession(form)

      if (result.success && result.url) {
        window.location.assign(result.url)
        return
      }

      checkoutAttemptRef.current = null

      toast({
        title: 'Payment could not be started',
        description: result.error ?? 'Try again. If the problem continues, contact us for help.',
        variant: 'destructive',
      })
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="min-w-0 space-y-8">
        <section aria-labelledby="contact-heading" className="border-t border-warm-grey/50 pt-6">
          <h2 id="contact-heading" className="font-serif text-2xl font-semibold text-charcoal">
            Contact details
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal/70">
            We use these details for your receipt and order updates. Delivery details are entered on
            the secure payment page.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={CHECKOUT_NAME_MAX_LENGTH}
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={cn(
                  'h-12 bg-white text-base',
                  touchedFields.has('name') && errors.name && 'border-fire-coral'
                )}
                aria-invalid={touchedFields.has('name') && Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                disabled={isPending}
                required
              />
              {touchedFields.has('name') && errors.name && (
                <p id="name-error" className="flex gap-2 text-sm text-fire-coral" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={cn(
                  'h-12 bg-white text-base',
                  touchedFields.has('email') && errors.email && 'border-fire-coral'
                )}
                aria-invalid={touchedFields.has('email') && Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : 'email-help'}
                disabled={isPending}
                required
              />
              {touchedFields.has('email') && errors.email ? (
                <p id="email-error" className="flex gap-2 text-sm text-fire-coral" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errors.email}
                </p>
              ) : (
                <p id="email-help" className="text-sm text-charcoal/60">
                  Your receipt and tracking updates go here.
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 max-w-md space-y-2">
            <Label htmlFor="country">Delivery country or region</Label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  country: event.target.value as CheckoutCountry,
                }))
              }
              className="h-12 w-full rounded-md border border-warm-grey bg-white px-3 text-base text-charcoal outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
              disabled={isPending}
            >
              {CHECKOUT_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {countryLabels[country]}
                </option>
              ))}
            </select>
            <p className="text-sm text-charcoal/60">Your full address is entered on Stripe next.</p>
          </div>
        </section>

        <section aria-labelledby="payment-heading" className="border-t border-warm-grey/50 pt-6">
          <h2 id="payment-heading" className="font-serif text-2xl font-semibold text-charcoal">
            Delivery and payment
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-3">
              <LockKeyhole
                className="mt-0.5 h-5 w-5 shrink-0 text-opal-electric-accessible"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-charcoal">Secure payment</p>
                <p className="mt-1 text-sm leading-5 text-charcoal/65">Processed by Stripe.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Truck
                className="mt-0.5 h-5 w-5 shrink-0 text-opal-electric-accessible"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-charcoal">Tracked delivery</p>
                <p className="mt-1 text-sm leading-5 text-charcoal/65">Address collected next.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <PackageCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-opal-electric-accessible"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-charcoal">Order confirmation</p>
                <p className="mt-1 text-sm leading-5 text-charcoal/65">
                  Review details before paying.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw
                className="mt-0.5 h-5 w-5 shrink-0 text-opal-electric-accessible"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-charcoal">Returns</p>
                <p className="mt-1 text-sm leading-5 text-charcoal/65">
                  Change of mind is covered.{' '}
                  <Link
                    href="/returns"
                    className="underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                  >
                    See what&apos;s included
                  </Link>{' '}
                  before you order.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside
        className="min-w-0 lg:sticky lg:top-24 lg:self-start"
        aria-labelledby="summary-heading"
      >
        <div className="border border-warm-grey/60 bg-cream p-5 sm:p-6">
          <h2
            id="summary-heading"
            className="flex items-center gap-2 font-serif text-2xl font-semibold text-charcoal"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Order summary
          </h2>

          <div className="mt-5 max-h-72 space-y-4 overflow-y-auto border-y border-warm-grey/50 py-4">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex min-w-0 gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden bg-white">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-charcoal/40"
                      aria-hidden="true"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold leading-5 text-charcoal">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-charcoal/60">Quantity {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-charcoal">
                  {formatCurrency(item.price * item.quantity, 'AUD')}
                </p>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-3 text-sm text-charcoal">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(pricing.subtotal, 'AUD')}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Shipping</dt>
              <dd className="tabular-nums">
                {pricing.shipping === 0 ? 'Free' : formatCurrency(pricing.shipping, 'AUD')}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-warm-grey/50 pt-4 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(pricing.total, 'AUD')}</dd>
            </div>
          </dl>

          {pricing.freeShippingRemaining > 0 ? (
            <p className="mt-3 text-xs leading-5 text-charcoal/65">
              Add {formatCurrency(pricing.freeShippingRemaining, 'AUD')} to qualify for free
              shipping.
            </p>
          ) : (
            <p className="mt-3 text-xs leading-5 text-charcoal/65">
              This order qualifies for free shipping.
            </p>
          )}

          <Button
            className="mt-6 h-12 w-full bg-opal-electric-accessible bg-none text-base hover:bg-opal-deep"
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
          >
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            {isPending ? 'Opening secure payment…' : 'Continue to secure payment'}
          </Button>

          <p className="mt-4 text-xs leading-5 text-charcoal/60">
            By continuing, you agree to our{' '}
            <Link
              href="/legal/terms"
              className="underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              terms
            </Link>{' '}
            and{' '}
            <Link
              href="/legal/privacy"
              className="underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  )
}

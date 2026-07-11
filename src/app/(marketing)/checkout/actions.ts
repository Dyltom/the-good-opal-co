'use server'

/**
 * Checkout Server Actions
 *
 * Handles Stripe checkout session creation.
 * Uses Server Actions instead of API routes for cleaner architecture.
 */

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { z } from 'zod'
import { getCart } from '@/lib/cart'
import {
  calculateCheckoutPricing,
  calculateCheckoutSubtotal,
  dollarsToCents,
} from '@/lib/checkout-pricing'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { APP_URL } from '@/lib/constants'
import { CHECKOUT_COUNTRIES } from './validation'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import {
  checkoutReservationExpiresAt,
  findReservationByToken,
  INVENTORY_RESERVATION_METADATA_KEY,
  InventoryUnavailableError,
  reserveCheckoutInventory,
} from '@/lib/inventory-reservations'

// Validation schema for checkout form
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z
    .string()
    .trim()
    .min(1, 'Please enter the name for this order')
    .max(100, 'Name must be 100 characters or fewer'),
  country: z.enum(CHECKOUT_COUNTRIES),
  checkoutAttemptId: z.string().uuid('Invalid checkout attempt'),
})

/**
 * Result type for checkout action
 */
interface CheckoutResult {
  success: boolean
  error?: string
  url?: string
}

/**
 * Create a Stripe Checkout Session
 *
 * @param formData - Form data containing customer email and name
 * @returns Result with checkout URL or error
 */
export async function createCheckoutSession(formData: FormData): Promise<CheckoutResult> {
  // Validate form data
  const validationResult = checkoutSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    country: formData.get('country'),
    checkoutAttemptId: formData.get('checkoutAttemptId'),
  })

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message ?? 'Invalid form data',
    }
  }

  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    return {
      success: false,
      error: 'Payment processing is not configured. Please contact support.',
    }
  }

  try {
    const { email, name, country, checkoutAttemptId } = validationResult.data
    const identifier = await getRequestIdentifier(email)
    const allowed = await checkRateLimit({
      scope: 'checkout',
      identifier,
      limit: 10,
      windowSeconds: 15 * 60,
    })
    if (!allowed) {
      return { success: false, error: 'Too many checkout attempts. Please try again later.' }
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-06-24.dahlia',
    })
    const existingReservation = await findReservationByToken(checkoutAttemptId)
    if (
      existingReservation &&
      (existingReservation.status === 'active' || existingReservation.status === 'pending-payment')
    ) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingReservation.stripeSessionId
      )
      if (existingSession.status === 'open' && existingSession.url) {
        return { success: true, url: existingSession.url }
      }
    }

    // Read the cart only after replaying an existing attempt. Reserving the last
    // unit intentionally removes it from sellable stock, so a network retry may
    // otherwise appear to have an empty cart and lose its valid Stripe URL.
    const cart = await getCart()
    if (cart.items.length === 0) {
      return {
        success: false,
        error: 'Your cart is empty. Please add items before checking out.',
      }
    }

    const subtotal = calculateCheckoutSubtotal(cart.items)
    const destination = country === 'AU' ? 'AUSTRALIA' : 'INTERNATIONAL'
    const pricing = calculateCheckoutPricing(subtotal, destination)
    const expiresAt = checkoutReservationExpiresAt()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        client_reference_id: checkoutAttemptId,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        customer_email: email,
        line_items: cart.items.map((item) => ({
          price_data: {
            currency: 'aud',
            product_data: {
              name: item.name,
              images: item.image?.startsWith('http') ? [item.image] : [],
              metadata: {
                productId: item.productId,
                slug: item.slug,
              },
            },
            unit_amount: dollarsToCents(item.price),
          },
          quantity: item.quantity,
        })),
        shipping_address_collection: {
          allowed_countries: [country],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: pricing.shippingCents,
                currency: 'aud',
              },
              display_name:
                pricing.shippingCents === 0
                  ? 'Free tracked shipping'
                  : destination === 'AUSTRALIA'
                    ? 'Australia tracked shipping'
                    : 'International tracked shipping',
            },
          },
        ],
        metadata: {
          customerName: name,
          shippingCountry: country,
          [INVENTORY_RESERVATION_METADATA_KEY]: checkoutAttemptId,
        },
        success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/cart`,
      },
      { idempotencyKey: `checkout/${checkoutAttemptId}` }
    )

    if (session.status !== 'open' || !session.url) {
      throw new Error('Stripe checkout attempt is no longer open')
    }

    try {
      await reserveCheckoutInventory({
        token: checkoutAttemptId,
        stripeSessionId: session.id,
        expiresAt,
        items: cart.items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          unitAmountCents: dollarsToCents(item.price),
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      try {
        if (session.status === 'open') await stripe.checkout.sessions.expire(session.id)
      } catch (expireError) {
        console.error('Failed to expire unreserved Stripe session:', expireError)
      }
      throw error
    }

    // Return the URL for client-side redirect
    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error('Stripe checkout error:', error)

    if (error instanceof InventoryUnavailableError) {
      return {
        success: false,
        error:
          'One or more pieces were just reserved by another customer. Please review your cart.',
      }
    }

    return {
      success: false,
      error: 'Payment could not be started. Please try again or contact support.',
    }
  }
}

/**
 * Create checkout and redirect
 *
 * Alternative action that redirects directly instead of returning URL
 */
export async function createCheckoutAndRedirect(formData: FormData): Promise<void> {
  const result = await createCheckoutSession(formData)

  if (result.success && result.url) {
    redirect(result.url)
  }

  // If there's an error, we can't redirect, so throw an error
  // The form should handle this with useActionState
  throw new Error(result.error ?? 'Failed to create checkout session')
}

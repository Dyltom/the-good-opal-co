'use server'

import Stripe from 'stripe'
import { z } from 'zod'
import { checkoutHoldToken, getCart, setCheckoutHold } from '@/lib/cart'
import {
  calculateCheckoutPricing,
  calculateCheckoutSubtotal,
  dollarsToCents,
} from '@/lib/checkout-pricing'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { APP_URL } from '@/lib/constants'
import { SHIPPING_COUNTRIES } from '@/lib/constants/shipping'
import { INSIGHTS_VISITOR_METADATA_KEY } from '@/lib/insights/events'
import { recordServerError } from '@/lib/insights/record'
import { requestVisitorKey } from '@/lib/insights/visitor'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import {
  checkoutReservationExpiresAt,
  findReservationByToken,
  INVENTORY_RESERVATION_METADATA_KEY,
  InventoryUnavailableError,
  releaseInventoryReservation,
  reserveCheckoutInventory,
} from '@/lib/inventory-reservations'

const checkoutSchema = z.object({
  region: z.enum(['AU', 'INTL']),
  checkoutAttemptId: z.string().uuid('Invalid checkout attempt'),
})

export type ShippingRegion = z.infer<typeof checkoutSchema>['region']

function publicUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  const url = new URL(path, APP_URL)
  return url.protocol === 'https:' ? url.href : undefined
}

async function releaseReplacedCheckout(stripe: Stripe, checkoutAttemptId: string): Promise<void> {
  const token = await checkoutHoldToken()
  if (!token || token === checkoutAttemptId) return
  const reservation = await findReservationByToken(token)
  if (reservation?.status !== 'active') return
  const session = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId)
  if (session.status === 'complete') return
  const closed = session.status === 'open' ? await stripe.checkout.sessions.expire(session.id) : session
  await releaseInventoryReservation(closed, 'checkout-replaced')
}

interface CheckoutResult {
  success: boolean
  error?: string
  url?: string
}

export async function createCheckoutSession(input: {
  region: ShippingRegion
  checkoutAttemptId: string
}): Promise<CheckoutResult> {
  const validationResult = checkoutSchema.safeParse(input)

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
    const { region, checkoutAttemptId } = validationResult.data
    const identifier = await getRequestIdentifier()
    const insightsVisitor = await requestVisitorKey()
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
    await releaseReplacedCheckout(stripe, checkoutAttemptId)
    const cart = await getCart()
    if (cart.items.length === 0) {
      return {
        success: false,
        error: 'Your cart is empty. Please add items before checking out.',
      }
    }

    const subtotal = calculateCheckoutSubtotal(cart.items)
    const destination = region === 'AU' ? 'AUSTRALIA' : 'INTERNATIONAL'
    const pricing = calculateCheckoutPricing(subtotal, destination)
    const expiresAt = checkoutReservationExpiresAt()
    const brandIcon = publicUrl('/logo.png')

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        client_reference_id: checkoutAttemptId,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        phone_number_collection: { enabled: true },
        custom_text: { submit: { message: 'Prices and shipping are in AUD and include GST.' } },
        branding_settings: {
          display_name: 'The Good Opal Co',
          background_color: '#FAF9F6',
          button_color: '#2C2C2C',
          border_style: 'rounded',
          ...(brandIcon ? { icon: { type: 'url' as const, url: brandIcon } } : {}),
        },
        line_items: cart.items.map((item) => ({
          price_data: {
            currency: 'aud',
            product_data: {
              name: item.name,
              images: [publicUrl(item.image)].filter((url) => url !== undefined),
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
          allowed_countries: [...SHIPPING_COUNTRIES[destination]],
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
          [INVENTORY_RESERVATION_METADATA_KEY]: checkoutAttemptId,
          ...(insightsVisitor ? { [INSIGHTS_VISITOR_METADATA_KEY]: insightsVisitor } : {}),
        },
        success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/cart?checkout=cancelled`,
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

    await setCheckoutHold(checkoutAttemptId, expiresAt)
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

    await recordServerError({ kind: 'checkout', path: '/checkout', error })
    return {
      success: false,
      error: 'Payment could not be started. Please try again or contact support.',
    }
  }
}


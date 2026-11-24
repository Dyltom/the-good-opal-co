'use server'

import Stripe from 'stripe'
import { z } from 'zod'
import { checkoutHoldToken, getCart, setCheckoutHold } from '@/lib/cart'
import {
  calculateCheckoutPricing,
  dollarsToCents,
} from '@/lib/checkout-pricing'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { APP_URL } from '@/lib/constants'
import { DISPATCH_BUSINESS_DAYS, SHIPPING_COUNTRIES } from '@/lib/constants/shipping'
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
import {
  GIFT_VOUCHER_METADATA_KEY,
  holdGiftVoucher,
  lookupGiftVoucher,
  releaseGiftVoucherHold,
} from '@/lib/gift-vouchers'
import { giftVoucherProblemMessage } from '@/lib/gift-voucher-rules'

const checkoutSchema = z.object({
  country: z.enum(SHIPPING_COUNTRIES),
  checkoutAttemptId: z.string().uuid('Invalid checkout attempt'),
  giftVoucherCode: z.string().trim().max(40).optional(),
})

const giftVoucherCodeSchema = z.string().trim().min(1, 'Enter a gift voucher code').max(40)

export type GiftVoucherCheck =
  | { ok: true; code: string; available: number; expiresAt: string }
  | { ok: false; error: string }

export async function checkGiftVoucher(input: string): Promise<GiftVoucherCheck> {
  const parsed = giftVoucherCodeSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Enter a gift voucher code' }
  }
  const allowed = await checkRateLimit({
    scope: 'gift-voucher',
    identifier: await getRequestIdentifier(),
    limit: 10,
    windowSeconds: 15 * 60,
  })
  if (!allowed) {
    return { ok: false, error: 'Too many gift voucher attempts. Please try again in a few minutes.' }
  }
  const result = await lookupGiftVoucher(parsed.data)
  if (!result.ok) return { ok: false, error: giftVoucherProblemMessage(result.problem) }
  return {
    ok: true,
    code: result.code,
    available: result.availableCents / 100,
    expiresAt: result.expiresAt,
  }
}

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
  await releaseGiftVoucherHold(token, closed.id)
}

interface CheckoutResult {
  success: boolean
  error?: string
  url?: string
}

export async function createCheckoutSession(input: {
  country: z.infer<typeof checkoutSchema>['country']
  checkoutAttemptId: string
  giftVoucherCode?: string
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

  let heldVoucherFor: string | null = null
  try {
    const { country, checkoutAttemptId, giftVoucherCode } = validationResult.data
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
        error: 'Your bag is empty. Add a piece before checking out.',
      }
    }

    const pricing = calculateCheckoutPricing(cart.items, country)
    const expiresAt = checkoutReservationExpiresAt()
    const brandIcon = publicUrl('/logo.png')

    let voucher: { code: string; amountCents: number } | null = null
    if (giftVoucherCode) {
      const hold = await holdGiftVoucher({
        code: giftVoucherCode,
        checkoutToken: checkoutAttemptId,
        orderTotalCents: pricing.totalCents,
        holdExpiresAt: expiresAt,
      })
      if (!hold.ok) return { success: false, error: giftVoucherProblemMessage(hold.problem) }
      heldVoucherFor = checkoutAttemptId
      voucher = { code: hold.code, amountCents: hold.amountCents }
    }
    const coupon = voucher
      ? await stripe.coupons.create(
          {
            amount_off: voucher.amountCents,
            currency: 'aud',
            duration: 'once',
            max_redemptions: 1,
            name: `Gift voucher ${voucher.code}`,
          },
          { idempotencyKey: `gift-voucher-coupon/${checkoutAttemptId}/${voucher.amountCents}` }
        )
      : null

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        client_reference_id: checkoutAttemptId,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        phone_number_collection: { enabled: true },
        ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
        custom_text: { submit: { message: 'Prices and shipping are in AUD.' } },
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
          allowed_countries: [country],
        },
        shipping_options: pricing.shippingOptions.map((option) => ({
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: option.cents, currency: 'aud' },
            display_name: option.label,
            ...(option.days.max > 0
              ? {
                  delivery_estimate: {
                    minimum: { unit: 'business_day' as const, value: option.days.min },
                    maximum: {
                      unit: 'business_day' as const,
                      value: option.days.max + DISPATCH_BUSINESS_DAYS.max,
                    },
                  },
                }
              : {}),
          },
        })),
        metadata: {
          [INVENTORY_RESERVATION_METADATA_KEY]: checkoutAttemptId,
          ...(voucher ? { [GIFT_VOUCHER_METADATA_KEY]: voucher.code } : {}),
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
    if (heldVoucherFor) {
      await releaseGiftVoucherHold(heldVoucherFor).catch((releaseError: unknown) =>
        console.error('Failed to release gift voucher hold:', releaseError)
      )
    }

    if (error instanceof InventoryUnavailableError) {
      return {
        success: false,
        error:
          'One or more pieces were just reserved by another customer. Please review your bag.',
      }
    }

    await recordServerError({ kind: 'checkout', path: '/checkout', error })
    return {
      success: false,
      error: 'Payment could not be started. Please try again or contact support.',
    }
  }
}


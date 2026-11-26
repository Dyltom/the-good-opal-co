import { z } from 'zod'
import type { CartItem } from '@/lib/cart'
import { dollarsToCents, type CheckoutPricing } from '@/lib/checkout-pricing'
import { APP_URL } from '@/lib/constants'
import { SHIPPING_COUNTRIES, type ShippingCountry } from '@/lib/constants/shipping'
import { centsToMoney } from '@/lib/paypal'

const REFERENCE_ID_MAX = 256
const ITEM_NAME_MAX = 127
export const RETURN_PATH = '/checkout/paypal/return'

export const PAYPAL_NOTICES = {
  expired:
    'Your PayPal checkout timed out, so the pieces went back on sale. Nothing was charged. Check out again to buy them.',
  country:
    'Your PayPal shipping address is in a different country from the one chosen in your bag. Nothing was charged. Choose that country here and check out again.',
  declined:
    'PayPal declined the payment. Nothing was charged. Try again with another payment method or pay by card.',
  failed:
    'PayPal checkout could not be completed. Nothing was charged. Please try again or pay by card.',
} as const

export type PayPalNotice = keyof typeof PAYPAL_NOTICES

export function isPayPalNotice(value: unknown): value is PayPalNotice {
  return typeof value === 'string' && Object.hasOwn(PAYPAL_NOTICES, value)
}

export function cartNotice(notice: PayPalNotice): string {
  return `/cart?paypal=${notice}`
}

export function paypalSuccessPath(orderId: string): string {
  return `/checkout/success?paypal=${orderId}`
}

export function paypalRetryPath(orderId: string): string {
  return `${RETURN_PATH}?token=${orderId}`
}

export interface PayPalCheckoutContext {
  country: ShippingCountry
  shippingLabel?: string | undefined
  email?: string | undefined
  consentAt?: string | undefined
  visitor?: string | undefined
}

const contextSchema = z.object({
  c: z.enum(SHIPPING_COUNTRIES),
  s: z.string().max(160).optional(),
  e: z.string().email().max(254).optional(),
  m: z.string().max(40).optional(),
  v: z.string().max(120).optional(),
})

function encode(value: z.infer<typeof contextSchema>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function encodeCheckoutContext(context: PayPalCheckoutContext): string {
  const full = {
    c: context.country,
    s: context.shippingLabel,
    e: context.email,
    m: context.consentAt,
    v: context.visitor,
  }
  const attempts = [full, { ...full, v: undefined }, { c: full.c, s: full.s }]
  for (const attempt of attempts) {
    const encoded = encode(attempt)
    if (encoded.length <= REFERENCE_ID_MAX) return encoded
  }
  return encode({ c: full.c })
}

export function decodeCheckoutContext(raw: string | undefined): PayPalCheckoutContext | null {
  if (!raw) return null
  try {
    const parsed = contextSchema.safeParse(
      JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    )
    if (!parsed.success) return null
    return {
      country: parsed.data.c,
      shippingLabel: parsed.data.s,
      email: parsed.data.e,
      consentAt: parsed.data.m,
      visitor: parsed.data.v,
    }
  } catch {
    return null
  }
}

export function buildPayPalOrderBody({
  checkoutAttemptId,
  items,
  pricing,
  context,
}: {
  checkoutAttemptId: string
  items: readonly Pick<CartItem, 'productId' | 'name' | 'price' | 'quantity'>[]
  pricing: CheckoutPricing
  context: PayPalCheckoutContext
}) {
  const itemTotalCents = items.reduce(
    (sum, item) => sum + dollarsToCents(item.price) * item.quantity,
    0
  )
  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: encodeCheckoutContext(context),
        custom_id: checkoutAttemptId,
        invoice_id: checkoutAttemptId,
        description: 'The Good Opal Co order',
        amount: {
          ...centsToMoney(itemTotalCents + pricing.shippingCents),
          breakdown: {
            item_total: centsToMoney(itemTotalCents),
            shipping: centsToMoney(pricing.shippingCents),
          },
        },
        items: items.map((item) => ({
          name: item.name.slice(0, ITEM_NAME_MAX),
          sku: item.productId,
          unit_amount: centsToMoney(dollarsToCents(item.price)),
          quantity: String(item.quantity),
          category: 'PHYSICAL_GOODS',
        })),
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: 'The Good Opal Co',
          shipping_preference: 'GET_FROM_FILE',
          user_action: 'PAY_NOW',
          locale: 'en-AU',
          return_url: `${APP_URL}${RETURN_PATH}`,
          cancel_url: `${APP_URL}/checkout/paypal/cancel`,
        },
      },
    },
  }
}

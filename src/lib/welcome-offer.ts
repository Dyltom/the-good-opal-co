import { randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'

export const WELCOME_OFFER = {
  percentOff: 10,
  validDays: 30,
  couponId: 'newsletter-welcome-10',
} as const

export interface WelcomeCode {
  code: string
  expiresAt: Date
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function newCode(): string {
  return `OPAL-${Array.from(randomBytes(8), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')}`
}

function stripeErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined
}

async function ensureCoupon(stripe: Stripe): Promise<string> {
  try {
    return (await stripe.coupons.retrieve(WELCOME_OFFER.couponId)).id
  } catch (error) {
    if (stripeErrorCode(error) !== 'resource_missing') throw error
  }
  try {
    const coupon = await stripe.coupons.create({
      id: WELCOME_OFFER.couponId,
      percent_off: WELCOME_OFFER.percentOff,
      duration: 'once',
      name: `Welcome ${WELCOME_OFFER.percentOff}% off`,
    })
    return coupon.id
  } catch (error) {
    if (stripeErrorCode(error) === 'resource_already_exists') return WELCOME_OFFER.couponId
    throw error
  }
}

export async function issueWelcomeCode(
  email: string,
  now = new Date()
): Promise<WelcomeCode | undefined> {
  const secretKey = getConfiguredStripeSecretKey()
  if (!secretKey) return undefined
  const stripe = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' })
  const coupon = await ensureCoupon(stripe)
  const expiresAt = new Date(now.getTime() + WELCOME_OFFER.validDays * 24 * 60 * 60 * 1000)
  const promotionCode = await stripe.promotionCodes.create({
    promotion: { type: 'coupon', coupon },
    code: newCode(),
    max_redemptions: 1,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    metadata: { source: 'newsletter-welcome', email },
  })
  return { code: promotionCode.code, expiresAt }
}

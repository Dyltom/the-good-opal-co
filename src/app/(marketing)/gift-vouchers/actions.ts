'use server'

import Stripe from 'stripe'
import { APP_URL } from '@/lib/constants'
import { GIFT_VOUCHER_PURCHASE_METADATA_KEY } from '@/lib/gift-vouchers'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { recordServerError } from '@/lib/insights/record'
import { INSIGHTS_VISITOR_METADATA_KEY } from '@/lib/insights/events'
import { requestVisitorKey } from '@/lib/insights/visitor'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import { giftVoucherOrderSchema, type GiftVoucherOrder } from './schema'

export type GiftVoucherCheckoutResult = { success: true; url: string } | { success: false; error: string }

function giftVoucherCheckoutParams(order: GiftVoucherOrder): Stripe.Checkout.SessionCreateParams {
  const recipientName = order.sendToSelf ? '' : order.recipientName
  const recipientEmail = order.sendToSelf ? '' : order.recipientEmail
  return {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: order.amount * 100,
          product_data: { name: `Gift voucher - $${order.amount}` },
        },
        quantity: 1,
      },
    ],
    custom_text: {
      submit: {
        message: recipientEmail
          ? `The voucher code will be emailed to ${recipientEmail} as soon as payment goes through.`
          : 'The voucher code will be emailed to you as soon as payment goes through.',
      },
    },
    metadata: {
      [GIFT_VOUCHER_PURCHASE_METADATA_KEY]: 'true',
      amount: String(order.amount),
      purchaserName: order.senderName,
      recipientName,
      recipientEmail,
      message: order.message,
    },
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/gift-vouchers`,
  }
}

export async function createGiftVoucherCheckout(input: GiftVoucherOrder): Promise<GiftVoucherCheckoutResult> {
  const parsed = giftVoucherOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Check the voucher details' }
  }
  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    return { success: false, error: 'Payment processing is not configured. Please contact us.' }
  }
  const allowed = await checkRateLimit({
    scope: 'gift-voucher-checkout',
    identifier: await getRequestIdentifier(),
    limit: 10,
    windowSeconds: 15 * 60,
  })
  if (!allowed) return { success: false, error: 'Too many attempts. Please try again in a few minutes.' }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
    const params = giftVoucherCheckoutParams(parsed.data)
    const visitor = await requestVisitorKey()
    const session = await stripe.checkout.sessions.create({
      ...params,
      metadata: { ...params.metadata, ...(visitor ? { [INSIGHTS_VISITOR_METADATA_KEY]: visitor } : {}) },
    })
    if (!session.url) throw new Error('Stripe returned a gift voucher session without a URL')
    return { success: true, url: session.url }
  } catch (error) {
    console.error('Gift voucher checkout error:', error)
    await recordServerError({ kind: 'checkout', path: '/gift-vouchers', error })
    return { success: false, error: 'Payment could not be started. Please try again or contact us.' }
  }
}

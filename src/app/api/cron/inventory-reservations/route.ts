import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
import {
  captureStatus,
  getOrder,
  isPayPalReference,
  PAYPAL_REFERENCE_PREFIX,
  paypalConfigured,
} from '@/lib/paypal'
import { completePayPalReturn } from '@/lib/paypal-checkout'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import {
  markReservationPaymentPending,
  releaseInventoryReservation,
} from '@/lib/inventory-reservations'

export const maxDuration = 30

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(supplied)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

const SETTLED_CAPTURES = new Set(['COMPLETED', 'DECLINED', 'FAILED'])

async function settleHeldPayPalPayments(): Promise<number> {
  if (!paypalConfigured()) return 0
  const payload = await getPayload()
  const held = await payload.find({
    collection: 'inventory-reservations',
    where: { status: { equals: 'pending-payment' } },
    limit: 50,
    overrideAccess: true,
  })
  let settled = 0
  for (const reservation of held.docs) {
    if (!isPayPalReference(reservation.stripeSessionId)) continue
    const orderId = reservation.stripeSessionId.slice(PAYPAL_REFERENCE_PREFIX.length)
    try {
      const status = captureStatus(await getOrder(orderId))
      if (!status || !SETTLED_CAPTURES.has(status)) continue
      await completePayPalReturn(orderId)
      settled += 1
    } catch (error) {
      console.error(`Held PayPal payment ${orderId} could not be re-checked:`, error)
    }
  }
  return settled
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripeSecretKey = getConfiguredStripeSecretKey()
  const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
    : null
  const payload = await getPayload()
  const expired = await payload.find({
    collection: 'inventory-reservations',
    where: {
      and: [
        { status: { equals: 'active' } },
        { expiresAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    limit: 50,
    sort: 'expiresAt',
    overrideAccess: true,
  })

  let released = 0
  let pendingPayment = 0
  let needsFulfilment = 0
  let skipped = 0

  for (const reservation of expired.docs) {
    if (isPayPalReference(reservation.stripeSessionId)) {
      await releaseInventoryReservation(reservation.token, 'checkout-expired')
      released += 1
      continue
    }
    if (!stripe) {
      skipped += 1
      continue
    }
    const session = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId)
    if (session.status === 'open') {
      await stripe.checkout.sessions.expire(session.id)
      await releaseInventoryReservation(reservation.token, 'checkout-expired')
      released += 1
    } else if (session.status === 'expired') {
      await releaseInventoryReservation(reservation.token, 'checkout-expired')
      released += 1
    } else if (session.payment_status === 'paid') {
      needsFulfilment += 1
      console.error(`Paid Stripe session ${session.id} still has an active inventory reservation`)
    } else {
      await markReservationPaymentPending(reservation.token)
      pendingPayment += 1
    }
  }

  const paypalSettled = await settleHeldPayPalPayments()

  return NextResponse.json({
    checked: expired.totalDocs,
    paypalSettled,
    released,
    pendingPayment,
    needsFulfilment,
    ...(skipped ? { skipped, error: 'Stripe is not configured' } : {}),
  })
}

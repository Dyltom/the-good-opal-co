import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
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

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
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

  for (const reservation of expired.docs) {
    const session = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId)
    if (session.status === 'open') {
      const expiredSession = await stripe.checkout.sessions.expire(session.id)
      await releaseInventoryReservation(expiredSession, 'checkout-expired')
      released += 1
    } else if (session.status === 'expired') {
      await releaseInventoryReservation(session, 'checkout-expired')
      released += 1
    } else if (session.payment_status === 'paid') {
      needsFulfilment += 1
      console.error(`Paid Stripe session ${session.id} still has an active inventory reservation`)
    } else {
      await markReservationPaymentPending(session)
      pendingPayment += 1
    }
  }

  return NextResponse.json({
    checked: expired.totalDocs,
    released,
    pendingPayment,
    needsFulfilment,
  })
}

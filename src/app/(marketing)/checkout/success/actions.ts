'use server'

import Stripe from 'stripe'
import {
  JOIN_LIST_FAILED,
  subscribeCheckoutBuyer,
  type JoinListState,
} from '@/lib/newsletter/checkout-buyer'
import { getPayload } from '@/lib/payload'
import { isPayPalOrderId, PAYPAL_REFERENCE_PREFIX } from '@/lib/paypal'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import { isPaidCheckoutStatus } from '@/lib/stripe-fulfillment'

const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/

async function joinListFromPayPalOrder(reference: string): Promise<JoinListState> {
  if (!isPayPalOrderId(reference.slice(PAYPAL_REFERENCE_PREFIX.length))) return JOIN_LIST_FAILED
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'orders',
      where: { stripeSessionId: { equals: reference } },
      limit: 1,
      overrideAccess: true,
    })
    const order = result.docs[0]
    if (!order) return JOIN_LIST_FAILED
    return subscribeCheckoutBuyer(order.customer.email, order.customer.name || undefined)
  } catch (error) {
    console.error('Checkout newsletter opt-in failed:', error)
    return JOIN_LIST_FAILED
  }
}

export async function joinListFromCheckout(reference: string): Promise<JoinListState> {
  if (reference.startsWith(PAYPAL_REFERENCE_PREFIX)) return joinListFromPayPalOrder(reference)
  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!CHECKOUT_SESSION_ID.test(reference) || !stripeSecretKey) return JOIN_LIST_FAILED

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(reference)
    const email = session.customer_details?.email ?? session.customer_email
    if (!isPaidCheckoutStatus(session.payment_status) || !email) return JOIN_LIST_FAILED
    return subscribeCheckoutBuyer(email, session.customer_details?.name ?? undefined)
  } catch (error) {
    console.error('Checkout newsletter opt-in failed:', error)
    return JOIN_LIST_FAILED
  }
}

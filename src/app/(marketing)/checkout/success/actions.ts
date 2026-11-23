'use server'

import Stripe from 'stripe'
import { getNewsletterService } from '@/lib/newsletter/service'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import { isPaidCheckoutStatus } from '@/lib/stripe-fulfillment'

export interface JoinListState {
  status: 'idle' | 'joined' | 'error'
  message: string
}

const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/

export async function joinListFromCheckout(sessionId: string): Promise<JoinListState> {
  const failed: JoinListState = {
    status: 'error',
    message: 'We could not add you just now. Use the sign-up form at the bottom of the page instead.',
  }
  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!CHECKOUT_SESSION_ID.test(sessionId) || !stripeSecretKey) return failed

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_details?.email ?? session.customer_email
    if (!isPaidCheckoutStatus(session.payment_status) || !email) return failed

    const result = await getNewsletterService().subscribe(email, {
      name: session.customer_details?.name ?? undefined,
      source: 'checkout',
      skipConfirmation: true,
      tags: ['buyer'],
    })
    if (result.success) return { status: 'joined', message: 'You are on the list. A welcome email is on its way.' }
    if (/already subscribed/i.test(result.message)) return { status: 'joined', message: 'You are already on the list.' }
    return failed
  } catch (error) {
    console.error('Checkout newsletter opt-in failed:', error)
    return failed
  }
}

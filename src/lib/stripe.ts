/**
 * Stripe Integration
 * Payment processing utilities
 */

import Stripe from 'stripe'

/**
 * Lazy-loaded Stripe client to avoid build-time errors when API key is missing
 */
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env['STRIPE_SECRET_KEY']
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  }
  return stripeClient
}

/**
 * Server-side Stripe instance (lazy-loaded)
 * @deprecated Use getStripeClient() instead for lazy loading
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeClient()[prop as keyof Stripe]
  },
})

/**
 * Create Stripe checkout session
 * @param params - Session parameters
 * @returns Checkout session
 */
export async function createCheckoutSession(params: {
  productId: string
  productName: string
  price: number
  currency?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          product_data: {
            name: params.productName,
          },
          unit_amount: Math.round(params.price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  })

  return session
}

/**
 * Create Stripe checkout session for cart with multiple items
 * @param params - Cart session parameters
 * @returns Checkout session
 */
export async function createCartCheckoutSession(params: {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  currency?: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  shippingAddress?: {
    name: string
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  metadata?: Record<string, string>
}) {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: params.items.map((item) => ({
      price_data: {
        currency: params.currency || 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata,
  })

  return session
}

/**
 * Retrieve a Stripe checkout session
 * @param sessionId - The session ID
 * @returns Checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  const stripe = getStripeClient()
  return await stripe.checkout.sessions.retrieve(sessionId)
}

/**
 * Verify Stripe webhook signature
 * @param payload - Request body
 * @param signature - Stripe signature header
 * @returns Verified event
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient()
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] || ''

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

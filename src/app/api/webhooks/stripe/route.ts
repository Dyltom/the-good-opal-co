import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'

/**
 * Stripe Webhook Handler
 *
 * This is the ONLY API route needed for payment processing.
 * Handles Stripe webhook events to create orders after successful payments.
 *
 * Webhook events handled:
 * - checkout.session.completed: Creates order in Payload
 *
 * Security:
 * - Verifies webhook signature to ensure request is from Stripe
 * - Uses idempotency check to prevent duplicate orders
 */

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '', {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] ?? ''

/**
 * Cart item type from checkout metadata
 */
interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  quantity: number
  image?: string
}

/**
 * Extended checkout session type with shipping details
 * The Stripe SDK types may not include shipping_details depending on API version
 */
interface CheckoutSessionWithShipping extends Stripe.Checkout.Session {
  shipping_details?: {
    name?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  } | null
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `OPAL-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as CheckoutSessionWithShipping

    try {
      const payload = await getPayload()

      // Idempotency check - ensure we don't create duplicate orders
      const existingOrder = await payload.find({
        collection: 'orders',
        where: { stripeSessionId: { equals: session.id } },
        limit: 1,
      })

      if (existingOrder.docs.length > 0) {
        console.log(`Order already exists for session ${session.id}`)
        return NextResponse.json({ received: true, duplicate: true })
      }

      // Parse cart items from metadata
      const cartItemsJson = session.metadata?.cartItems
      if (!cartItemsJson) {
        console.error('No cart items in session metadata')
        return NextResponse.json({ error: 'Missing cart items' }, { status: 400 })
      }

      const items: CartItem[] = JSON.parse(cartItemsJson)
      const customerName = session.metadata?.customerName ?? ''

      // Get shipping details
      const shippingDetails = session.shipping_details

      // Calculate subtotal from items
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Create order in Payload
      const order = await payload.create({
        collection: 'orders',
        data: {
          orderNumber: generateOrderNumber(),
          status: 'processing',
          customer: {
            email: session.customer_email ?? '',
            name: customerName || (shippingDetails?.name ?? ''),
            phone: session.customer_details?.phone ?? undefined,
          },
          shippingAddress: {
            line1: shippingDetails?.address?.line1 ?? '',
            line2: shippingDetails?.address?.line2 ?? undefined,
            city: shippingDetails?.address?.city ?? '',
            state: shippingDetails?.address?.state ?? '',
            postalCode: shippingDetails?.address?.postal_code ?? '',
            country: shippingDetails?.address?.country ?? 'AU',
          },
          items: items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal,
          shipping: session.shipping_cost?.amount_total
            ? session.shipping_cost.amount_total / 100
            : 0,
          tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          total: session.amount_total ? session.amount_total / 100 : subtotal,
          currency: session.currency?.toUpperCase() ?? 'AUD',
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        },
      })

      console.log(`Order created: ${order.orderNumber}`)

      // Update or create customer record for CRM
      const customerEmail = session.customer_email?.toLowerCase()
      if (customerEmail) {
        try {
          const orderTotal = session.amount_total ? session.amount_total / 100 : subtotal

          // Check if customer already exists
          const existingCustomer = await payload.find({
            collection: 'customers',
            where: { email: { equals: customerEmail } },
            limit: 1,
          })

          if (existingCustomer.docs.length > 0) {
            // Update existing customer
            const customer = existingCustomer.docs[0]
            if (customer) {
              const currentTotalOrders =
                typeof customer['totalOrders'] === 'number' ? customer['totalOrders'] : 0
              const currentTotalSpent =
                typeof customer['totalSpent'] === 'number' ? customer['totalSpent'] : 0

              await payload.update({
                collection: 'customers',
                id: customer['id'],
                data: {
                  name: customerName || (shippingDetails?.name ?? customer['name']),
                  phone: session.customer_details?.phone ?? customer['phone'],
                  totalOrders: currentTotalOrders + 1,
                  totalSpent: currentTotalSpent + orderTotal,
                  lastOrderDate: new Date().toISOString(),
                  defaultAddress: {
                    line1: shippingDetails?.address?.line1 ?? '',
                    line2: shippingDetails?.address?.line2 ?? '',
                    city: shippingDetails?.address?.city ?? '',
                    state: shippingDetails?.address?.state ?? '',
                    postalCode: shippingDetails?.address?.postal_code ?? '',
                    country: shippingDetails?.address?.country ?? 'AU',
                  },
                },
              })
              console.log(`Customer updated: ${customerEmail}`)
            }
          } else {
            // Create new customer
            await payload.create({
              collection: 'customers',
              data: {
                email: customerEmail,
                name: customerName || (shippingDetails?.name ?? ''),
                phone: session.customer_details?.phone ?? undefined,
                source: 'checkout',
                totalOrders: 1,
                totalSpent: orderTotal,
                lastOrderDate: new Date().toISOString(),
                defaultAddress: {
                  line1: shippingDetails?.address?.line1 ?? '',
                  line2: shippingDetails?.address?.line2 ?? '',
                  city: shippingDetails?.address?.city ?? '',
                  state: shippingDetails?.address?.state ?? '',
                  postalCode: shippingDetails?.address?.postal_code ?? '',
                  country: shippingDetails?.address?.country ?? 'AU',
                },
              },
            })
            console.log(`Customer created: ${customerEmail}`)
          }
        } catch (customerError) {
          console.error('Failed to update/create customer:', customerError)
          // Don't fail the webhook for customer update errors
        }
      }

      // Decrement stock for each item
      for (const item of items) {
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: item.productId,
          })

          if (product && typeof product.stock === 'number') {
            const newStock = Math.max(0, product.stock - item.quantity)
            await payload.update({
              collection: 'products',
              id: item.productId,
              data: { stock: newStock },
            })
          }
        } catch (stockError) {
          console.error(`Failed to update stock for product ${item.productId}:`, stockError)
          // Don't fail the webhook for stock update errors
        }
      }

      // TODO: Send order confirmation email via Resend
      // This would use the React Email templates

      return NextResponse.json({
        received: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })
    } catch (error) {
      console.error('Error processing checkout.session.completed:', error)
      return NextResponse.json(
        { error: 'Failed to process order' },
        { status: 500 }
      )
    }
  }

  // Handle other event types
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log(`Payment failed for intent: ${paymentIntent.id}`)
    // Could send notification or update order status
  }

  // Return success for unhandled events
  return NextResponse.json({ received: true })
}

/**
 * Stripe requires the raw body for signature verification
 * This config ensures Next.js doesn't parse the body
 */
export const config = {
  api: {
    bodyParser: false,
  },
}

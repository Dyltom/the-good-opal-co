import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { ReactElement } from 'react'
import { randomBytes } from 'node:crypto'
import { getPayload } from '@/lib/payload'
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'
import type { Order } from '@/types/payload-types'
import { getConfiguredStripeSecretKey, getConfiguredStripeWebhookSecret } from '@/lib/stripe-config'
import { calculateRefundAdjustment } from '@/lib/stripe-refunds'
import { getRequiredCheckoutShippingDetails } from '@/lib/stripe-fulfillment'
import {
  requireOrderForPaymentEvent,
  statusToRestoreAfterWonDispute,
} from '@/lib/stripe-order-events'

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

const stripe = new Stripe(getConfiguredStripeSecretKey() ?? 'sk_test_unconfigured_webhook', {
  apiVersion: '2026-06-24.dahlia',
})

const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')

const webhookSecret = getConfiguredStripeWebhookSecret()

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

async function getCheckoutItems(sessionId: string): Promise<CartItem[]> {
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ['data.price.product'],
  })

  return lineItems.data.map((lineItem) => {
    const stripeProduct = lineItem.price?.product
    if (!stripeProduct || typeof stripeProduct === 'string' || stripeProduct.deleted) {
      throw new Error(`Missing Stripe product details for line item ${lineItem.id}`)
    }

    const productId = stripeProduct.metadata['productId']
    const slug = stripeProduct.metadata['slug']
    const quantity = lineItem.quantity
    const unitAmount = lineItem.price?.unit_amount

    if (
      !productId ||
      !slug ||
      !quantity ||
      quantity < 1 ||
      unitAmount === null ||
      unitAmount === undefined
    ) {
      throw new Error(`Invalid Stripe line item ${lineItem.id}`)
    }

    return {
      productId,
      slug,
      name: stripeProduct.name,
      price: unitAmount / 100,
      quantity,
      image: stripeProduct.images[0],
    }
  })
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(8).toString('hex').toUpperCase()
  return `OPAL-${timestamp}-${random}`
}

async function sendOrderConfirmation(order: Order): Promise<void> {
  if (order.confirmationEmailSentAt) return

  const { error } = await resend.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: order.customer.email,
      subject: `Order confirmation - ${order.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? undefined,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping ?? 0,
        tax: order.tax ?? 0,
        total: order.total,
        shippingAddress: {
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2 ?? undefined,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state ?? undefined,
          postalCode: order.shippingAddress.postalCode ?? undefined,
          country: order.shippingAddress.country,
        },
        baseUrl: (process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, ''),
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
        requiresInventoryReview: order.status === 'pending',
      }) as ReactElement,
    },
    { idempotencyKey: `order-confirmation/${order.id}` }
  )

  const payload = await getPayload()
  if (error) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { confirmationEmailError: error.message.slice(0, 1000) },
    })
    throw new Error(`Resend rejected order confirmation: ${error.message}`)
  }

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      confirmationEmailSentAt: new Date().toISOString(),
      confirmationEmailError: null,
    },
  })
}

async function sendInventoryReviewAlert(order: Order): Promise<void> {
  if (order.status !== 'pending' || order.inventoryAlertSentAt) return

  const { error } = await resend.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: process.env['CONTACT_EMAIL'] ?? '',
      subject: `Inventory review required - ${order.orderNumber}`,
      text: [
        `Paid order ${order.orderNumber} requires inventory review before fulfilment.`,
        `Customer: ${order.customer.email}`,
        ...order.items.map((item) => `${item.quantity} × ${item.name} (${item.productId})`),
        `Open the Payload admin order record: ${(process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')}/admin/collections/orders/${order.id}`,
      ].join('\n'),
    },
    { idempotencyKey: `inventory-review/${order.id}` }
  )

  const payload = await getPayload()
  if (error) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { inventoryAlertError: error.message.slice(0, 1000) },
    })
    throw new Error(`Resend rejected inventory alert: ${error.message}`)
  }

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      inventoryAlertSentAt: new Date().toISOString(),
      inventoryAlertError: null,
    },
  })
}

function paymentIntentIdFromCharge(charge: Stripe.Charge): string | null {
  if (typeof charge.payment_intent === 'string') return charge.payment_intent
  return charge.payment_intent?.id ?? null
}

async function findOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentId: { equals: paymentIntentId } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

async function markOrderRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = paymentIntentIdFromCharge(charge)
  if (!paymentIntentId) return

  const payload = await getPayload()
  const isFullyRefunded = charge.refunded && charge.amount_refunded >= charge.amount
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for refunds')
  const req = { transactionID }

  try {
    // Re-read inside the serializable transaction. Concurrent Stripe retries then
    // either observe the committed cumulative amount or fail for Stripe to retry.
    const orderResult = await payload.find({
      collection: 'orders',
      where: { stripePaymentIntentId: { equals: paymentIntentId } },
      limit: 1,
      req,
    })
    const order = requireOrderForPaymentEvent(
      orderResult.docs[0] ?? null,
      'charge.refunded',
      paymentIntentId
    )

    const adjustment = calculateRefundAdjustment({
      orderTotal: Math.round(order.total * 100),
      previousRefundedAmount: order.stripeRefundedAmount ?? 0,
      stripeRefundedAmount: charge.amount_refunded,
    })

    if (adjustment.refundDelta > 0) {
      const customerResult = await payload.find({
        collection: 'customers',
        where: { email: { equals: order.customer.email.toLowerCase() } },
        limit: 1,
        req,
      })
      const customer = customerResult.docs[0]
      if (!customer) {
        throw new Error(`Customer record missing for Stripe order ${order.orderNumber}`)
      }

      await payload.update({
        collection: 'customers',
        id: customer.id,
        req,
        data: {
          totalSpent: Math.max(0, (customer.totalSpent ?? 0) - adjustment.refundDelta / 100),
        },
      })
    }

    const restockNotes: string[] = []
    if (isFullyRefunded && order.inventoryDecrementedAt && !order.inventoryRestockedAt) {
      for (const item of order.items) {
        const productResult = await payload.find({
          collection: 'products',
          where: { id: { equals: item.productId } },
          limit: 1,
          req,
        })
        const product = productResult.docs[0]
        if (!product) {
          restockNotes.push(
            `Inventory not restocked for deleted product ${item.productId} (${item.name}).`
          )
          continue
        }
        await payload.update({
          collection: 'products',
          id: product.id,
          req,
          data: { stock: (product.stock ?? 0) + item.quantity },
        })
      }
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      req,
      data: {
        status: isFullyRefunded ? 'refunded' : order.status,
        stripeRefundedAmount: adjustment.refundedAmount,
        inventoryRestockedAt:
          isFullyRefunded && order.inventoryDecrementedAt && !order.inventoryRestockedAt
            ? new Date().toISOString()
            : order.inventoryRestockedAt,
        notes:
          adjustment.refundDelta > 0
            ? [
                order.notes,
                `Stripe charge ${charge.id} cumulative refund: ${(adjustment.refundedAmount / 100).toFixed(2)} ${charge.currency.toUpperCase()}.${isFullyRefunded ? '' : ' Inventory unchanged.'}`,
                ...restockNotes,
              ]
                .filter(Boolean)
                .join('\n')
            : order.notes,
      },
    })
    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

async function markOrderDisputed(dispute: Stripe.Dispute): Promise<void> {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id
  const charge = await stripe.charges.retrieve(chargeId)
  const paymentIntentId = paymentIntentIdFromCharge(charge)
  if (!paymentIntentId) return

  const payload = await getPayload()
  const order = requireOrderForPaymentEvent(
    await findOrderByPaymentIntent(paymentIntentId),
    `charge.dispute.${dispute.status}`,
    paymentIntentId
  )
  const disputeWon = dispute.status === 'won'
  const statusBeforeDispute = order.status === 'disputed' ? order.statusBeforeDispute : order.status

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      status: disputeWon ? statusToRestoreAfterWonDispute(order.statusBeforeDispute) : 'disputed',
      stripeDisputeId: dispute.id,
      stripeDisputeStatus: dispute.status,
      statusBeforeDispute: disputeWon ? null : statusBeforeDispute,
      notes: [order.notes, `Stripe dispute ${dispute.id}: ${dispute.status}.`]
        .filter(Boolean)
        .join('\n'),
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured or invalid')
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
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, awaitingPayment: true })
    }

    try {
      const payload = await getPayload()

      // Idempotency check - ensure we don't create duplicate orders
      const existingOrder = await payload.find({
        collection: 'orders',
        where: { stripeSessionId: { equals: session.id } },
        limit: 1,
      })

      if (existingOrder.docs.length > 0) {
        const existing = existingOrder.docs[0]
        if (existing) {
          await sendOrderConfirmation(existing)
          await sendInventoryReviewAlert(existing)
        }
        return NextResponse.json({ received: true, duplicate: true })
      }

      // Stripe line items are the paid, server-authored source of truth.
      // Avoids metadata size limits and never trusts browser cart values.
      const items = await getCheckoutItems(session.id)
      const customerName = session.metadata?.customerName ?? ''

      const shippingDetails = getRequiredCheckoutShippingDetails(session)

      // Calculate subtotal from items
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const orderPlacedAt = new Date(session.created * 1000).toISOString()
      const paidAt = new Date(event.created * 1000).toISOString()

      const transactionID = await payload.db.beginTransaction()
      if (transactionID === null) {
        throw new Error('Database transactions are required for order fulfilment')
      }
      const transactionReq = { transactionID }

      let transactionCommitted = false
      try {
        const inventory = await Promise.all(
          items.map(async (item) => {
            const product = await payload.findByID({
              collection: 'products',
              id: item.productId,
              req: transactionReq,
            })

            return {
              item,
              product,
              available:
                product.status === 'published' &&
                typeof product.stock === 'number' &&
                product.stock >= item.quantity,
            }
          })
        )
        const inventoryAvailable = inventory.every((entry) => entry.available)

        // Order, customer totals, and stock changes share one serializable transaction.
        const order = await payload.create({
          collection: 'orders',
          req: transactionReq,
          data: {
            orderNumber: generateOrderNumber(),
            source: 'stripe',
            orderPlacedAt,
            paidAt,
            status: inventoryAvailable ? 'processing' : 'pending',
            customer: {
              email: session.customer_email ?? '',
              name: customerName || shippingDetails.name,
              phone: session.customer_details?.phone ?? undefined,
            },
            shippingAddress: {
              line1: shippingDetails.address.line1,
              line2: shippingDetails.address.line2 ?? undefined,
              city: shippingDetails.address.city,
              state: shippingDetails.address.state ?? undefined,
              postalCode: shippingDetails.address.postal_code ?? undefined,
              country: shippingDetails.address.country,
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
            notes: inventoryAvailable
              ? undefined
              : 'Paid order requires inventory review before fulfilment.',
          },
        })

        console.log(`Order created: ${order.orderNumber}`)

        // Update or create customer record for CRM
        const customerEmail = session.customer_email?.toLowerCase()
        if (customerEmail) {
          const orderTotal = session.amount_total ? session.amount_total / 100 : subtotal

          // Check if customer already exists
          const existingCustomer = await payload.find({
            collection: 'customers',
            where: { email: { equals: customerEmail } },
            limit: 1,
            req: transactionReq,
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
                req: transactionReq,
                data: {
                  name: customerName || shippingDetails.name || customer['name'],
                  phone: session.customer_details?.phone ?? customer['phone'],
                  totalOrders: currentTotalOrders + 1,
                  totalSpent: currentTotalSpent + orderTotal,
                  lastOrderDate: paidAt,
                  defaultAddress: {
                    line1: shippingDetails.address.line1,
                    line2: shippingDetails.address.line2 ?? '',
                    city: shippingDetails.address.city,
                    state: shippingDetails.address.state ?? '',
                    postalCode: shippingDetails.address.postal_code ?? '',
                    country: shippingDetails.address.country,
                  },
                },
              })
            }
          } else {
            // Create new customer
            await payload.create({
              collection: 'customers',
              req: transactionReq,
              data: {
                email: customerEmail,
                name: customerName || shippingDetails.name,
                phone: session.customer_details?.phone ?? undefined,
                source: 'checkout',
                totalOrders: 1,
                totalSpent: orderTotal,
                lastOrderDate: paidAt,
                defaultAddress: {
                  line1: shippingDetails.address.line1,
                  line2: shippingDetails.address.line2 ?? '',
                  city: shippingDetails.address.city,
                  state: shippingDetails.address.state ?? '',
                  postalCode: shippingDetails.address.postal_code ?? '',
                  country: shippingDetails.address.country,
                },
              },
            })
          }
        }

        if (inventoryAvailable) {
          for (const { item, product } of inventory) {
            await payload.update({
              collection: 'products',
              id: item.productId,
              req: transactionReq,
              data: { stock: (product.stock ?? 0) - item.quantity },
            })
          }
          await payload.update({
            collection: 'orders',
            id: order.id,
            req: transactionReq,
            data: { inventoryDecrementedAt: new Date().toISOString() },
          })
        }

        await payload.db.commitTransaction(transactionID)
        transactionCommitted = true

        await sendOrderConfirmation(order)
        await sendInventoryReviewAlert(order)

        return NextResponse.json({
          received: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
        })
      } catch (transactionError) {
        if (!transactionCommitted) await payload.db.rollbackTransaction(transactionID)
        throw transactionError
      }
    } catch (error) {
      console.error('Error processing checkout.session.completed:', error)
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  // Handle other event types
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log(`Payment failed for intent: ${paymentIntent.id}`)
  }

  if (event.type === 'charge.refunded') {
    await markOrderRefunded(event.data.object)
  }

  if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.closed') {
    await markOrderDisputed(event.data.object)
  }

  // Return success for unhandled events
  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
import { sendCartReminder } from '@/lib/cart-reminder'
import { hasMarketingConsent } from '@/lib/marketing-consent'
import type { Order } from '@/types/payload-types'
import { getConfiguredStripeSecretKey, getConfiguredStripeWebhookSecret } from '@/lib/stripe-config'
import { calculateRefundAdjustment } from '@/lib/stripe-refunds'
import { getRequiredCheckoutShippingDetails, isPaidCheckoutStatus } from '@/lib/stripe-fulfillment'
import {
  requireOrderForPaymentEvent,
  statusToRestoreAfterWonDispute,
} from '@/lib/stripe-order-events'
import {
  markReservationPaymentPending,
  releaseInventoryReservation,
  reservationTokenFromSession,
} from '@/lib/inventory-reservations'
import {
  isCustomQuoteDepositSession,
  verifyPaidQuoteDepositSession,
} from '@/lib/custom-quote-deposits'
import { sendQuoteDepositConfirmation } from '@/lib/custom-quotes/deposit-confirmation'
import { notifyOwnerOfQuoteEvent } from '@/lib/custom-quotes/owner-notification'
import {
  isGiftVoucherPurchaseSession,
  issueGiftVoucherFromSession,
} from '@/lib/gift-voucher-purchase'
import { sendGiftVoucherPurchaseEmails } from '@/lib/gift-voucher-email'
import { keepGiftVoucherHoldUntilPaid, releaseGiftVoucherHold } from '@/lib/gift-vouchers'
import {
  recordCheckoutInsight,
  recordServerError,
  type CheckoutInsightItem,
  type CheckoutInsightSource,
} from '@/lib/insights/record'
import { scrubErrorMessage } from '@/lib/scrub-error'
import { INSIGHTS_VISITOR_METADATA_KEY } from '@/lib/insights/events'
import { completeExistingOrder, fulfilPaidCheckout } from '@/lib/orders/fulfil-paid-checkout'

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

async function chosenShippingService(session: Stripe.Checkout.Session): Promise<string | undefined> {
  const rate = session.shipping_cost?.shipping_rate
  if (!rate) return undefined
  if (typeof rate !== 'string') return rate.display_name ?? undefined
  try {
    return (await stripe.shippingRates.retrieve(rate)).display_name ?? undefined
  } catch (error) {
    console.error(`Could not read the chosen shipping service for ${session.id}: ${scrubErrorMessage(error)}`)
    return undefined
  }
}

async function abandonedCheckoutItems(sessionId: string): Promise<CheckoutInsightItem[]> {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ['data.price.product'],
    })
    return lineItems.data.map((lineItem) => {
      const stripeProduct = lineItem.price?.product
      const productId =
        stripeProduct && typeof stripeProduct !== 'string' && !stripeProduct.deleted
          ? stripeProduct.metadata['productId']
          : undefined
      return {
        productId,
        name: lineItem.description ?? 'Item',
        quantity: lineItem.quantity ?? 1,
        amount: lineItem.amount_total / 100,
      }
    })
  } catch (error) {
    console.error(`Line items unavailable for abandoned checkout ${sessionId}: ${scrubErrorMessage(error)}`)
    return []
  }
}

function paymentIntentIdFromCharge(charge: Stripe.Charge): string | null {
  if (typeof charge.payment_intent === 'string') return charge.payment_intent
  return charge.payment_intent?.id ?? null
}

function relationshipId(value: number | { id: number }): number {
  return typeof value === 'number' ? value : value.id
}

async function clearPendingQuoteDepositSession(session: Stripe.Checkout.Session): Promise<void> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'custom-quotes',
    where: { pendingStripeCheckoutSessionId: { equals: session.id } },
    limit: 1,
    overrideAccess: true,
  })
  const quote = result.docs[0]
  if (!quote || quote.depositStatus !== 'awaiting-payment') return
  await payload.update({
    collection: 'custom-quotes',
    id: quote.id,
    overrideAccess: true,
    context: { stripeQuoteDepositReconciliation: true },
    data: {
      pendingStripeCheckoutSessionId: null,
      pendingStripeCheckoutExpiresAt: null,
    },
  })
}

async function reconcileQuoteDeposit(
  session: Stripe.Checkout.Session,
  eventCreated: number
): Promise<{ duplicate: boolean; quoteId: number }> {
  const quoteId = Number(session.metadata?.quoteId)
  if (!Number.isSafeInteger(quoteId) || quoteId < 1) {
    throw new Error('Stripe quote deposit is missing a valid quote ID')
  }

  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for deposits')
  const req = { transactionID }

  try {
    const quote = await payload.findByID({
      collection: 'custom-quotes',
      id: quoteId,
      req,
      overrideAccess: true,
    })
    const evidence = verifyPaidQuoteDepositSession({ quote, session, eventCreated })
    if (quote.depositStatus === 'paid') {
      await payload.db.commitTransaction(transactionID)
      return { duplicate: true, quoteId: quote.id }
    }

    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      req,
      overrideAccess: true,
      context: { stripeQuoteDepositReconciliation: true },
      data: {
        depositStatus: 'paid',
        amountPaidCents: quote.depositAmountCents,
        paidAt: evidence.paidAt,
        stripeRefundedAmountCents: 0,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: evidence.paymentIntentId,
        pendingStripeCheckoutSessionId: null,
        pendingStripeCheckoutExpiresAt: null,
      },
    })
    await payload.update({
      collection: 'enquiries',
      id: relationshipId(quote.enquiry),
      req,
      overrideAccess: true,
      data: { status: 'deposit-paid' },
    })
    await payload.db.commitTransaction(transactionID)
    return { duplicate: false, quoteId: quote.id }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

async function reconcileQuoteDepositRefund(charge: Stripe.Charge): Promise<boolean> {
  const paymentIntentId = paymentIntentIdFromCharge(charge)
  if (!paymentIntentId) return false
  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for refunds')
  const req = { transactionID }
  try {
    const result = await payload.find({
      collection: 'custom-quotes',
      where: { stripePaymentIntentId: { equals: paymentIntentId } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    const quote = result.docs[0]
    if (!quote) {
      await payload.db.commitTransaction(transactionID)
      return false
    }
    if (
      (quote.depositStatus !== 'paid' && quote.depositStatus !== 'refunded') ||
      charge.amount !== quote.amountPaidCents ||
      charge.currency.toUpperCase() !== quote.currency
    ) {
      throw new Error('Stripe refund does not match the recorded custom quote deposit')
    }

    const cumulativeRefund = Math.min(charge.amount_refunded, quote.amountPaidCents ?? 0)
    if (cumulativeRefund > (quote.stripeRefundedAmountCents ?? 0)) {
      const fullyRefunded = cumulativeRefund === quote.amountPaidCents
      await payload.update({
        collection: 'custom-quotes',
        id: quote.id,
        req,
        overrideAccess: true,
        context: { stripeQuoteDepositReconciliation: true },
        data: {
          stripeRefundedAmountCents: cumulativeRefund,
          refundedAt: new Date().toISOString(),
          depositStatus: fullyRefunded ? 'refunded' : 'paid',
        },
      })
      await payload.update({
        collection: 'enquiries',
        id: relationshipId(quote.enquiry),
        req,
        overrideAccess: true,
        data: { status: 'accepted' },
      })
    }
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

async function reconcileQuoteDepositDispute(
  dispute: Stripe.Dispute,
  eventCreated: number
): Promise<boolean> {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id
  const charge = await stripe.charges.retrieve(chargeId)
  const paymentIntentId = paymentIntentIdFromCharge(charge)
  if (!paymentIntentId) return false
  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for disputes')
  const req = { transactionID }
  try {
    const result = await payload.find({
      collection: 'custom-quotes',
      where: { stripePaymentIntentId: { equals: paymentIntentId } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    const quote = result.docs[0]
    if (!quote) {
      await payload.db.commitTransaction(transactionID)
      return false
    }
    if (
      (quote.depositStatus !== 'paid' && quote.depositStatus !== 'refunded') ||
      charge.amount !== quote.amountPaidCents ||
      charge.currency.toUpperCase() !== quote.currency
    ) {
      throw new Error('Stripe dispute does not match the recorded custom quote deposit')
    }

    const occurredAt = new Date(eventCreated * 1000).toISOString()
    if (
      !quote.stripeDisputeEventAt ||
      new Date(occurredAt).getTime() > new Date(quote.stripeDisputeEventAt).getTime()
    ) {
      await payload.update({
        collection: 'custom-quotes',
        id: quote.id,
        req,
        overrideAccess: true,
        context: { stripeQuoteDepositReconciliation: true },
        data: {
          stripeDisputeId: dispute.id,
          stripeDisputeStatus: dispute.status,
          stripeDisputeEventAt: occurredAt,
          depositDisputedAt: quote.depositDisputedAt ?? occurredAt,
        },
      })
      await payload.update({
        collection: 'enquiries',
        id: relationshipId(quote.enquiry),
        req,
        overrideAccess: true,
        data: {
          status:
            dispute.status === 'won' &&
            quote.depositStatus === 'paid' &&
            (quote.stripeRefundedAmountCents ?? 0) === 0
              ? 'deposit-paid'
              : 'accepted',
        },
      })
    }
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

function checkoutInsightSource(session: Stripe.Checkout.Session): CheckoutInsightSource {
  return {
    reference: session.id,
    visitor: session.metadata?.[INSIGHTS_VISITOR_METADATA_KEY],
    value: (session.amount_total ?? 0) / 100,
    email: session.customer_details?.email ?? session.customer_email ?? undefined,
  }
}

async function releaseCheckoutHolds(
  session: Stripe.Checkout.Session,
  reason: 'checkout-expired' | 'async-payment-failed'
): Promise<void> {
  const token = reservationTokenFromSession(session)
  if (!token) return
  await releaseInventoryReservation(token, reason)
  await releaseGiftVoucherHold(token, session.id)
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
    const reconciliationNotes: string[] = []

    if (adjustment.refundDelta > 0) {
      const customerResult = await payload.find({
        collection: 'customers',
        where: { email: { equals: order.customer.email.toLowerCase() } },
        limit: 1,
        req,
      })
      const customer = customerResult.docs[0]
      if (!customer) {
        reconciliationNotes.push(
          `Customer CRM record was missing; order and inventory refund reconciliation continued.`
        )
      } else {
        await payload.update({
          collection: 'customers',
          id: customer.id,
          req,
          data: {
            totalSpent: Math.max(0, (customer.totalSpent ?? 0) - adjustment.refundDelta / 100),
          },
        })
      }
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
      context: { stripeRefundReconciliation: true },
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
                ...reconciliationNotes,
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
    console.error(`Webhook signature verification failed: ${scrubErrorMessage(message)}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.expired') {
    if (isCustomQuoteDepositSession(event.data.object)) {
      await clearPendingQuoteDepositSession(event.data.object)
      return NextResponse.json({ received: true, quoteDepositReleased: true })
    }
    if (isGiftVoucherPurchaseSession(event.data.object)) {
      return NextResponse.json({ received: true })
    }
    await releaseCheckoutHolds(event.data.object, 'checkout-expired')
    await recordCheckoutInsight({
      name: 'checkout_abandoned',
      checkout: checkoutInsightSource(event.data.object),
      occurredAt: new Date(event.created * 1000),
      items: await abandonedCheckoutItems(event.data.object.id),
    })
    if (hasMarketingConsent(event.data.object.metadata)) {
      const expired = event.data.object
      await getCheckoutItems(expired.id)
        .then((items) => sendCartReminder(expired, items))
        .catch((error: unknown) =>
          console.error(`Cart reminder failed for ${expired.id}: ${scrubErrorMessage(error)}`)
        )
    }
    return NextResponse.json({ received: true, inventoryReleased: true })
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    if (isCustomQuoteDepositSession(event.data.object)) {
      await clearPendingQuoteDepositSession(event.data.object)
      return NextResponse.json({ received: true, quoteDepositReleased: true })
    }
    if (isGiftVoucherPurchaseSession(event.data.object)) {
      return NextResponse.json({ received: true })
    }
    await releaseCheckoutHolds(event.data.object, 'async-payment-failed')
    return NextResponse.json({ received: true, inventoryReleased: true })
  }

  // Handle the checkout.session.completed event
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object

    if (isCustomQuoteDepositSession(session)) {
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ received: true, awaitingQuoteDeposit: true })
      }
      try {
        const result = await reconcileQuoteDeposit(session, event.created)
        if (!result.duplicate) await notifyOwnerOfQuoteEvent(result.quoteId, 'deposit-paid')
        await sendQuoteDepositConfirmation(result.quoteId)
        return NextResponse.json({ received: true, quoteDeposit: true, ...result })
      } catch (error) {
        console.error(`Quote deposit not reconciled for ${event.id} ${session.id}: ${scrubErrorMessage(error)}`)
        await recordServerError({
          kind: 'stripe_webhook',
          path: '/api/webhooks/stripe',
          error,
          reference: session.id,
        })
        return NextResponse.json({ error: 'Failed to reconcile quote deposit' }, { status: 500 })
      }
    }

    if (isGiftVoucherPurchaseSession(session)) {
      if (!isPaidCheckoutStatus(session.payment_status)) {
        return NextResponse.json({ received: true, awaitingPayment: true })
      }
      try {
        const { voucher, created } = await issueGiftVoucherFromSession(session)
        if (created) {
          await recordCheckoutInsight({
            name: 'purchase',
            checkout: checkoutInsightSource(session),
            occurredAt: new Date(event.created * 1000),
            items: [{ name: 'Gift voucher', quantity: 1, amount: voucher.initialValue }],
          })
        }
        await sendGiftVoucherPurchaseEmails(await getPayload(), voucher.id)
        return NextResponse.json({ received: true, giftVoucherId: voucher.id, duplicate: !created })
      } catch (error) {
        console.error(`Gift voucher not issued for ${event.id} ${session.id}: ${scrubErrorMessage(error)}`)
        await recordServerError({
          kind: 'stripe_webhook',
          path: '/api/webhooks/stripe',
          error,
          reference: session.id,
        })
        return NextResponse.json({ error: 'Failed to issue gift voucher' }, { status: 500 })
      }
    }

    if (!isPaidCheckoutStatus(session.payment_status)) {
      const token = reservationTokenFromSession(session)
      if (token) {
        await markReservationPaymentPending(token)
        await keepGiftVoucherHoldUntilPaid(token)
      }
      return NextResponse.json({ received: true, awaitingPayment: true })
    }

    try {
      if (await completeExistingOrder(session.id)) {
        return NextResponse.json({ received: true, duplicate: true })
      }

      const items = await getCheckoutItems(session.id)
      const customerName =
        session.metadata?.customerName || session.customer_details?.name || ''
      const sessionEmail = session.customer_details?.email ?? session.customer_email ?? ''
      const shippingDetails = getRequiredCheckoutShippingDetails(session)
      const shippingService = await chosenShippingService(session)
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const insight = checkoutInsightSource(session)

      const order = await fulfilPaidCheckout({
        reference: session.id,
        source: 'stripe',
        reservationToken: reservationTokenFromSession(session),
        items,
        customer: {
          email: sessionEmail,
          name: customerName || shippingDetails.name,
          phone: session.customer_details?.phone,
        },
        shippingAddress: {
          line1: shippingDetails.address.line1,
          line2: shippingDetails.address.line2,
          city: shippingDetails.address.city,
          state: shippingDetails.address.state,
          postalCode: shippingDetails.address.postal_code,
          country: shippingDetails.address.country,
        },
        shipping: session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0,
        tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
        total: session.amount_total ? session.amount_total / 100 : subtotal,
        currency: session.currency?.toUpperCase() ?? 'AUD',
        placedAt: new Date(session.created * 1000).toISOString(),
        paidAt: new Date(event.created * 1000).toISOString(),
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        voucherDiscount: session.total_details?.amount_discount
          ? session.total_details.amount_discount / 100
          : undefined,
        notes: [
          shippingService ? `Ship by ${shippingService}` : undefined,
          session.discounts?.some((discount) => discount.promotion_code) &&
          session.total_details?.amount_discount
            ? `Welcome code used: -$${(session.total_details.amount_discount / 100).toFixed(2)}`
            : undefined,
        ],
        insight: {
          occurredAt: new Date(event.created * 1000),
          visitor: insight.visitor,
          value: insight.value,
        },
        joinList:
          hasMarketingConsent(session.metadata) && sessionEmail
            ? { email: sessionEmail, name: session.customer_details?.name ?? undefined }
            : null,
      })

      return NextResponse.json({
        received: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })
    } catch (error) {
      console.error(`Order not created for ${event.id} ${session.id}: ${scrubErrorMessage(error)}`)
      await recordServerError({
        kind: 'stripe_webhook',
        path: '/api/webhooks/stripe',
        error,
        reference: session.id,
      })
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  // Handle other event types
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.warn(`Payment failed for ${paymentIntent.id}: ${paymentIntent.last_payment_error?.code ?? 'no code'}`)
  }

  if (event.type === 'charge.refunded') {
    const currentCharge = await stripe.charges.retrieve(event.data.object.id)
    if (!(await reconcileQuoteDepositRefund(currentCharge))) {
      await markOrderRefunded(currentCharge)
    }
  }

  if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.closed') {
    const currentDispute = await stripe.disputes.retrieve(event.data.object.id)
    if (!(await reconcileQuoteDepositDispute(currentDispute, event.created))) {
      await markOrderDisputed(currentDispute)
    }
  }

  // Return success for unhandled events
  return NextResponse.json({ received: true })
}

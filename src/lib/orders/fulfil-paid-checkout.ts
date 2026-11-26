import type { ReactElement } from 'react'
import { randomBytes } from 'node:crypto'
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'
import { captureGiftVoucherHold } from '@/lib/gift-vouchers'
import { recordCheckoutInsight } from '@/lib/insights/record'
import { reservationMatchesCheckoutItems } from '@/lib/inventory-reservations'
import { subscribeCheckoutBuyer } from '@/lib/newsletter/checkout-buyer'
import { getPayload } from '@/lib/payload'
import type { Order } from '@/types/payload-types'

export interface PaidCheckoutItem {
  productId: string
  slug: string
  name: string
  price: number
  quantity: number
  image?: string | undefined
}

export interface PaidCheckoutAddress {
  line1: string
  line2?: string | null | undefined
  city: string
  state?: string | null | undefined
  postalCode?: string | null | undefined
  country: string
}

export interface PaidCheckout {
  reference: string
  source: 'stripe' | 'paypal'
  paymentMethod?: string
  reservationToken: string | null
  items: PaidCheckoutItem[]
  customer: { email: string; name: string; phone?: string | null | undefined }
  shippingAddress: PaidCheckoutAddress
  shipping: number
  tax: number
  total: number
  currency: string
  placedAt: string
  paidAt: string
  stripePaymentIntentId?: string | undefined
  voucherDiscount?: number | undefined
  notes: (string | undefined)[]
  insight: { occurredAt: Date; visitor?: string | undefined; value: number }
  joinList: { email: string; name?: string | undefined } | null
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(8).toString('hex').toUpperCase()
  return `OPAL-${timestamp}-${random}`
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (order.confirmationEmailSentAt) return

  const { error } = await new Resend(process.env['RESEND_API_KEY']).emails.send(
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
        giftVoucher: order.giftVoucherCode
          ? { code: order.giftVoucherCode, amount: order.giftVoucherAmount ?? 0 }
          : undefined,
        discount: order.giftVoucherCode
          ? undefined
          : Math.max(
              0,
              Math.round((order.subtotal + (order.shipping ?? 0) - order.total) * 100) / 100
            ) || undefined,
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

function formatAud(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function ownerOrderEmailText(order: Order): string {
  const adminUrl = `${(process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')}/admin/collections/orders/${order.id}`
  const address = order.shippingAddress
  return [
    ...(order.status === 'pending'
      ? ['INVENTORY REVIEW REQUIRED: check stock before packing this order.', '']
      : []),
    `New paid order ${order.orderNumber}`,
    `Total paid: ${formatAud(order.total)} ${order.currency ?? 'AUD'} (shipping ${formatAud(order.shipping ?? 0)})`,
    ...(order.giftVoucherCode
      ? [`Gift voucher ${order.giftVoucherCode}: -${formatAud(order.giftVoucherAmount ?? 0)}`]
      : []),
    '',
    'Items:',
    ...order.items.map(
      (item) => `${item.quantity} × ${item.name}, ${formatAud(item.price)} (${item.productId})`
    ),
    '',
    'Customer:',
    order.customer.name,
    order.customer.email,
    ...(order.customer.phone ? [order.customer.phone] : []),
    '',
    'Ship to:',
    address.line1,
    ...(address.line2 ? [address.line2] : []),
    [address.city, address.state, address.postalCode].filter(Boolean).join(' '),
    address.country,
    ...(order.notes ? ['', `Notes: ${order.notes}`] : []),
    '',
    `Open the order: ${adminUrl}`,
  ].join('\n')
}

export async function sendOwnerOrderNotification(order: Order): Promise<void> {
  if (order.inventoryAlertSentAt) return

  const { error } = await new Resend(process.env['RESEND_API_KEY']).emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: process.env['CONTACT_EMAIL'] ?? '',
      replyTo: order.customer.email,
      subject: `${order.status === 'pending' ? 'Inventory review required' : 'New order'} - ${order.orderNumber}`,
      text: ownerOrderEmailText(order),
    },
    { idempotencyKey: `owner-order/${order.id}` }
  )

  const payload = await getPayload()
  if (error) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { inventoryAlertError: error.message.slice(0, 1000) },
    })
    throw new Error(`Resend rejected owner order email: ${error.message}`)
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

export async function completeExistingOrder(reference: string): Promise<Order | null> {
  const payload = await getPayload()
  const existingOrder = await payload.find({
    collection: 'orders',
    where: { stripeSessionId: { equals: reference } },
    limit: 1,
  })
  const existing = existingOrder.docs[0]
  if (!existing) return null
  await sendOrderConfirmation(existing)
  await sendOwnerOrderNotification(existing)
  return existing
}

const PROVIDER_NAMES = { stripe: 'Stripe', paypal: 'PayPal' } as const

export async function fulfilPaidCheckout(checkout: PaidCheckout): Promise<Order> {
  const payload = await getPayload()
  const { items, reservationToken, shippingAddress } = checkout
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) {
    throw new Error('Database transactions are required for order fulfilment')
  }
  const transactionReq = { transactionID }

  let order: Order
  try {
    const reservationResult = reservationToken
      ? await payload.find({
          collection: 'inventory-reservations',
          where: { token: { equals: reservationToken } },
          limit: 1,
          req: transactionReq,
          overrideAccess: true,
        })
      : null
    const reservation = reservationResult?.docs[0]
    const reservedInventoryAvailable = Boolean(
      reservation &&
      (reservation.status === 'active' || reservation.status === 'pending-payment') &&
      reservationMatchesCheckoutItems(
        reservation.items,
        items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          unitAmountCents: Math.round(item.price * 100),
          quantity: item.quantity,
        }))
      )
    )

    const inventory = reservationToken
      ? []
      : await Promise.all(
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
    const legacyInventoryAvailable =
      !reservationToken && inventory.every((entry) => entry.available)
    const inventoryAvailable = reservedInventoryAvailable || legacyInventoryAvailable

    order = await payload.create({
      collection: 'orders',
      req: transactionReq,
      data: {
        orderNumber: generateOrderNumber(),
        source: checkout.source,
        ...(checkout.paymentMethod ? { paymentMethod: checkout.paymentMethod } : {}),
        orderPlacedAt: checkout.placedAt,
        paidAt: checkout.paidAt,
        status: inventoryAvailable ? 'processing' : 'pending',
        customer: {
          email: checkout.customer.email,
          name: checkout.customer.name,
          phone: checkout.customer.phone ?? undefined,
        },
        shippingAddress: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 ?? undefined,
          city: shippingAddress.city,
          state: shippingAddress.state ?? undefined,
          postalCode: shippingAddress.postalCode ?? undefined,
          country: shippingAddress.country,
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
        shipping: checkout.shipping,
        tax: checkout.tax,
        total: checkout.total,
        currency: checkout.currency,
        stripeSessionId: checkout.reference,
        stripePaymentIntentId: checkout.stripePaymentIntentId,
        inventoryReservation: reservation?.id,
        inventoryDecrementedAt: reservedInventoryAvailable ? new Date().toISOString() : undefined,
        notes:
          [
            inventoryAvailable
              ? undefined
              : reservationToken
                ? `Paid order reservation is missing, released, consumed, or does not match ${PROVIDER_NAMES[checkout.source]} line items. Manual inventory review required.`
                : 'Paid legacy checkout requires inventory review before fulfilment.',
            ...checkout.notes,
          ]
            .filter(Boolean)
            .join('\n') || undefined,
      },
    })

    console.log(`Order created: ${order.orderNumber}`)

    const voucherCapture =
      reservationToken && checkout.source === 'stripe'
        ? await captureGiftVoucherHold({
            payload,
            req: transactionReq,
            checkoutToken: reservationToken,
            stripeSessionId: checkout.reference,
            orderId: order.id,
          })
        : null
    if (voucherCapture) {
      const updated = await payload.update({
        collection: 'orders',
        id: order.id,
        req: transactionReq,
        data: {
          giftVoucherCode: voucherCapture.code,
          giftVoucherAmount: checkout.voucherDiscount || voucherCapture.amount,
          ...(voucherCapture.note
            ? { notes: [order.notes, voucherCapture.note].filter(Boolean).join('\n') }
            : {}),
        },
      })
      Object.assign(order, updated)
    }

    const customerEmail = checkout.customer.email.toLowerCase()
    if (customerEmail) {
      const defaultAddress = {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? '',
        city: shippingAddress.city,
        state: shippingAddress.state ?? '',
        postalCode: shippingAddress.postalCode ?? '',
        country: shippingAddress.country,
      }
      const existingCustomer = await payload.find({
        collection: 'customers',
        where: { email: { equals: customerEmail } },
        limit: 1,
        req: transactionReq,
      })
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
            name: checkout.customer.name || customer['name'],
            phone: checkout.customer.phone ?? customer['phone'],
            totalOrders: currentTotalOrders + 1,
            totalSpent: currentTotalSpent + checkout.total,
            lastOrderDate: checkout.paidAt,
            defaultAddress,
          },
        })
      } else {
        await payload.create({
          collection: 'customers',
          req: transactionReq,
          data: {
            email: customerEmail,
            name: checkout.customer.name,
            phone: checkout.customer.phone ?? undefined,
            source: 'checkout',
            totalOrders: 1,
            totalSpent: checkout.total,
            lastOrderDate: checkout.paidAt,
            defaultAddress,
          },
        })
      }
    }

    if (reservedInventoryAvailable && reservation) {
      await payload.update({
        collection: 'inventory-reservations',
        id: reservation.id,
        req: transactionReq,
        overrideAccess: true,
        data: {
          status: 'consumed',
          consumedAt: new Date().toISOString(),
        },
      })
    } else if (legacyInventoryAvailable) {
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
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }

  await recordCheckoutInsight({
    name: 'purchase',
    checkout: {
      reference: checkout.reference,
      visitor: checkout.insight.visitor,
      value: checkout.insight.value,
    },
    occurredAt: checkout.insight.occurredAt,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      amount: item.price * item.quantity,
    })),
  })
  await sendOrderConfirmation(order)
  await sendOwnerOrderNotification(order)
  if (checkout.joinList) {
    await subscribeCheckoutBuyer(checkout.joinList.email, checkout.joinList.name)
  }
  return order
}

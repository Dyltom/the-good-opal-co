import { Resend } from 'resend'
import { recordServerError } from '@/lib/insights/record'
import {
  findReservationByReference,
  holdReservationForCapture,
  releaseInventoryReservation,
} from '@/lib/inventory-reservations'
import { completeExistingOrder, fulfilPaidCheckout } from '@/lib/orders/fulfil-paid-checkout'
import {
  captureOrder,
  getOrder,
  isPayPalOrderId,
  moneyToCents,
  PayPalError,
  paypalReference,
  type PayPalOrder,
  type PayPalPurchaseUnit,
} from '@/lib/paypal'
import {
  cartNotice,
  decodeCheckoutContext,
  paypalSuccessPath,
  RETURN_PATH,
  type PayPalCheckoutContext,
} from '@/lib/paypal-order'
import type { InventoryReservation } from '@/types/payload-types'

const CANCELLED_PATH = '/cart?checkout=cancelled'

type Verification = 'ok' | 'mismatch' | 'country'

function verifyApprovedOrder(
  unit: PayPalPurchaseUnit | undefined,
  context: PayPalCheckoutContext | null,
  reservation: InventoryReservation
): Verification {
  if (!unit || !context || unit.amount?.currency_code !== 'AUD') return 'mismatch'
  const reservedCents = reservation.items.reduce(
    (sum, item) => sum + item.unitAmountCents * item.quantity,
    0
  )
  const itemTotal = moneyToCents(unit.amount.breakdown?.item_total)
  const shipping = unit.amount.breakdown?.shipping
    ? moneyToCents(unit.amount.breakdown.shipping)
    : 0
  const amount = moneyToCents(unit.amount)
  if (itemTotal !== reservedCents || shipping === null || amount !== itemTotal + shipping) {
    return 'mismatch'
  }
  if (shipping > 0 && unit.shipping?.address?.country_code !== context.country) return 'country'
  return 'ok'
}

function reservationExpired(reservation: InventoryReservation, now: Date): boolean {
  return (
    reservation.status === 'active' && new Date(reservation.expiresAt).getTime() <= now.getTime()
  )
}

async function alertOwner(orderId: string, problem: string): Promise<void> {
  const adminUrl = `${(process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')}/admin/collections/orders`
  try {
    const { error } = await new Resend(process.env['RESEND_API_KEY']).emails.send(
      {
        from: process.env['EMAIL_FROM'] ?? '',
        to: process.env['CONTACT_EMAIL'] ?? '',
        subject: `PayPal payment needs checking - ${orderId}`,
        text: [
          `PayPal order ${orderId}: ${problem}`,
          '',
          'The shopper was told their payment was received and that we will email them. Check the payment in the PayPal business account, then create or fix the order in admin.',
          '',
          `Orders: ${adminUrl}`,
        ].join('\n'),
      },
      { idempotencyKey: `paypal-unfulfilled/${orderId}` }
    )
    if (error) console.error(`PayPal owner alert rejected for ${orderId}:`, error.message)
  } catch (error) {
    console.error(`PayPal owner alert failed for ${orderId}:`, error)
  }
}

async function paymentNeedsChecking(
  orderId: string,
  problem: string,
  error: unknown
): Promise<string> {
  console.error(`PayPal order ${orderId} ${problem}:`, error)
  await recordServerError({ kind: 'checkout', path: RETURN_PATH, error })
  await alertOwner(orderId, problem)
  return paypalSuccessPath(orderId)
}

function payerName(order: PayPalOrder): string {
  const unit = order.purchase_units?.[0]
  return (
    unit?.shipping?.name?.full_name ||
    [order.payer?.name?.given_name, order.payer?.name?.surname].filter(Boolean).join(' ')
  )
}

async function fulfilCaptured(order: PayPalOrder): Promise<string> {
  const reference = paypalReference(order.id)
  try {
    const reservation = await findReservationByReference(reference)
    if (!reservation) throw new Error('No reservation matches this PayPal order')
    const unit = order.purchase_units?.[0]
    const context = decodeCheckoutContext(unit?.reference_id)
    const capture = unit?.payments?.captures?.[0]
    const address = unit?.shipping?.address
    const email = context?.email || order.payer?.email_address || ''
    const name = payerName(order)
    const totalCents = moneyToCents(unit?.amount) ?? 0
    const shippingCents = moneyToCents(unit?.amount?.breakdown?.shipping) ?? 0
    const paidAt = capture?.create_time ?? new Date().toISOString()

    await fulfilPaidCheckout({
      reference,
      source: 'paypal',
      paymentMethod: 'PayPal',
      reservationToken: reservation.token,
      items: reservation.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.unitAmountCents / 100,
        quantity: item.quantity,
      })),
      customer: {
        email,
        name,
        phone: order.payer?.phone?.phone_number?.national_number,
      },
      shippingAddress: {
        line1: address?.address_line_1 ?? '',
        line2: address?.address_line_2,
        city: address?.admin_area_2 ?? '',
        state: address?.admin_area_1,
        postalCode: address?.postal_code,
        country: address?.country_code ?? context?.country ?? '',
      },
      shipping: shippingCents / 100,
      tax: 0,
      total: totalCents / 100,
      currency: 'AUD',
      placedAt: order.create_time ?? paidAt,
      paidAt,
      notes: [
        context?.shippingLabel && shippingCents > 0
          ? `Ship by ${context.shippingLabel}`
          : undefined,
        capture ? `Paid by PayPal, capture ${capture.id}` : 'Paid by PayPal',
        capture?.status === 'PENDING'
          ? 'PayPal is still holding this payment. Check it shows as completed in PayPal before posting.'
          : undefined,
      ],
      insight: { occurredAt: new Date(paidAt), visitor: context?.visitor, value: totalCents / 100 },
      joinList: context?.consentAt && context.email ? { email: context.email, name } : null,
    })
    return paypalSuccessPath(order.id)
  } catch (error) {
    if (await completeExistingOrder(reference).catch(() => null)) return paypalSuccessPath(order.id)
    return paymentNeedsChecking(order.id, 'was paid but the order could not be recorded', error)
  }
}

async function capture(orderId: string, token: string): Promise<PayPalOrder | string> {
  try {
    return await captureOrder(orderId, `capture-${orderId}`)
  } catch (error) {
    if (error instanceof PayPalError && error.issue === 'ORDER_ALREADY_CAPTURED') {
      return getOrder(orderId).catch((readError: unknown) =>
        paymentNeedsChecking(orderId, 'was captured but could not be read back', readError)
      )
    }
    if (error instanceof PayPalError && error.status >= 400 && error.status < 500) {
      await releaseInventoryReservation(token, 'payment-declined')
      return cartNotice(error.issue === 'INSTRUMENT_DECLINED' ? 'declined' : 'failed')
    }
    return paymentNeedsChecking(orderId, 'capture outcome is unknown', error)
  }
}

export async function completePayPalReturn(orderId: string, now = new Date()): Promise<string> {
  if (!isPayPalOrderId(orderId)) return cartNotice('failed')
  const reference = paypalReference(orderId)

  try {
    if (await completeExistingOrder(reference)) return paypalSuccessPath(orderId)
  } catch (error) {
    console.error(`PayPal order ${orderId} emails failed:`, error)
    await recordServerError({ kind: 'checkout', path: RETURN_PATH, error })
    return paypalSuccessPath(orderId)
  }

  let order: PayPalOrder
  try {
    order = await getOrder(orderId)
  } catch (error) {
    console.error(`PayPal order ${orderId} could not be read:`, error)
    await recordServerError({ kind: 'checkout', path: RETURN_PATH, error })
    return cartNotice('failed')
  }
  if (order.status === 'COMPLETED') return fulfilCaptured(order)
  if (order.status !== 'APPROVED') return CANCELLED_PATH

  const reservation = await findReservationByReference(reference)
  if (
    !reservation ||
    (reservation.status !== 'active' && reservation.status !== 'pending-payment')
  ) {
    return cartNotice('expired')
  }
  if (reservationExpired(reservation, now)) {
    await releaseInventoryReservation(reservation.token, 'checkout-expired')
    return cartNotice('expired')
  }

  const unit = order.purchase_units?.[0]
  const verification = verifyApprovedOrder(
    unit,
    decodeCheckoutContext(unit?.reference_id),
    reservation
  )
  if (verification === 'mismatch') {
    await releaseInventoryReservation(reservation.token, 'payment-mismatch')
    return cartNotice('failed')
  }
  if (verification === 'country') {
    await releaseInventoryReservation(reservation.token, 'shipping-country-mismatch')
    return cartNotice('country')
  }

  if (!(await holdReservationForCapture(reservation.token, now))) return cartNotice('expired')

  const captured = await capture(orderId, reservation.token)
  if (typeof captured === 'string') return captured
  const status = captured.purchase_units?.[0]?.payments?.captures?.[0]?.status
  if (status === 'DECLINED' || status === 'FAILED') {
    await releaseInventoryReservation(reservation.token, 'payment-declined')
    return cartNotice('declined')
  }
  return fulfilCaptured(captured)
}

export async function cancelPayPalCheckout(orderId: string): Promise<string> {
  if (!isPayPalOrderId(orderId)) return CANCELLED_PATH
  const reservation = await findReservationByReference(paypalReference(orderId))
  if (reservation?.status === 'active') {
    await releaseInventoryReservation(reservation.token, 'checkout-cancelled')
  }
  return CANCELLED_PATH
}

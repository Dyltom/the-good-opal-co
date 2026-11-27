import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { ShippingNotificationEmail } from '@/emails/shipping-notification'
import type { Order } from '@/types/payload-types'

const carrierLabels: Record<NonNullable<Order['shippingCarrier']>, string> = {
  'australia-post': 'Australia Post',
  startrack: 'StarTrack',
  dhl: 'DHL',
  fedex: 'FedEx',
  other: 'Shipping carrier',
}

export function carrierTrackingUrl(carrier: Order['shippingCarrier'], trackingNumber: string, baseUrl: string): string {
  if (carrier === 'australia-post') {
    return `https://auspost.com.au/mypost/track/details/${encodeURIComponent(trackingNumber)}`
  }
  return `${baseUrl}/order-tracking`
}

interface ResendSender {
  emails: {
    send(
      message: {
        from: string
        react: ReactElement
        subject: string
        to: string
      },
      options: { idempotencyKey: string }
    ): Promise<{ error: { message: string } | null }>
  }
}

type DispatchFields = Partial<Pick<Order, 'status' | 'trackingNumber' | 'shippingCarrier'>>

export function markShippedOnTracking<T extends DispatchFields>(
  data: T,
  originalDoc: DispatchFields | undefined
): T {
  const trackingAdded = data.trackingNumber?.trim() && !originalDoc?.trackingNumber?.trim()
  if (!trackingAdded || (data.status ?? originalDoc?.status) !== 'processing') return data
  return {
    ...data,
    status: 'shipped',
    shippingCarrier: data.shippingCarrier ?? originalDoc?.shippingCarrier ?? 'australia-post',
  }
}

export function shouldSendShipmentNotification(order: Order): boolean {
  return Boolean(
    (order.source === 'stripe' || order.source === 'paypal') &&
    order.status === 'shipped' &&
    order.trackingNumber?.trim() &&
    !order.shipmentEmailSentAt
  )
}

export async function sendShipmentNotification(
  order: Order,
  sender: ResendSender = new Resend(process.env['RESEND_API_KEY'] ?? '')
): Promise<void> {
  const trackingNumber = order.trackingNumber?.trim()
  if (!trackingNumber) throw new Error('Tracking number is required before dispatch email')

  const supportEmail = process.env['CONTACT_EMAIL'] ?? ''
  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')
  const carrier = order.shippingCarrier ? carrierLabels[order.shippingCarrier] : 'Shipping carrier'
  const { error } = await sender.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: order.customer.email,
      subject: `Your order ${order.orderNumber} has shipped`,
      react: ShippingNotificationEmail({
        baseUrl,
        carrier,
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        supportEmail,
        trackingNumber,
        trackingUrl: carrierTrackingUrl(order.shippingCarrier, trackingNumber, baseUrl),
      }) as ReactElement,
    },
    { idempotencyKey: `shipment-notification/${order.id}` }
  )

  if (error) throw new Error(`Resend rejected shipment notification: ${error.message}`)
}

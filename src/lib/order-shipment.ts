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

export function shouldSendShipmentNotification(order: Order): boolean {
  return Boolean(
    order.source === 'stripe' &&
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
  const carrier = order.shippingCarrier ? carrierLabels[order.shippingCarrier] : 'Shipping carrier'
  const { error } = await sender.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: order.customer.email,
      subject: `Your order ${order.orderNumber} has shipped`,
      react: ShippingNotificationEmail({
        carrier,
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        supportEmail,
        trackingNumber,
      }) as ReactElement,
    },
    { idempotencyKey: `shipment-notification/${order.id}` }
  )

  if (error) throw new Error(`Resend rejected shipment notification: ${error.message}`)
}

import type Stripe from 'stripe'
import {
  DISPATCH_BUSINESS_DAYS,
  isShippingCountry,
  publishedShippingOptions,
} from '@/lib/constants/shipping'
import type { Order } from '@/types/payload-types'

export const GOOGLE_MERCHANT_ID = 561385480

export interface SurveyOptIn {
  orderId: string
  email: string
  deliveryCountry: string
  estimatedDeliveryDate: string
}

export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from)
  let remaining = days
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    const weekday = date.getUTCDay()
    if (weekday !== 0 && weekday !== 6) remaining -= 1
  }
  return date
}

export function surveyOptInFor(session: Stripe.Checkout.Session): SurveyOptIn | null {
  const email = session.customer_details?.email
  const deliveryCountry = session.collected_information?.shipping_details?.address?.country
  const rate = session.shipping_cost?.shipping_rate
  const days = rate && typeof rate === 'object' ? rate.delivery_estimate?.maximum?.value : undefined
  if (!email || !deliveryCountry || !days) return null

  return {
    orderId: session.id,
    email,
    deliveryCountry,
    estimatedDeliveryDate: addBusinessDays(new Date(session.created * 1000), days)
      .toISOString()
      .slice(0, 10),
  }
}

export function surveyOptInForOrder(order: Order): SurveyOptIn | null {
  const country = order.shippingAddress.country
  const [standard] = isShippingCountry(country) ? publishedShippingOptions(country) : []
  if (!order.shipping || !standard || !order.customer.email) return null

  return {
    orderId: order.stripeSessionId,
    email: order.customer.email,
    deliveryCountry: country,
    estimatedDeliveryDate: addBusinessDays(
      new Date(order.paidAt ?? order.createdAt),
      standard.days.max + DISPATCH_BUSINESS_DAYS.max
    )
      .toISOString()
      .slice(0, 10),
  }
}

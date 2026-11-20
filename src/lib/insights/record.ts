import type Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
import type { InsightEvent } from '@/types/payload-types'
import { INSIGHTS_VISITOR_METADATA_KEY, type ServerInsightEvent } from './events'

export type InsightEventData = Omit<InsightEvent, 'id'>

export async function saveInsight(data: InsightEventData): Promise<void> {
  const payload = await getPayload()
  await payload.create({ collection: 'insight-events', data, overrideAccess: true })
}

export interface CheckoutInsightItem {
  productId?: string
  name: string
  quantity: number
  amount: number
}

export async function recordCheckoutInsight({
  name,
  session,
  occurredAt,
  items,
}: {
  name: ServerInsightEvent
  session: Stripe.Checkout.Session
  occurredAt: Date
  items: CheckoutInsightItem[]
}): Promise<void> {
  const email =
    name === 'checkout_abandoned'
      ? (session.customer_details?.email ?? session.customer_email ?? undefined)
      : undefined
  try {
    await saveInsight({
      name,
      path: '/checkout',
      occurredAt: occurredAt.toISOString(),
      visitor: session.metadata?.[INSIGHTS_VISITOR_METADATA_KEY] || undefined,
      value: (session.amount_total ?? 0) / 100,
      detail: email ? { items, email } : { items },
      dedupeKey: `${name}:${session.id}`,
    })
  } catch (error) {
    console.error(`Insight event ${name} not recorded for ${session.id}:`, error)
  }
}

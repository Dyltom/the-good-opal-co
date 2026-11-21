import type Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
import type { InsightEvent } from '@/types/payload-types'
import { INSIGHTS_VISITOR_METADATA_KEY, type ServerInsightEvent } from './events'
import { normalisePath } from './ingest'

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
  name: Exclude<ServerInsightEvent, 'server_error'>
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

export type ServerErrorKind = 'render' | 'route' | 'action' | 'proxy' | 'checkout' | 'stripe_webhook'

export function scrubErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
  return (
    raw
      .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
      .replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]')
      .replace(/\b(sk|pk|rk|whsec|re)_[A-Za-z0-9_]+/g, '[key]')
      .replace(/(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{24,}/g, '[token]')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300) || 'No message'
  )
}

export async function recordServerError({
  kind,
  path,
  error,
  digest,
}: {
  kind: ServerErrorKind
  path: string
  error: unknown
  digest?: string
}): Promise<void> {
  const detail: Record<string, string> = { kind, message: scrubErrorMessage(error) }
  if (digest) detail.digest = digest.slice(0, 40)
  try {
    await saveInsight({
      name: 'server_error' satisfies ServerInsightEvent,
      path: normalisePath(path),
      occurredAt: new Date().toISOString(),
      detail,
    })
  } catch (saveError) {
    console.error('Server error insight not recorded:', saveError)
  }
}

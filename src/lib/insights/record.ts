import { getPayload } from '@/lib/payload'
import type { InsightEvent } from '@/types/payload-types'
import type { ServerInsightEvent } from './events'
import { normalisePath } from './ingest'

export type InsightEventData = Omit<InsightEvent, 'id'>

export async function saveInsight(data: InsightEventData): Promise<void> {
  const payload = await getPayload()
  await payload.create({
    collection: 'insight-events',
    data,
    overrideAccess: true,
    disableTransaction: true,
    depth: 0,
  })
}

export interface CheckoutInsightItem {
  productId?: string
  name: string
  quantity: number
  amount: number
}

export interface CheckoutInsightSource {
  reference: string
  visitor?: string | undefined
  value: number
  email?: string | undefined
}

export async function recordCheckoutInsight({
  name,
  checkout,
  occurredAt,
  items,
}: {
  name: Exclude<ServerInsightEvent, 'server_error'>
  checkout: CheckoutInsightSource
  occurredAt: Date
  items: CheckoutInsightItem[]
}): Promise<void> {
  const email = name === 'checkout_abandoned' ? checkout.email : undefined
  try {
    await saveInsight({
      name,
      path: '/checkout',
      occurredAt: occurredAt.toISOString(),
      visitor: checkout.visitor || undefined,
      value: checkout.value,
      detail: email ? { items, email } : { items },
      dedupeKey: `${name}:${checkout.reference}`,
    })
  } catch (error) {
    console.error(`Insight event ${name} not recorded for ${checkout.reference}:`, error)
  }
}

export type ServerErrorKind =
  | 'render'
  | 'route'
  | 'action'
  | 'proxy'
  | 'checkout'
  | 'stripe_webhook'
  | 'admin'

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

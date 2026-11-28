import { getPayload } from '@/lib/payload'
import type { InsightEvent } from '@/types/payload-types'
import type { ServerInsightEvent } from './events'
import { normalisePath } from './ingest'
import { scrubErrorMessage, scrubSecrets } from '@/lib/scrub-error'

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

function topStackFrames(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined
  const frames = error.stack
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
    .slice(0, 3)
  return frames.length > 0 ? scrubSecrets(frames.join('\n')).slice(0, 500) : undefined
}

const CLIENT_DISCONNECT_MESSAGES = new Set(['aborted', 'failed to pipe response'])

function isRequestNoise(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const code = 'code' in error ? error.code : undefined
  return (
    CLIENT_DISCONNECT_MESSAGES.has(error.message) ||
    error.message.startsWith('Failed to find Server Action') ||
    error.name === 'AbortError' ||
    code === 'ECONNRESET' ||
    code === 'ERR_STREAM_PREMATURE_CLOSE'
  )
}

export async function recordServerError({
  kind,
  path,
  error,
  digest,
  reference,
}: {
  kind: ServerErrorKind
  path: string
  error: unknown
  digest?: string | undefined
  reference?: string | undefined
}): Promise<void> {
  if (isRequestNoise(error)) return
  const detail: Record<string, string> = { kind, message: scrubErrorMessage(error) }
  if (error instanceof Error && error.name !== 'Error') detail.name = error.name.slice(0, 60)
  const stack = topStackFrames(error)
  if (stack) detail.stack = stack
  if (digest) detail.digest = digest.slice(0, 40)
  if (reference) detail.reference = reference.slice(0, 80)
  try {
    await saveInsight({
      name: 'server_error' satisfies ServerInsightEvent,
      path: normalisePath(path),
      occurredAt: new Date().toISOString(),
      detail,
    })
  } catch (saveError) {
    console.error(`Server error insight not recorded: ${scrubErrorMessage(saveError)}`)
  }
}

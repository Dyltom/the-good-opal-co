import { getPayload } from '@/lib/payload'
import { ringDesignSourceReferenceSchema } from './ring-design-reference'

export const instagramReferenceAuditTimeoutMs = 10_000
export const instagramReferenceAuditConcurrency = 3

export const hiddenInstagramRingCandidate = {
  candidateKey: 'unnamed-pear-clean-bezel-2023',
  sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CtEHPylykK3/',
} as const

export type InstagramReferenceOutcome =
  | 'available'
  | 'blocked'
  | 'error'
  | 'not-found'
  | 'rate-limited'
  | 'redirected'

export interface ParsedInstagramReference {
  accountHandle: `@${string}`
  canonicalUrl: string
  contentType: 'p' | 'reel'
  shortcode: string
}

export interface InstagramReferenceCheckData {
  accountHandle: string
  candidateKey?: string
  checkedAt: string
  checkKey: string
  durationMs: number
  httpStatus?: number
  outcome: InstagramReferenceOutcome
  resolvedUrl?: string
  ringDesign?: number
  shortcode: string
  sourceUrl: string
}

export interface InstagramReferenceAuditSummary {
  available: number
  checked: number
  failed: number
  recorded: number
  redirected: number
  skipped: number
}

interface HeaderReader {
  get(name: string): string | null
}

interface InstagramFetchResponse {
  headers: HeaderReader
  status: number
}

export type InstagramReferenceFetch = (
  input: string,
  init: RequestInit
) => Promise<InstagramFetchResponse>

interface RingDesignFindArgs {
  collection: 'ring-designs'
  depth: 0
  limit: 1_000
  overrideAccess: true
  pagination: false
}

interface ReferenceCheckFindArgs {
  collection: 'ring-reference-checks'
  depth: 0
  limit: 1
  overrideAccess: true
  pagination: false
  where: { checkKey: { equals: string } }
}

interface ReferenceCheckCreateArgs {
  collection: 'ring-reference-checks'
  context: { ringReferenceAudit: true }
  data: InstagramReferenceCheckData
  overrideAccess: true
}

export interface RingReferenceAuditPayload {
  create(args: ReferenceCheckCreateArgs): Promise<unknown>
  find(args: ReferenceCheckFindArgs | RingDesignFindArgs): Promise<{ docs: readonly unknown[] }>
}

export interface AuditInstagramReferenceOptions {
  concurrency?: number
  fetchImpl?: InstagramReferenceFetch
  now?: () => Date
  payload?: RingReferenceAuditPayload
  timeoutMs?: number
  timer?: () => number
}

interface RingReferenceTarget {
  candidateKey?: string
  parsed: ParsedInstagramReference
  ringDesign?: number
  sourceUrl: string
}

interface ReferenceCheckResult {
  outcome?: InstagramReferenceOutcome
  recorded: boolean
  skipped: boolean
}

const instagramReferencePath =
  /^\/([A-Za-z0-9._]+)\/(p|reel)\/([A-Za-z0-9_-]+)\/$/

/** Accepts only the canonical reference form already stored by RingDesigns. */
export function parseInstagramReferenceUrl(sourceUrl: string): ParsedInstagramReference | null {
  let url: URL
  try {
    url = new URL(sourceUrl)
  } catch {
    return null
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'www.instagram.com' ||
    url.port !== '' ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    return null
  }

  const match = instagramReferencePath.exec(url.pathname)
  const handle = match?.[1]
  const contentType = match?.[2]
  const shortcode = match?.[3]
  if (!handle || (contentType !== 'p' && contentType !== 'reel') || !shortcode) return null

  const canonicalUrl = `https://www.instagram.com/${handle}/${contentType}/${shortcode}/`
  if (sourceUrl !== canonicalUrl) return null

  return {
    accountHandle: `@${handle}`,
    canonicalUrl,
    contentType,
    shortcode,
  }
}

export function classifyInstagramReferenceStatus(status: number): InstagramReferenceOutcome {
  if (status >= 200 && status < 300) return 'available'
  if (status >= 300 && status < 400) return 'redirected'
  if (status === 404) return 'not-found'
  if (status === 429) return 'rate-limited'
  if (status === 401 || status === 403) return 'blocked'
  return 'error'
}

export function createInstagramReferenceCheckKey(
  checkedAt: Date,
  target: Pick<RingReferenceTarget, 'candidateKey' | 'parsed' | 'ringDesign'>
): string {
  const utcDay = checkedAt.toISOString().slice(0, 10)
  const targetKey =
    target.ringDesign !== undefined
      ? `ring-design:${target.ringDesign}`
      : `candidate:${target.candidateKey ?? 'unknown'}`
  return `instagram:${utcDay}:${targetKey}:${target.parsed.accountHandle.slice(1)}:${target.parsed.contentType}:${target.parsed.shortcode}`
}

function sanitizeRedirectUrl(value: string | null, sourceUrl: string): string | undefined {
  if (!value) return undefined

  let redirectUrl: string
  try {
    redirectUrl = new URL(value, sourceUrl).toString()
  } catch {
    return undefined
  }

  return parseInstagramReferenceUrl(redirectUrl)?.canonicalUrl
}

function recordId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

function recordSourceReferences(value: unknown): unknown[] {
  if (!value || typeof value !== 'object' || !('sourceReferences' in value)) return []
  const references = value.sourceReferences
  return Array.isArray(references) ? references : []
}

async function loadReferenceTargets(
  payload: RingReferenceAuditPayload
): Promise<RingReferenceTarget[]> {
  const designs = await payload.find({
    collection: 'ring-designs',
    depth: 0,
    limit: 1_000,
    overrideAccess: true,
    pagination: false,
  })
  const targets: RingReferenceTarget[] = []
  const identities = new Set<string>()

  for (const design of designs.docs) {
    if (!design || typeof design !== 'object' || !('id' in design)) continue
    const ringDesign = recordId(design.id)
    if (ringDesign === null) continue

    for (const value of recordSourceReferences(design)) {
      const result = ringDesignSourceReferenceSchema.safeParse(value)
      if (!result.success || result.data.sourceType !== 'instagram' || !result.data.sourceUrl) {
        continue
      }
      const parsed = parseInstagramReferenceUrl(result.data.sourceUrl)
      if (!parsed) continue
      const identity = `ring-design:${ringDesign}:${parsed.canonicalUrl}`
      if (identities.has(identity)) continue
      identities.add(identity)
      targets.push({ parsed, ringDesign, sourceUrl: parsed.canonicalUrl })
    }
  }

  const parsedCandidate = parseInstagramReferenceUrl(hiddenInstagramRingCandidate.sourceUrl)
  if (!parsedCandidate) throw new Error('Hidden Instagram ring candidate URL is invalid')
  targets.push({
    candidateKey: hiddenInstagramRingCandidate.candidateKey,
    parsed: parsedCandidate,
    sourceUrl: parsedCandidate.canonicalUrl,
  })

  return targets
}

async function getDefaultAuditPayload(): Promise<RingReferenceAuditPayload> {
  const client = await getPayload()

  return {
    create: (args) => client.create(args),
    find: async (args) => {
      if (args.collection === 'ring-designs') {
        const result = await client.find(args)
        return { docs: result.docs }
      }

      const result = await client.find(args)
      return { docs: result.docs }
    },
  }
}

async function mapWithConcurrency<Input, Output>(
  items: readonly Input[],
  concurrency: number,
  worker: (item: Input) => Promise<Output>
): Promise<Output[]> {
  const results = new Array<Output>(items.length)
  let nextIndex = 0

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item !== undefined) results[index] = await worker(item)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(items.length, concurrency) }, () => runWorker())
  )
  return results
}

async function hasExistingCheck(
  payload: RingReferenceAuditPayload,
  checkKey: string
): Promise<boolean> {
  const existing = await payload.find({
    collection: 'ring-reference-checks',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { checkKey: { equals: checkKey } },
  })
  return existing.docs.length > 0
}

async function runReferenceCheck({
  checkedAt,
  fetchImpl,
  payload,
  target,
  timeoutMs,
  timer,
}: {
  checkedAt: Date
  fetchImpl: InstagramReferenceFetch
  payload: RingReferenceAuditPayload
  target: RingReferenceTarget
  timeoutMs: number
  timer: () => number
}): Promise<ReferenceCheckResult> {
  const checkKey = createInstagramReferenceCheckKey(checkedAt, target)
  if (await hasExistingCheck(payload, checkKey)) {
    return { recorded: false, skipped: true }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = timer()
  let httpStatus: number | undefined
  let outcome: InstagramReferenceOutcome = 'error'
  let resolvedUrl: string | undefined

  try {
    const response = await fetchImpl(target.sourceUrl, {
      cache: 'no-store',
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    })
    if (Number.isInteger(response.status) && response.status >= 100 && response.status <= 599) {
      httpStatus = response.status
      outcome = classifyInstagramReferenceStatus(response.status)
      if (outcome === 'redirected') {
        resolvedUrl = sanitizeRedirectUrl(response.headers.get('location'), target.sourceUrl)
      }
    }
  } catch {
    outcome = 'error'
  } finally {
    clearTimeout(timeout)
  }

  const data: InstagramReferenceCheckData = {
    accountHandle: target.parsed.accountHandle,
    checkedAt: checkedAt.toISOString(),
    checkKey,
    durationMs: Math.max(0, Math.round(timer() - startedAt)),
    ...(httpStatus !== undefined ? { httpStatus } : {}),
    outcome,
    ...(resolvedUrl ? { resolvedUrl } : {}),
    ...(target.ringDesign !== undefined
      ? { ringDesign: target.ringDesign }
      : { candidateKey: target.candidateKey }),
    shortcode: target.parsed.shortcode,
    sourceUrl: target.sourceUrl,
  }

  try {
    await payload.create({
      collection: 'ring-reference-checks',
      context: { ringReferenceAudit: true },
      data,
      overrideAccess: true,
    })
    return { outcome, recorded: true, skipped: false }
  } catch (error) {
    if (await hasExistingCheck(payload, checkKey)) {
      return { recorded: false, skipped: true }
    }
    throw error
  }
}

/** Checks current Payload ring evidence and the governed hidden candidate once per UTC day. */
export async function auditInstagramReferences(
  options: AuditInstagramReferenceOptions = {}
): Promise<InstagramReferenceAuditSummary> {
  const {
    concurrency = instagramReferenceAuditConcurrency,
    fetchImpl = fetch,
    now = () => new Date(),
    timeoutMs = instagramReferenceAuditTimeoutMs,
    timer = Date.now,
  } = options
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error('Instagram reference audit concurrency must be a positive integer')
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Instagram reference audit timeout must be positive')
  }

  const payload = options.payload ?? (await getDefaultAuditPayload())
  const checkedAt = now()
  const targets = await loadReferenceTargets(payload)
  const results = await mapWithConcurrency(targets, concurrency, (target) =>
    runReferenceCheck({ checkedAt, fetchImpl, payload, target, timeoutMs, timer })
  )
  const summary: InstagramReferenceAuditSummary = {
    available: 0,
    checked: 0,
    failed: 0,
    recorded: 0,
    redirected: 0,
    skipped: 0,
  }

  for (const result of results) {
    if (result.skipped) {
      summary.skipped += 1
      continue
    }
    summary.checked += 1
    if (result.recorded) summary.recorded += 1
    if (result.outcome === 'available') summary.available += 1
    else if (result.outcome === 'redirected') summary.redirected += 1
    else summary.failed += 1
  }

  return summary
}

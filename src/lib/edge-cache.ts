import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

export const EDGE_CACHE_TAG = 'html'
export const EDGE_CACHE_SECONDS = 300

export const EDGE_CACHED_PAGES = [
  '/',
  '/about',
  '/blog/:path*',
  '/contact',
  '/courses/:path*',
  '/faq',
  '/gift-vouchers',
  '/gifts',
  '/legal/:path*',
  '/privacy',
  '/returns',
  '/services/:path*',
  '/shipping',
  '/store/:path*',
  '/terms',
] as const

export const EDGE_CACHE_BYPASS_COOKIES = [
  { key: 'payload-token' },
  { key: 'store_three', value: '1' },
  { key: 'store_details', value: '1' },
] as const

export function edgeCacheHeaders() {
  const missing = [
    { type: 'header' as const, key: 'rsc' },
    ...EDGE_CACHE_BYPASS_COOKIES.map((cookie) => ({ type: 'cookie' as const, ...cookie })),
  ]
  return EDGE_CACHED_PAGES.map((source) => ({
    source,
    missing,
    headers: [
      {
        key: 'Cache-Control',
        value: `public, max-age=0, must-revalidate, s-maxage=${EDGE_CACHE_SECONDS}`,
      },
      { key: 'Cache-Tag', value: EDGE_CACHE_TAG },
    ],
  }))
}

const PAGE_COLLECTIONS = new Set([
  'products',
  'inventory-reservations',
  'media',
  'posts',
  'authors',
  'categories',
  'tags',
  'courses',
  'reviews',
  'ring-designs',
  'ring-assets',
])
const SETTLE_MS = 2_000
const MIN_GAP_MS = 15_000
const PURGE_TIMEOUT_MS = 10_000

interface PurgeLogger {
  info: (details: Record<string, unknown>) => void
  warn: (details: Record<string, unknown>) => void
}

interface PurgeCredentials {
  zoneId: string
  token: string
}

let purgeScheduled = false
let lastPurgeAt = Number.NEGATIVE_INFINITY
let reportedUnconfigured = false

function purgeCredentials(): PurgeCredentials | undefined {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim()
  const token = process.env.CLOUDFLARE_PURGE_TOKEN?.trim()
  return zoneId && token ? { zoneId, token } : undefined
}

async function cloudflareErrors(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json()
    if (!body || typeof body !== 'object' || !('errors' in body) || !Array.isArray(body.errors))
      return []
    return body.errors.map((error: unknown) =>
      error && typeof error === 'object'
        ? {
            code: 'code' in error ? error.code : undefined,
            message: 'message' in error ? error.message : undefined,
          }
        : error
    )
  } catch {
    return []
  }
}

async function sendPurge({ zoneId, token }: PurgeCredentials, logger: PurgeLogger): Promise<void> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ tags: [EDGE_CACHE_TAG] }),
        signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
      }
    )
    if (!response.ok) {
      logger.warn({
        msg: 'Edge cache purge failed; pages refresh when their cache expires',
        status: response.status,
        errors: await cloudflareErrors(response),
      })
    }
  } catch (error: unknown) {
    logger.warn({
      msg: 'Edge cache purge failed; pages refresh when their cache expires',
      error: error instanceof Error ? error.message : 'Unknown purge error',
    })
  }
}

export function purgeEdgeCache(logger: PurgeLogger): void {
  const credentials = purgeCredentials()
  if (!credentials) {
    if (!reportedUnconfigured) {
      reportedUnconfigured = true
      logger.info({
        msg: 'Edge cache purge off: CLOUDFLARE_ZONE_ID or CLOUDFLARE_PURGE_TOKEN is unset',
      })
    }
    return
  }
  if (purgeScheduled) return
  purgeScheduled = true
  setTimeout(
    () => {
      purgeScheduled = false
      lastPurgeAt = Date.now()
      void sendPurge(credentials, logger)
    },
    Math.max(SETTLE_MS, lastPurgeAt + MIN_GAP_MS - Date.now())
  )
}

function isPublished(doc: unknown): boolean {
  if (!doc || typeof doc !== 'object' || !('_status' in doc)) return Boolean(doc)
  return doc._status === 'published'
}

const purgeAfterChange: CollectionAfterChangeHook = ({
  collection,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (collection.slug === 'media' && operation === 'create') return doc
  const wasPublished = operation === 'update' && isPublished(previousDoc)
  if (isPublished(doc) || wasPublished) purgeEdgeCache(req.payload.logger)
  return doc
}

const purgeAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  purgeEdgeCache(req.payload.logger)
  return doc
}

const purgeAfterGlobalChange: GlobalAfterChangeHook = ({ doc, req }) => {
  purgeEdgeCache(req.payload.logger)
  return doc
}

export function edgeCached(collection: CollectionConfig): CollectionConfig {
  if (!PAGE_COLLECTIONS.has(collection.slug)) return collection
  const hooks = collection.hooks ?? {}
  return {
    ...collection,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), purgeAfterChange],
      afterDelete: [...(hooks.afterDelete ?? []), purgeAfterDelete],
    },
  }
}

export function edgeCachedGlobal(global: GlobalConfig): GlobalConfig {
  const hooks = global.hooks ?? {}
  return {
    ...global,
    hooks: { ...hooks, afterChange: [...(hooks.afterChange ?? []), purgeAfterGlobalChange] },
  }
}

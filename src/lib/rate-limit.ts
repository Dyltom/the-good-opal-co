import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { Redis } from '@upstash/redis'

type LocalCounter = { count: number; expiresAt: number }
type RuntimeEnvironment = Readonly<Record<string, string | undefined>>

const localCounters = new Map<string, LocalCounter>()

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32)
}

export function getRateLimitNamespace(env: RuntimeEnvironment = process.env): string {
  const vercelEnvironment = env.VERCEL_ENV?.trim()

  if (vercelEnvironment === 'production') return 'production'
  if (vercelEnvironment === 'preview') {
    const previewIdentity = env.VERCEL_GIT_COMMIT_REF?.trim() || env.VERCEL_URL?.trim()
    return previewIdentity ? `preview-${hash(previewIdentity).slice(0, 12)}` : 'preview'
  }
  if (vercelEnvironment === 'development') return 'development'

  return env.NODE_ENV === 'production' ? 'production' : 'development'
}

export function getRateLimitKey({
  scope,
  identifier,
  windowSeconds,
  now = Date.now(),
  env = process.env,
}: {
  scope: string
  identifier: string
  windowSeconds: number
  now?: number
  env?: RuntimeEnvironment
}): string {
  const bucket = Math.floor(now / (windowSeconds * 1000))
  return `rate-limit:${getRateLimitNamespace(env)}:${scope}:${identifier}:${bucket}`
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL?.trim()
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN?.trim()
  return url && token ? new Redis({ url, token }) : null
}

export async function getRequestIdentifier(identity?: string): Promise<string> {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwardedFor || requestHeaders.get('x-real-ip') || 'unknown'
  return hash(`${address}:${identity?.trim().toLowerCase() ?? ''}`)
}

export async function checkRateLimit({
  scope,
  identifier,
  limit,
  windowSeconds,
}: {
  scope: string
  identifier: string
  limit: number
  windowSeconds: number
}): Promise<boolean> {
  const key = getRateLimitKey({ scope, identifier, windowSeconds })
  const redis = getRedis()

  if (redis) {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, windowSeconds * 2)
    return count <= limit
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Upstash Redis is required for production rate limiting')
  }

  const now = Date.now()
  const current = localCounters.get(key)
  const next =
    !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + windowSeconds * 1000 }
      : { ...current, count: current.count + 1 }
  localCounters.set(key, next)
  return next.count <= limit
}

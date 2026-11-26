import { createHash } from 'node:crypto'
import { Redis } from '@upstash/redis'
import { clientIp } from './client-ip.ts'

type LocalCounter = { count: number; expiresAt: number }
type RuntimeEnvironment = Readonly<Record<string, string | undefined>>

const localCounters = new Map<string, LocalCounter>()

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32)
}

export function getRateLimitNamespace(env: RuntimeEnvironment = process.env): string {
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

export function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL?.trim()
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN?.trim()
  return url && token ? new Redis({ url, token }) : null
}

export async function getRequestIdentifier(identity?: string): Promise<string> {
  const { headers } = await import('next/headers')
  return requestIdentifier(await headers(), identity)
}

export function requestIdentifier(requestHeaders: Headers, identity?: string): string {
  return hash(`${clientIp(requestHeaders)}:${identity?.trim().toLowerCase() ?? ''}`)
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

  const now = Date.now()
  const current = localCounters.get(key)
  const next =
    !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + windowSeconds * 1000 }
      : { ...current, count: current.count + 1 }
  localCounters.set(key, next)
  return next.count <= limit
}

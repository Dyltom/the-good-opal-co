import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { Redis } from '@upstash/redis'

type LocalCounter = { count: number; expiresAt: number }

const localCounters = new Map<string, LocalCounter>()

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32)
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
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
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `rate-limit:${scope}:${identifier}:${bucket}`
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
  const next = !current || current.expiresAt <= now
    ? { count: 1, expiresAt: now + windowSeconds * 1000 }
    : { ...current, count: current.count + 1 }
  localCounters.set(key, next)
  return next.count <= limit
}

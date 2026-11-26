import { randomBytes } from 'node:crypto'
import { headers } from 'next/headers'
import { getRateLimitNamespace, getRedis } from '@/lib/rate-limit'
import { clientIp } from '@/lib/client-ip'
import { hashVisitor } from './ingest'

const SALT_TTL_SECONDS = 60 * 60 * 48

type DailySalt = { day: string; salt: string }

const saltStore = globalThis as typeof globalThis & { __goodOpalInsightsSalt?: DailySalt }

async function dailySalt(day: string): Promise<string> {
  const current = saltStore.__goodOpalInsightsSalt
  if (current?.day === day) return current.salt

  let salt = `s${randomBytes(16).toString('hex')}`
  const redis = getRedis()
  if (redis) {
    try {
      const key = `insights:${getRateLimitNamespace()}:salt:${day}`
      await redis.set(key, salt, { nx: true, ex: SALT_TTL_SECONDS })
      const stored = await redis.get<string>(key)
      if (typeof stored === 'string') salt = stored
    } catch (error) {
      console.error('Insights salt could not be shared through Redis:', error)
    }
  }

  saltStore.__goodOpalInsightsSalt = { day, salt }
  return salt
}

export async function visitorKey(requestHeaders: Headers, now = new Date()): Promise<string> {
  const salt = await dailySalt(now.toISOString().slice(0, 10))
  return hashVisitor(salt, clientIp(requestHeaders), requestHeaders.get('user-agent') ?? '')
}

export async function requestVisitorKey(): Promise<string | undefined> {
  try {
    return await visitorKey(await headers())
  } catch {
    return undefined
  }
}

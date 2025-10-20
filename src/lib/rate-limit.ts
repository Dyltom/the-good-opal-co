/**
 * Rate Limiting Utility
 *
 * Uses Upstash Redis for serverless-friendly rate limiting
 * Protects APIs from abuse without infrastructure overhead
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Create rate limiter instance (lazy-loaded)
 */
let rateLimiter: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  if (!rateLimiter) {
    // Only create if Upstash credentials exist
    const url = process.env['UPSTASH_REDIS_REST_URL']
    const token = process.env['UPSTASH_REDIS_REST_TOKEN']

    if (!url || !token) {
      // Not configured - rate limiting disabled
      return null
    }

    const redis = new Redis({
      url,
      token,
    })

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  }

  return rateLimiter
}

/**
 * Rate limit by IP address
 *
 * @param identifier - Usually IP address or user ID
 * @returns Whether request is allowed
 */
export async function rateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const limiter = getRateLimiter()

  // If not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/**
 * Get IP address from request headers
 *
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  const real = headers.get('x-real-ip')
  const cfConnecting = headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  if (real) {
    return real
  }
  if (cfConnecting) {
    return cfConnecting
  }

  return 'unknown'
}

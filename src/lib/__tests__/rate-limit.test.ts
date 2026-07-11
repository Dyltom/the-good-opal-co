import { describe, expect, test } from 'vitest'
import { getRateLimitKey, getRateLimitNamespace } from '@/lib/rate-limit'

describe('rate-limit environment isolation', () => {
  test('keeps production and preview counters in different namespaces', () => {
    const shared = {
      scope: 'contact',
      identifier: 'customer',
      windowSeconds: 60,
      now: 60_000,
    }

    const productionKey = getRateLimitKey({
      ...shared,
      env: { VERCEL_ENV: 'production' },
    })
    const previewKey = getRateLimitKey({
      ...shared,
      env: { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feature/course-copy' },
    })

    expect(productionKey).toBe('rate-limit:production:contact:customer:1')
    expect(previewKey).toMatch(/^rate-limit:preview-[a-f0-9]{12}:contact:customer:1$/)
    expect(previewKey).not.toBe(productionKey)
  })

  test('isolates separate preview branches while remaining stable within a branch', () => {
    const first = getRateLimitNamespace({
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'feature/opal-builder',
    })
    const same = getRateLimitNamespace({
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'feature/opal-builder',
    })
    const other = getRateLimitNamespace({
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'feature/checkout',
    })

    expect(first).toBe(same)
    expect(first).not.toBe(other)
  })
})

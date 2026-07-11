import { describe, expect, test } from 'vitest'
import {
  assertValidCoreProductionConfiguration,
  assessDeploymentReadiness,
} from '../deployment-readiness'

const validEnvironment = {
  NODE_ENV: 'production',
  PAYLOAD_SECRET: 'uR2zX8fH4mQ9vB7cK3pL6sN1dT5wY0aE',
  QUOTE_LINK_SECRET: 'qL8vN2cR5xT9mK4dS7pW1yH6bF3aJ0uZ',
  NEXT_PUBLIC_APP_URL: 'https://shop.goodopal.test',
  EMAIL_FROM: 'The Good Opal Co <orders@send.goodopal.test>',
  STRIPE_SECRET_KEY: `sk_live_${'a'.repeat(24)}`,
  STRIPE_WEBHOOK_SECRET: `whsec_${'b'.repeat(24)}`,
  RESEND_API_KEY: `re_${'c'.repeat(24)}`,
  EMAIL_DELIVERY_VERIFIED: 'true',
  BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_real-token-value',
  UPSTASH_REDIS_REST_URL: 'https://helpful-falcon.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'real-redis-token-value',
} as const

describe('deployment readiness', () => {
  test('reports a fully configured production environment as ready', () => {
    expect(assessDeploymentReadiness(validEnvironment)).toEqual({
      ready: true,
      revenueReady: true,
      status: 'ready',
      checks: {
        core: true,
        payments: true,
        email: true,
        storage: true,
        rateLimiting: true,
      },
      issues: [],
    })
  })

  test('rejects malformed and obvious placeholder values without returning their contents', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      PAYLOAD_SECRET: 'your-secret-key-minimum-32-characters-long-please',
      QUOTE_LINK_SECRET: 'short',
      NEXT_PUBLIC_APP_URL: 'http://shop.goodopal.test?secret=value',
      EMAIL_FROM: 'not-an-email',
      STRIPE_SECRET_KEY: 'sk_test_xxxxxxxxxxxx',
      STRIPE_WEBHOOK_SECRET: 'whsec_xxxxxxxxxxxx',
      RESEND_API_KEY: 'not-a-resend-key',
      BLOB_READ_WRITE_TOKEN: '',
      UPSTASH_REDIS_REST_URL: 'not-a-url',
      UPSTASH_REDIS_REST_TOKEN: '',
    })

    expect(readiness).toMatchObject({
      ready: false,
      revenueReady: false,
      status: 'degraded',
      checks: {
        core: false,
        payments: false,
        email: false,
        storage: false,
        rateLimiting: false,
      },
    })
    expect(readiness.issues).toEqual([
      'payload_secret_invalid',
      'quote_link_secret_invalid',
      'app_url_invalid',
      'email_from_invalid',
      'stripe_secret_key_invalid',
      'stripe_webhook_secret_invalid',
      'resend_api_key_invalid',
      'blob_storage_unavailable',
      'redis_url_invalid',
      'redis_token_missing',
    ])
    expect(JSON.stringify(readiness)).not.toContain('secret=value')
    expect(JSON.stringify(readiness)).not.toContain('xxxxxxxxxxxx')
  })

  test('keeps core storefront readiness separate from payment readiness', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      STRIPE_SECRET_KEY: 'sk_test_xxxxxxxxxxxx',
      STRIPE_WEBHOOK_SECRET: 'whsec_xxxxxxxxxxxx',
    })

    expect(readiness.checks.core).toBe(true)
    expect(readiness.checks.payments).toBe(false)
    expect(readiness.revenueReady).toBe(false)
    expect(readiness.ready).toBe(false)
  })

  test('requires live payments and verified real-recipient email in production', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      STRIPE_SECRET_KEY: `sk_test_${'a'.repeat(24)}`,
      EMAIL_DELIVERY_VERIFIED: 'false',
    })

    expect(readiness.checks.payments).toBe(false)
    expect(readiness.checks.email).toBe(false)
    expect(readiness.issues).toContain('stripe_live_mode_required')
    expect(readiness.issues).toContain('email_delivery_unverified')
  })

  test('accepts Upstash Marketplace alias variable names', () => {
    const {
      UPSTASH_REDIS_REST_URL: _url,
      UPSTASH_REDIS_REST_TOKEN: _token,
      ...withoutCanonicalRedis
    } = validEnvironment

    const readiness = assessDeploymentReadiness({
      ...withoutCanonicalRedis,
      UPSTASH_REDIS_REST_KV_REST_API_URL: 'https://helpful-falcon.upstash.io',
      UPSTASH_REDIS_REST_KV_REST_API_TOKEN: 'real-redis-token-value',
    })

    expect(readiness.checks.rateLimiting).toBe(true)
  })

  test('only security-critical core defects stop production configuration', () => {
    expect(() =>
      assertValidCoreProductionConfiguration({
        ...validEnvironment,
        STRIPE_SECRET_KEY: 'sk_test_xxxxxxxxxxxx',
        STRIPE_WEBHOOK_SECRET: 'whsec_xxxxxxxxxxxx',
      })
    ).not.toThrow()

    expect(() =>
      assertValidCoreProductionConfiguration({
        ...validEnvironment,
        PAYLOAD_SECRET: 'short',
      })
    ).toThrow('payload_secret_invalid')
  })

  test('allows local HTTP app URLs outside production', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      NODE_ENV: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:8412',
    })

    expect(readiness.checks.core).toBe(true)
  })

  test('uses Vercel deployment target instead of NODE_ENV for preview readiness', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_APP_URL: 'http://preview.goodopal.test',
      STRIPE_SECRET_KEY: `sk_test_${'a'.repeat(24)}`,
      EMAIL_DELIVERY_VERIFIED: 'false',
    })

    expect(readiness.checks.core).toBe(true)
    expect(readiness.checks.payments).toBe(true)
    expect(readiness.checks.email).toBe(true)
    expect(readiness.issues).not.toContain('stripe_live_mode_required')
    expect(readiness.issues).not.toContain('email_delivery_unverified')
    expect(() =>
      assertValidCoreProductionConfiguration({
        ...validEnvironment,
        VERCEL_ENV: 'preview',
        PAYLOAD_SECRET: 'short',
      })
    ).not.toThrow()
  })

  test('still enforces live credentials for Vercel production', () => {
    const readiness = assessDeploymentReadiness({
      ...validEnvironment,
      VERCEL_ENV: 'production',
      STRIPE_SECRET_KEY: `sk_test_${'a'.repeat(24)}`,
    })

    expect(readiness.issues).toContain('stripe_live_mode_required')
  })
})

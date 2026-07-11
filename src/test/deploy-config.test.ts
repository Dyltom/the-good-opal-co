import { describe, expect, test } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('deployment config', () => {
  test('Payload generates types at the path imported by the app', () => {
    const source = read('src/payload.config.ts')

    expect(source).toMatch(/path\.resolve\(dirname,\s*'types',\s*'payload-types\.ts'\)/)
  })

  test('Payload does not use the scaffolded secret in production', () => {
    const source = read('src/payload.config.ts')

    expect(source).not.toContain('your-secret-key-here')
    expect(source).toMatch(/PAYLOAD_SECRET/)
    expect(source).toMatch(/NODE_ENV.+production|production.+NODE_ENV/s)
  })

  test('production uses DATABASE_URL and never pushes schema changes', () => {
    const source = read('src/payload.config.ts')

    expect(source).toContain("process.env['DATABASE_URL']")
    expect(source).toContain("push: process.env['NODE_ENV'] !== 'production'")
    expect(source).toContain("parsed.searchParams.set('sslmode', 'verify-full')")
    expect(source).not.toContain('POSTGRES_HOST')
  })

  test('production media storage token is documented', () => {
    expect(read('.env.example')).toContain('BLOB_READ_WRITE_TOKEN=')
  })

  test('demo discounts are not connected to checkout', () => {
    const action = read('src/app/(marketing)/checkout/actions.ts')
    const form = read('src/app/(marketing)/checkout/checkout-form.tsx')

    expect(action).not.toContain('getDiscountManager')
    expect(action).not.toContain('discountCode')
    expect(form).not.toContain('DiscountCodeInput')
  })

  test('marketing layout defines metadataBase for social image URLs', () => {
    const source = read('src/app/(marketing)/layout.tsx')

    expect(source).toContain('metadataBase')
    expect(source).toContain('new URL(APP_URL)')
  })

  test('admin email and distributed rate limiting are production-configured', () => {
    const config = read('src/payload.config.ts')
    const env = read('.env.example')

    expect(config).toContain('resendAdapter')
    expect(env).toContain('UPSTASH_REDIS_REST_URL=')
    expect(env).toContain('UPSTASH_REDIS_REST_TOKEN=')
  })

  test('ESLint ignores agent tooling outside the deployable app', () => {
    const source = read('eslint.config.mjs')

    expect(source).toContain("'**/.agents/**'")
  })

  test('Vercel runs committed migrations before the production build', () => {
    const config = JSON.parse(read('vercel.json')) as { buildCommand?: string }
    const migrations = readdirSync(resolve(__dirname, '..', 'migrations'))

    expect(config.buildCommand).toBe(
      'pnpm payload generate:importmap && pnpm payload migrate && pnpm build'
    )
    expect(migrations.some((file) => file.endsWith('.ts') && file !== 'index.ts')).toBe(true)
  })

  test('Payload admin uses the generated import map without a shadowing TypeScript stub', () => {
    const importMap = read('src/app/(payload)/admin/importMap.js')

    expect(importMap).toContain('VercelBlobClientUploadHandler')
    expect(() => read('src/app/(payload)/admin/importMap.ts')).toThrow()
  })

  test('Payload does not maintain an unused transactional search index', () => {
    const config = read('src/payload.config.ts')
    const search = read('src/app/(marketing)/search/actions.ts')

    expect(config).not.toContain('searchPlugin')
    expect(search).toContain("collection: 'products'")
  })

  test('Payload-backed catalog surfaces are not frozen at build time', () => {
    for (const file of [
      'src/app/(marketing)/page.tsx',
      'src/app/(marketing)/store/page.tsx',
      'src/app/(marketing)/blog/page.tsx',
      'src/app/api/products/route.ts',
    ]) {
      expect(read(file), file).toContain("export const dynamic = 'force-dynamic'")
    }
  })

  test('paid Stripe line items drive transactional order fulfilment', () => {
    const webhook = read('src/app/api/webhooks/stripe/route.ts')
    const checkout = read('src/app/(marketing)/checkout/actions.ts')

    expect(webhook).toContain("session.payment_status !== 'paid'")
    expect(webhook).toContain('listLineItems')
    expect(webhook).toContain('beginTransaction')
    expect(webhook).toContain('commitTransaction')
    expect(webhook).toContain('rollbackTransaction')
    expect(checkout).not.toContain('cartItems: JSON.stringify')
  })

  test('newsletter links use persisted hashed tokens and a real unsubscribe route', () => {
    const service = read('src/lib/newsletter/service.ts')
    const unsubscribe = read('src/app/(marketing)/newsletter/unsubscribe/page.tsx')

    expect(service).toContain('randomBytes(32)')
    expect(service).toContain('confirmationTokenHash')
    expect(service).toContain('equals: tokenHash')
    expect(service).toContain('unsubscribeTokenHash')
    expect(service).not.toContain('equals: token.toLowerCase()')
    expect(unsubscribe).toContain('submitNewsletterUnsubscribe')
  })

  test('legacy commerce and editorial URLs retain permanent destinations', () => {
    const config = read('next.config.ts')

    expect(config).toContain("destination: `/blog/${slug}`")
    expect(config).toContain("['/shop', '/store']")
    expect(config).toContain("source: '/product/:slug'")
    expect(config).toContain("['/privacy-policy', '/legal/privacy']")
    expect(config).not.toContain("['/checkout', '/cart']")
  })
})

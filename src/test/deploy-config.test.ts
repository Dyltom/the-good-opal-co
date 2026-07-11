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
    expect(source).toContain("process.env['NODE_ENV'] !== 'production'")
    expect(source).toContain("process.env['PAYLOAD_DB_PUSH'] !== 'false'")
    expect(source).toContain("parsed.searchParams.set('sslmode', 'verify-full')")
    expect(source).not.toContain('POSTGRES_HOST')
  })

  test('production media storage token is documented', () => {
    expect(read('.env.example')).toContain('BLOB_READ_WRITE_TOKEN=')
  })

  test('image optimization avoids the legacy AVIF conversion stall', () => {
    const config = read('next.config.ts')

    expect(config).toContain("formats: ['image/webp']")
    expect(config).not.toContain("formats: ['image/avif'")
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

  test('public marketing pages declare canonicals and private flows are noindex', () => {
    const publicPages = [
      ['src/app/(marketing)/page.tsx', '/'],
      ['src/app/(marketing)/store/page.tsx', '/store'],
      ['src/app/(marketing)/services/page.tsx', '/services'],
      ['src/app/(marketing)/about/page.tsx', '/about'],
      ['src/app/(marketing)/contact/page.tsx', '/contact'],
      ['src/app/(marketing)/blog/page.tsx', '/blog'],
      ['src/app/(marketing)/returns/page.tsx', '/returns'],
    ] as const

    for (const [file, canonical] of publicPages) {
      expect(read(file), file).toContain(`alternates: { canonical: '${canonical}' }`)
    }

    for (const file of [
      'src/app/(marketing)/cart/page.tsx',
      'src/app/(marketing)/checkout/page.tsx',
      'src/app/(marketing)/checkout/success/page.tsx',
      'src/app/(marketing)/order-tracking/page.tsx',
      'src/app/(marketing)/newsletter/confirm/page.tsx',
      'src/app/(marketing)/newsletter/success/page.tsx',
    ]) {
      expect(read(file), file).toContain('robots: { index: false, follow: false }')
    }
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

  test('Vercel migrates isolated production and preview databases before building', () => {
    const config = JSON.parse(read('vercel.json')) as { buildCommand?: string }
    const buildScript = read('scripts/vercel-build.mjs')
    const migrations = readdirSync(resolve(__dirname, '..', 'migrations'))

    expect(config.buildCommand).toBe('node scripts/vercel-build.mjs')
    expect(buildScript).toContain("vercelEnvironment === 'production'")
    expect(buildScript).toContain("vercelEnvironment === 'preview'")
    expect(buildScript).toContain("run('pnpm', ['payload', 'migrate'])")
    expect(buildScript).toContain(
      "vercelEnvironment === 'production' && process.env.WOO_IMPORT_ON_DEPLOY === 'true'"
    )
    expect(buildScript).toContain("process.env.WOO_IMPORT_ON_DEPLOY === 'true'")
    expect(buildScript).toContain('WOO_IMPORT_RUN_ID is required')
    expect(buildScript).toContain('WOO_IMPORT_MODE must be initial or final-delta')
    expect(buildScript).toContain("WOO_IMPORT_APPLY: 'true'")
    expect(buildScript.indexOf("['payload', 'migrate']")).toBeLessThan(
      buildScript.indexOf("['build']")
    )
    expect(migrations.some((file) => file.endsWith('.ts') && file !== 'index.ts')).toBe(true)
  })

  test('commerce conversion analytics run in the browser', () => {
    const checkoutAction = read('src/app/(marketing)/checkout/actions.ts')
    const checkoutForm = read('src/app/(marketing)/checkout/checkout-form.tsx')
    const newsletterAction = read('src/app/(marketing)/newsletter/actions.ts')
    const newsletterConversion = read('src/components/newsletter/NewsletterConversion.tsx')
    const checkoutSuccess = read('src/app/(marketing)/checkout/success/page.tsx')
    const purchaseConversion = read('src/app/(marketing)/checkout/success/clear-cart.tsx')

    expect(checkoutAction).not.toContain('trackBeginCheckout')
    expect(checkoutForm).toContain('trackBeginCheckout(cart.items, pricing.total)')
    expect(newsletterAction).not.toContain('trackNewsletterSignup')
    expect(newsletterConversion).toContain("'use client'")
    expect(newsletterConversion).toContain("trackNewsletterSignup('email-confirmation')")
    expect(checkoutSuccess).toContain("expand: ['line_items.data.price.product']")
    expect(purchaseConversion).toContain('trackPurchase(')
  })

  test('Payload admin uses the generated import map without a shadowing TypeScript stub', () => {
    const importMap = read('src/app/(payload)/admin/importMap.js')

    expect(importMap).toContain('VercelBlobClientUploadHandler')
    expect(() => read('src/app/(payload)/admin/importMap.ts')).toThrow()
  })

  test('production headers constrain executable and embedded content', () => {
    const config = read('next.config.ts')

    expect(config).toContain("key: 'Content-Security-Policy'")
    expect(config).toContain('createContentSecurityPolicy()')
    expect(config).toContain("key: 'X-Content-Type-Options'")

    const policy = read('src/lib/content-security-policy.ts')
    expect(policy).toContain("object-src 'none'")
    expect(policy).toContain("frame-ancestors 'none'")
    expect(policy).toContain("script-src 'self' 'unsafe-inline'")
    expect(policy).toContain('https://va.vercel-scripts.com')
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
      'src/app/api/store-products/route.ts',
    ]) {
      expect(read(file), file).toContain("export const dynamic = 'force-dynamic'")
    }
  })

  test('catalogue backfill uses only facts present in imported product copy', () => {
    const migration = read('src/migrations/20260712_090000_catalogue_fact_backfill.ts')

    expect(migration).toContain('WHERE "category" = \'raw-opals\'')
    expect(migration).toContain('"material" = COALESCE("material", \'none\')')
    expect(migration).toContain('"weight_unit", \'carats\'')
    expect(migration).toContain('WHERE "slug" = \'gemini-ring-2\'')
    expect(migration).toContain('"material" = \'sterling-silver\'')
    expect(migration).toContain('"ring_size" = \'6.5\'')
    expect(migration).toContain("'doublet-opal-earrings-bouquet-studs'")
  })

  test('paid Stripe line items drive transactional order fulfilment', () => {
    const webhook = read('src/app/api/webhooks/stripe/route.ts')
    const checkout = read('src/app/(marketing)/checkout/actions.ts')

    expect(webhook).toContain("session.payment_status !== 'paid'")
    expect(webhook).toContain('listLineItems')
    expect(webhook).toContain('beginTransaction')
    expect(webhook).toContain('commitTransaction')
    expect(webhook).toContain('rollbackTransaction')
    expect(webhook).toContain('idempotencyKey: `order-confirmation/${order.id}`')
    expect(webhook).toContain('idempotencyKey: `inventory-review/${order.id}`')
    expect(webhook).toContain("event.type === 'checkout.session.expired'")
    expect(webhook).toContain("event.type === 'checkout.session.async_payment_failed'")
    expect(webhook).toContain('reservedInventoryAvailable')
    expect(webhook).toContain("status: 'consumed'")
    expect(checkout).toContain('reserveCheckoutInventory')
    expect(checkout).toContain('expires_at:')
    expect(checkout).toContain('idempotencyKey: `checkout/${checkoutAttemptId}`')
    expect(checkout).not.toContain('delivery_estimate')
    expect(checkout).not.toContain('cartItems: JSON.stringify')
  })

  test('admin and refund reconciliation cannot falsify financial state', () => {
    const orders = read('src/payload/collections/Orders.ts')
    const customers = read('src/payload/collections/Customers.ts')
    const webhook = read('src/app/api/webhooks/stripe/route.ts')

    expect(orders).toContain("!context['stripeRefundReconciliation']")
    expect(orders).toContain('Refund status is set only after Stripe confirms')
    expect(customers).toContain('Customer has financial order records and cannot be deleted')
    expect(webhook).toContain('context: { stripeRefundReconciliation: true }')
    expect(webhook).toContain('order and inventory refund reconciliation continued')
    expect(webhook).not.toContain('Customer record missing for Stripe order')
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

    expect(config).toContain('destination: `/blog/${slug}`')
    expect(config).toContain("['/shop', '/store']")
    expect(config).toContain("source: '/product/:slug'")
    expect(config).toContain("['/privacy-policy', '/legal/privacy']")
    expect(config).not.toContain("['/checkout', '/cart']")
  })
})

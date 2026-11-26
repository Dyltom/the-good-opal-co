import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import sharp from 'sharp'

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

  test('image optimization avoids the legacy AVIF conversion stall', () => {
    const config = read('next.config.ts')

    expect(config).toContain("formats: ['image/webp']")
    expect(config).not.toContain("formats: ['image/avif'")
  })

  test('demo discounts are not connected to checkout', () => {
    const action = read('src/app/(marketing)/checkout/actions.ts')

    expect(action).not.toContain('getDiscountManager')
    expect(action).not.toContain('discountCode')
  })

  test('marketing layout defines metadataBase for social image URLs', () => {
    const source = read('src/app/(marketing)/layout.tsx')

    expect(source).toContain('metadataBase')
    expect(source).toContain('new URL(APP_URL)')
  })

  test('public marketing pages declare canonicals and private flows are noindex', () => {
    const publicPages = [
      ['src/app/(marketing)/page.tsx', '/'],
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
      'src/app/(marketing)/checkout/success/page.tsx',
      'src/app/(marketing)/order-tracking/page.tsx',
      'src/app/(marketing)/newsletter/confirm/page.tsx',
      'src/app/(marketing)/newsletter/success/page.tsx',
    ]) {
      expect(read(file), file).toContain('robots: { index: false, follow: false }')
    }
  })

  test('admin email is production-configured', () => {
    expect(read('src/payload.config.ts')).toContain('resendAdapter')
  })

  test('private quote bearer links are excluded from logs, caching, indexing, and analytics', () => {
    const config = read('next.config.ts')
    const analytics = read('src/components/analytics/AnalyticsConsentGate.tsx')
    const googleTag = read('src/components/analytics/GoogleTag.tsx')
    const accessPage = read('src/app/(marketing)/quote/access/quote-access-redeemer.tsx')
    const quotePage = read('src/app/(marketing)/quote/[quoteNumber]/page.tsx')

    expect(config).toContain("source: '/quote/:path*'")
    expect(config).toContain("source: '/api/quote/:path*'")
    expect(config).toContain("{ key: 'Referrer-Policy', value: 'no-referrer' }")
    expect(config).toContain("{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }")
    expect(analytics).toContain("pathname.startsWith('/quote')")
    expect(googleTag).toContain("location.pathname.indexOf('/quote')===0")
    expect(accessPage).toContain('window.location.hash.slice(1)')
    expect(accessPage).toContain("replaceState(null, '', '/quote/access')")
    expect(quotePage).toContain("export const dynamic = 'force-dynamic'")
    expect(quotePage).toContain('index: false, follow: false, nocache: true')
  })

  test('ESLint ignores agent tooling outside the deployable app', () => {
    const source = read('eslint.config.mjs')

    expect(source).toContain("'**/.agents/**'")
  })

  test('commerce conversion analytics run in the browser', () => {
    const checkoutAction = read('src/app/(marketing)/checkout/actions.ts')
    const checkoutButton = read('src/components/cart/CheckoutButton.tsx')
    const newsletterAction = read('src/app/(marketing)/newsletter/actions.ts')
    const newsletterConversion = read('src/components/newsletter/NewsletterConversion.tsx')
    const checkoutSuccess = read('src/app/(marketing)/checkout/success/page.tsx')
    const purchaseConversion = read('src/app/(marketing)/checkout/success/clear-cart.tsx')

    expect(checkoutAction).not.toContain('trackBeginCheckout')
    expect(checkoutButton).toContain('trackBeginCheckout(cart.items, cart.total)')
    expect(newsletterAction).not.toContain('trackNewsletterSignup')
    expect(newsletterConversion).toContain("'use client'")
    expect(newsletterConversion).toContain("trackNewsletterSignup('email-confirmation')")
    expect(checkoutSuccess).toContain("expand: ['line_items.data.price.product'")
    expect(purchaseConversion).toContain('trackPurchase(')
  })

  test('global discovery metadata exposes rich previews and the editorial feed', () => {
    const layout = read('src/app/(marketing)/layout.tsx')

    expect(layout).toContain("'application/rss+xml': `${APP_URL}/feed.xml`")
    expect(layout).toContain('url: SHARE_IMAGE_URL')
    expect(layout).toContain("'max-image-preview': 'large'")
    expect(layout).toContain("'max-snippet': -1")
  })

  test('the link-preview image is small, upright and 1200x630 so chat apps render it', async () => {
    const path = resolve(__dirname, '..', '..', 'public/images/share-card.jpg')
    const { width, height, orientation, size } = await sharp(path).metadata()

    expect({ width, height, orientation }).toEqual({ width: 1200, height: 630, orientation: undefined })
    expect(size ?? readFileSync(path).length).toBeLessThan(300_000)
  })

  test('Payload admin uses the generated import map without a shadowing TypeScript stub', () => {
    const importMap = read('src/app/(payload)/admin/importMap.js')

    expect(importMap).toContain('InsightsView')
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
    const fulfil = read('src/lib/orders/fulfil-paid-checkout.ts')

    expect(webhook).toContain("session.payment_status !== 'paid'")
    expect(webhook).toContain('listLineItems')
    expect(webhook).toContain('fulfilPaidCheckout(')
    expect(fulfil).toContain('beginTransaction')
    expect(fulfil).toContain('commitTransaction')
    expect(fulfil).toContain('rollbackTransaction')
    expect(fulfil).toContain('idempotencyKey: `order-confirmation/${order.id}`')
    expect(fulfil).toContain('idempotencyKey: `owner-order/${order.id}`')
    expect(webhook).toContain("event.type === 'checkout.session.expired'")
    expect(webhook).toContain("event.type === 'checkout.session.async_payment_failed'")
    expect(fulfil).toContain('reservedInventoryAvailable')
    expect(fulfil).toContain("status: 'consumed'")
    expect(checkout).toContain('reserveCheckoutInventory')
    expect(checkout).toContain('expires_at:')
    expect(checkout).toContain('idempotencyKey: `checkout/${checkoutAttemptId}`')
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

    expect(config).toContain("destination: '/blog/:slug'")
    expect(config).toContain("['/shop', '/store']")
    expect(config).toContain("source: '/product/:slug'")
    expect(config).toContain("['/privacy-policy', '/legal/privacy']")
    expect(config).not.toContain("['/checkout', '/cart']")
  })
})

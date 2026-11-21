import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { createContentSecurityPolicy } from './src/lib/content-security-policy'

const contentSecurityPolicy = createContentSecurityPolicy()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { viewTransition: true },
  ...(process.env.NEXT_OUTPUT === 'standalone' ? { output: 'standalone' as const } : {}),

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=()',
          },
        ],
      },
      {
        source: '/quote/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/api/quote/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ]
  },

  // Image optimization
  images: {
    // AVIF conversion can stall on large legacy PNG assets with misleading
    // extensions. WebP keeps modern compression without blocking page load.
    formats: ['image/webp'],
    qualities: [75, 85, 90, 92, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  async redirects() {
    const legacyPages = [
      ['/refund_returns', '/returns'],
      ['/gift-card', '/store'],
      ['/white-opal', '/store?stone=white-opal'],
      ['/crystal-opal', '/store?stone=crystal-opal'],
      ['/boulder-opal', '/store?stone=boulder-opal'],
      ['/black-opal', '/store?stone=black-opal'],
      ['/custom-rings', '/services'],
      ['/blog-the-good-opal-co-blogs-on-opal', '/blog'],
      ['/about-the-good-opal-co', '/about'],
      ['/my-account', '/order-tracking'],
      ['/good-opal-co-shopping-cart', '/cart'],
      ['/shop', '/store'],
      ['/terms-of-sale', '/legal/terms'],
      ['/privacy-policy', '/legal/privacy'],
      ['/product-category/opals/black-opals', '/store?stone=black-opal'],
      ['/product-category/opals/white-opals', '/store?stone=white-opal'],
      ['/product-category/opals/crystal-opals', '/store?stone=crystal-opal'],
      ['/product-category/opals/boulder-opal', '/store?stone=boulder-opal'],
      ['/product-category/custom-parcel', '/store?category=custom-commissions'],
      ['/product-tag/black-opal', '/store?stone=black-opal'],
      ['/product-tag/crystal-opal', '/store?stone=crystal-opal'],
      ['/product-tag/cooberpedy', '/store?origin=coober-pedy'],
      ['/product-tag/mintabie', '/store?origin=mintabie'],
      ['/product-tag/opal-ring', '/store?category=opal-rings'],
      ['/product-tag/earrings', '/store?category=opal-earrings'],
      ['/product-tag/opal-earrings', '/store?category=opal-earrings'],
      ['/product-tag/opal-studs', '/store?category=opal-earrings'],
    ] as const

    return [
      ...legacyPages.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})?', destination: '/blog', permanent: true },
      { source: '/product/:slug', destination: '/store/:slug', permanent: true },
      { source: '/product-category/:path*', destination: '/store', permanent: true },
      { source: '/product-tag/:path*', destination: '/store', permanent: true },
      { source: '/:taxonomy(category|tag|author)/:path*', destination: '/blog', permanent: true },
      { source: '/feed', destination: '/feed.xml', permanent: true },
      { source: '/wp-admin', destination: 'https://old.goodopalco.com/wp-admin/', permanent: false },
      { source: '/wp-admin/:path*', destination: 'https://old.goodopalco.com/wp-admin/:path*', permanent: false },
      { source: '/wp-login.php', destination: 'https://old.goodopalco.com/wp-login.php', permanent: false },
      { source: '/wp-content/uploads/:path*', destination: 'https://old.goodopalco.com/wp-content/uploads/:path*', permanent: false },
    ]
  },
}

const payloadConfig = withPayload(nextConfig)
const payloadHeaders = payloadConfig.headers

export default {
  ...payloadConfig,
  async headers() {
    const rules = payloadHeaders ? await payloadHeaders() : []
    return rules.map((rule) =>
      rule.headers.some((header) => header.key === 'Critical-CH')
        ? { ...rule, source: '/admin/:path*' }
        : rule
    )
  },
} satisfies NextConfig

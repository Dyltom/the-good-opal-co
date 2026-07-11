import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { createContentSecurityPolicy } from './src/lib/content-security-policy'

const contentSecurityPolicy = createContentSecurityPolicy()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

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
    const legacyPosts = [
      ['2021/12/17', 'diy-jewellery-hack'],
      ['2021/10/18', 'top-10-opal-jewellery-making-tips'],
      ['2021/06/17', 'what-to-do-in-lightning-ridge'],
      ['2021/06/12', 'queensland-boulder-opal'],
      ['2021/06/11', 'andamooka-opal'],
      ['2021/06/08', 'coober-pedy-opal'],
      ['2021/06/05', 'mintabie-opal'],
      ['2021/06/03', 'top-10-tips-for-buying-opal-jewellery-online'],
      ['2021/06/01', 'learn-how-to-cut-opal-cabbing-101'],
      ['2021/05/29', 'how-opal-is-mined'],
      ['2021/05/27', 'lightning-ridge-opal'],
      ['2021/05/25', 'is-investing-in-opal-worth-it'],
      ['2021/05/22', 'how-to-value-opal'],
      ['2021/05/20', 'learn-about-opal-fact-or-fiction'],
      ['2021/05/17', 'dreamtime-origins-of-opal'],
      ['2021/03/19', 'jewellery-hack-ring-sizing'],
      ['2020/09/21', 'opal-cutting-a-beginners-guide'],
      ['2020/09/13', 'diy-opal-cutting-machine'],
    ] as const
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
    ] as const

    return [
      ...legacyPosts.map(([date, slug]) => ({
        source: `/${date}/${slug}`,
        destination: `/blog/${slug}`,
        permanent: true,
      })),
      ...legacyPages.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: '/product/:slug', destination: '/store/:slug', permanent: true },
      { source: '/product-category/:path*', destination: '/store', permanent: true },
    ]
  },
}

export default withPayload(nextConfig)

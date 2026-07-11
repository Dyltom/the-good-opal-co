/**
 * Dynamic Robots.txt Generator
 *
 * Configures search engine crawling rules.
 * Blocks admin, checkout, and API routes from indexing.
 */

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopalco.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/account',
          '/account/*',
          '/order-tracking',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

/**
 * Dynamic Robots.txt Generator
 *
 * Configures search engine crawling rules.
 * Blocks admin, checkout, and API routes from indexing.
 */

import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/constants'

const BASE_URL = APP_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Payload media is public catalogue content even though it is served
        // through an API route. The longer allow rule wins over `/api/*`.
        allow: ['/', '/api/media/file/'],
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
          '/quote',
          '/quote/*',
          '/newsletter',
          '/newsletter/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}

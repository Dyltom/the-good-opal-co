import type { MetadataRoute } from 'next'
import { storeLandingPages } from '@/app/(marketing)/store/store-query'
import { APP_URL } from '@/lib/constants'

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
]

const PUBLIC_PATHS = ['/', '/api/media/file/', ...storeLandingPages().map(({ url }) => `${url}$`)]

const PRIVATE_PATHS = [
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
  '/visual-tests/*',
  '/store?',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}

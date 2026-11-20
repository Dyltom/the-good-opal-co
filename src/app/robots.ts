import type { MetadataRoute } from 'next'
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

const PUBLIC_PATHS = ['/', '/api/media/file/']

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

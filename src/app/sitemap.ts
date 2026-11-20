import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { getPublishedCatalog } from '@/lib/catalog-query'

interface SitemapDoc {
  slug: string
  updatedAt: string
}

const STATIC_PAGES: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/store', changeFrequency: 'daily', priority: 0.9 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/design', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/courses', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/shipping', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/returns', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()
  const [products, posts, courses] = await Promise.all([
    getPublishedCatalog(),
    payload
      .find({
        collection: 'posts',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true },
        overrideAccess: false,
      })
      .then(({ docs }) => docs as SitemapDoc[]),
    payload
      .find({
        collection: 'courses',
        where: { status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true },
        overrideAccess: false,
      })
      .then(({ docs }) => docs as SitemapDoc[]),
  ])

  return [
    ...STATIC_PAGES.map((page) => ({
      url: `${APP_URL}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...products.map((product) => ({
      url: product.url,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: product.inStock ? 0.8 : 0.4,
      images: product.images,
    })),
    ...posts.map((post) => ({
      url: `${APP_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...courses.map((course) => ({
      url: `${APP_URL}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: new Date(course.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

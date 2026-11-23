import type { MetadataRoute } from 'next'
import type { Media } from '@/types/payload-types'
import { APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { getPublishedCatalog } from '@/lib/catalog-query'
import { absoluteUrl } from '@/lib/catalog'
import { resolveMediaUrl } from '@/lib/media-url'
import { facetOptionLabel, storeLandingPages } from '@/app/(marketing)/store/store-query'

interface SitemapDoc {
  slug: string
  updatedAt: string
}

interface SitemapPost extends SitemapDoc {
  publishedAt?: string | null
  featuredImage?: number | Media | null
}

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const dynamic = 'force-dynamic'

function latest(docs: Array<{ updatedAt: string }>): Date | undefined {
  const times = docs.map((doc) => Date.parse(doc.updatedAt)).filter((time) => !Number.isNaN(time))
  return times.length > 0 ? new Date(Math.max(...times)) : undefined
}

function goneLiveOrUpdated(post: SitemapPost): SitemapPost {
  return post.publishedAt && Date.parse(post.publishedAt) > Date.parse(post.updatedAt)
    ? { ...post, updatedAt: post.publishedAt }
    : post
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()
  const [products, posts, courses] = await Promise.all([
    getPublishedCatalog(),
    payload
      .find({
        collection: 'posts',
        limit: 1000,
        depth: 1,
        select: { slug: true, updatedAt: true, publishedAt: true, featuredImage: true },
        overrideAccess: false,
      })
      .then(({ docs }) => (docs as SitemapPost[]).map(goneLiveOrUpdated)),
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

  const catalogUpdated = latest(products)
  const page = (
    path: string,
    changeFrequency: ChangeFrequency,
    priority: number,
    lastModified?: Date
  ): MetadataRoute.Sitemap[number] => ({
    url: `${APP_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  })

  const forSale = products.filter((product) => product.availability === 'in_stock')
  const landings = storeLandingPages().flatMap(({ facet, value, url }) => {
    const label = facetOptionLabel(facet, value)
    const matches = forSale.filter((product) =>
      facet === 'category' ? product.category === value : (facet === 'stone' ? product.stone : product.origin) === label
    )
    return matches.length > 0 ? [page(url, 'daily', 0.8, latest(matches))] : []
  })

  return [
    page('', 'daily', 1, catalogUpdated),
    page('/store', 'daily', 0.9, catalogUpdated),
    ...landings,
    ...(products.some((product) => product.stock <= 0) ? [page('/store/collected', 'weekly', 0.4)] : []),
    page('/services', 'monthly', 0.8),
    page('/services/design', 'weekly', 0.8),
    page('/courses', 'weekly', 0.8, latest(courses)),
    page('/blog', 'weekly', 0.7, latest(posts)),
    page('/about', 'monthly', 0.5),
    page('/faq', 'monthly', 0.5),
    page('/contact', 'monthly', 0.5),
    page('/shipping', 'monthly', 0.4),
    page('/returns', 'monthly', 0.4),
    page('/legal/privacy', 'yearly', 0.2),
    page('/legal/terms', 'yearly', 0.2),
    page('/legal/cookies', 'yearly', 0.2),
    ...products.map((product) => ({
      url: product.url,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: product.availability === 'sold' ? 0.4 : 0.8,
      images: product.images,
    })),
    ...posts.map((post) => {
      const image =
        post.featuredImage && typeof post.featuredImage === 'object'
          ? absoluteUrl(resolveMediaUrl(post.featuredImage.url))
          : undefined
      return {
        url: `${APP_URL}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        images: image ? [image] : undefined,
      }
    }),
    ...courses.map((course) => ({
      url: `${APP_URL}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: new Date(course.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

import { getPayload } from '@/lib/payload'
import {
  buildLlmsIndex,
  type DiscoveryArticle,
  type DiscoveryCourse,
  type DiscoveryProduct,
} from '@/lib/discovery'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const payload = await getPayload()
  const [productResult, courseResult, articleResult] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      sort: '-updatedAt',
      limit: 1000,
      select: { name: true, slug: true, category: true, price: true, stock: true },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'courses',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 100,
      select: { title: true, slug: true, summary: true },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 100,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true,
      },
      overrideAccess: false,
    }),
  ])

  const body = buildLlmsIndex({
    products: productResult.docs as DiscoveryProduct[],
    courses: courseResult.docs as DiscoveryCourse[],
    articles: articleResult.docs as DiscoveryArticle[],
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}

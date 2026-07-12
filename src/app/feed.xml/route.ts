import { getPayload } from '@/lib/payload'
import { buildRssFeed, type DiscoveryArticle } from '@/lib/discovery'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const payload = await getPayload()
  const { docs } = await payload.find({
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
  })

  return new Response(buildRssFeed(docs as DiscoveryArticle[]), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}

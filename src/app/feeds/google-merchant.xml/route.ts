import { buildGoogleMerchantFeed } from '@/lib/merchant-feed'
import { getPublishedCatalog } from '@/lib/catalog-query'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  return new Response(buildGoogleMerchantFeed(await getPublishedCatalog()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}

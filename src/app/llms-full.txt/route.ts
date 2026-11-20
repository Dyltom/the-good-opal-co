import { buildLlmsFull } from '@/lib/discovery'
import { getDiscoveryInput } from '@/lib/catalog-query'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  return new Response(buildLlmsFull(await getDiscoveryInput()), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}

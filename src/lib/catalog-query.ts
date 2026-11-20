import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { toCatalogProduct, type CatalogProduct } from '@/lib/catalog'
import { CONTACT_INFO } from '@/lib/constants/contact'
import type { DiscoveryArticle, DiscoveryCourse, DiscoveryInput } from '@/lib/discovery'

export async function getPublishedCatalog(): Promise<CatalogProduct[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: LISTED_PRODUCTS,
    sort: '-updatedAt',
    limit: 1000,
    depth: 1,
    overrideAccess: false,
  })
  return docs.map(toCatalogProduct)
}

export async function getDiscoveryInput(): Promise<DiscoveryInput> {
  const payload = await getPayload()
  const [products, courses, articles] = await Promise.all([
    getPublishedCatalog(),
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
      select: { title: true, slug: true, excerpt: true, publishedAt: true, updatedAt: true },
      overrideAccess: false,
    }),
  ])

  return {
    products,
    courses: courses.docs as DiscoveryCourse[],
    articles: articles.docs as DiscoveryArticle[],
    contactEmail: CONTACT_INFO.email,
  }
}

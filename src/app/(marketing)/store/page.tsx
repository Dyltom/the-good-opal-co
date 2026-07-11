import { redirect } from 'next/navigation'
import type { Where } from 'payload'
import { MarketingShell } from '@/components/marketing'
import { CollectionJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { StoreContent, type StoreProduct } from './store-content'
import {
  parseStoreQuery,
  PRODUCTS_PER_PAGE,
  storeUrl,
  type StoreSearchParams,
} from './store-query'

export const metadata = {
  title: 'Shop Australian Opals | The Good Opal Co',
  description:
    'Browse one-of-a-kind Australian opals, finished jewellery, loose stones, and pieces for gifting. Every listing includes its known origin and details.',
}
interface StorePageProps {
  searchParams: Promise<StoreSearchParams>
}

/**
 * Compatibility shape for legacy catalog helpers. New listing code uses the
 * smaller StoreProduct view model, but these fields remain part of the public
 * store module contract until those helpers are retired.
 */
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images?: Array<{ image?: { url?: string } }>
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  stock: number
  material?: string
  stoneType?: string
  stoneOrigin?: string
  weight?: number
  createdAt: string
  updatedAt: string
}

const sortMap = {
  featured: '-featured,-createdAt',
  newest: '-createdAt',
  'price-low': 'price',
  'price-high': '-price',
} as const

function objectRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : undefined
}

function richTextToPlainText(value: unknown): string {
  if (Array.isArray(value)) return value.map(richTextToPlainText).filter(Boolean).join(' ')

  const record = objectRecord(value)
  if (!record) return ''
  if (typeof record.text === 'string') return record.text

  return Object.values(record).map(richTextToPlainText).filter(Boolean).join(' ')
}

function firstImageUrl(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined
  const first = objectRecord(value[0])
  const image = objectRecord(first?.image)
  return typeof image?.url === 'string' ? resolveMediaUrl(image.url) : undefined
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function toStoreProduct(value: unknown): StoreProduct | undefined {
  const product = objectRecord(value)
  if (
    !product ||
    (typeof product.id !== 'string' && typeof product.id !== 'number') ||
    typeof product.slug !== 'string' ||
    typeof product.name !== 'string' ||
    typeof product.price !== 'number'
  ) {
    return undefined
  }

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: richTextToPlainText(product.description),
    price: product.price,
    compareAtPrice: typeof product.compareAtPrice === 'number' ? product.compareAtPrice : undefined,
    stock: typeof product.stock === 'number' ? product.stock : 0,
    featured: product.featured === true,
    category: optionalString(product.category),
    image: firstImageUrl(product.images),
    stoneOrigin: optionalString(product.stoneOrigin),
    stoneType: optionalString(product.stoneType),
    createdAt: optionalString(product.createdAt),
  }
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const query = parseStoreQuery(await searchParams)
  const conditions: Where[] = [{ status: { equals: 'published' } }]

  if (query.availability === 'available') conditions.push({ stock: { greater_than: 0 } })
  if (query.category) conditions.push({ category: { equals: query.category } })
  if (query.stone) conditions.push({ stoneType: { equals: query.stone } })
  if (query.origin) conditions.push({ stoneOrigin: { equals: query.origin } })
  if (query.material) conditions.push({ material: { equals: query.material } })
  if (query.price === 'under-250') conditions.push({ price: { less_than: 250 } })
  if (query.price === '250-500') {
    conditions.push({ price: { greater_than_equal: 250 } }, { price: { less_than: 500 } })
  }
  if (query.price === '500-1000') {
    conditions.push({ price: { greater_than_equal: 500 } }, { price: { less_than: 1000 } })
  }
  if (query.price === '1000-plus') conditions.push({ price: { greater_than_equal: 1000 } })
  if (query.search) {
    conditions.push({
      or: [
        { name: { contains: query.search } },
        { material: { contains: query.search } },
        { stoneType: { contains: query.search } },
        { stoneOrigin: { contains: query.search } },
        { sku: { contains: query.search } },
      ],
    })
  }

  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    where: { and: conditions },
    limit: PRODUCTS_PER_PAGE,
    page: query.page,
    sort: sortMap[query.sort],
    depth: 1,
  })

  if (result.totalPages > 0 && query.page > result.totalPages) {
    redirect(storeUrl(query, result.totalPages))
  }

  const products = result.docs
    .map(toStoreProduct)
    .filter((product): product is StoreProduct => product !== undefined)

  return (
    <MarketingShell>
      <CollectionJsonLd
        name="Australian opals"
        description="One-of-a-kind Australian opals, loose stones, and finished jewellery."
        url="/store"
        products={products.slice(0, 10).map((product) => ({
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
        }))}
      />

      <StoreContent
        products={products}
        query={query}
        totalDocs={result.totalDocs}
        totalPages={result.totalPages}
      />
    </MarketingShell>
  )
}

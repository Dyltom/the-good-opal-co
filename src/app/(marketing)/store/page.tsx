import { redirect } from 'next/navigation'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing'
import { CollectionJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { productGalleryUrls } from '@/lib/product-gallery'
import { reservedProductIds } from '@/lib/inventory-reservations'
import { StoreContent, type StoreProduct } from './store-content'
import { StoreInsights } from './store-insights'
import {
  caratWeight,
  countPriceBands,
  countStoreFacets,
  findStoreListings,
  parseStoreQuery,
  PRODUCTS_PER_PAGE,
  storeMetadata,
  storeUrl,
  type StoreListing,
  type StoreSearchParams,
} from './store-query'

export const dynamic = 'force-dynamic'

interface StorePageProps {
  searchParams: Promise<StoreSearchParams>
}

export async function generateMetadata({ searchParams }: StorePageProps): Promise<Metadata> {
  return storeMetadata(parseStoreQuery(await searchParams))
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

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function caratsOf(product: Record<string, unknown>): number | undefined {
  return caratWeight({
    weight: typeof product.weight === 'number' ? product.weight : undefined,
    weightUnit: optionalString(product.weightUnit),
  })
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
  const [image, hoverImage] = productGalleryUrls(product.slug, product.name, product.images)

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
    image,
    hoverImage,
    stoneOrigin: optionalString(product.stoneOrigin),
    stoneType: optionalString(product.stoneType),
    carats: caratsOf(product),
  }
}

function toStoreListing(value: unknown): StoreListing | undefined {
  const product = objectRecord(value)
  if (
    !product ||
    (typeof product.id !== 'string' && typeof product.id !== 'number') ||
    typeof product.name !== 'string' ||
    typeof product.price !== 'number'
  ) {
    return undefined
  }

  return {
    id: String(product.id),
    name: product.name,
    sku: optionalString(product.sku),
    category: optionalString(product.category),
    stoneType: optionalString(product.stoneType),
    stoneOrigin: optionalString(product.stoneOrigin),
    price: product.price,
    stock: typeof product.stock === 'number' ? product.stock : 0,
    featured: product.featured === true,
    createdAt: optionalString(product.createdAt) ?? '',
    carats: caratsOf(product),
  }
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const query = parseStoreQuery(await searchParams)
  const payload = await getPayload()
  const [catalogue, reservedIds] = await Promise.all([payload.find({
    collection: 'products',
    where: LISTED_PRODUCTS,
    pagination: false,
    depth: 0,
    select: {
      name: true,
      sku: true,
      category: true,
      stoneType: true,
      stoneOrigin: true,
      price: true,
      stock: true,
      featured: true,
      createdAt: true,
      weight: true,
      weightUnit: true,
    },
  }), reservedProductIds()])
  const listings = catalogue.docs
    .map(toStoreListing)
    .filter((listing): listing is StoreListing => listing !== undefined)
    .map((listing) => ({ ...listing, reserved: listing.stock <= 0 && reservedIds.has(listing.id) }))
  const matching = findStoreListings(listings, query)
  const lastPage = Math.max(1, Math.ceil(matching.length / PRODUCTS_PER_PAGE))

  if (query.page > lastPage) {
    redirect(storeUrl(query, lastPage))
  }

  const shownIds = matching.slice(0, query.page * PRODUCTS_PER_PAGE).map((listing) => listing.id)
  const shown = shownIds.length > 0
    ? await payload.find({
      collection: 'products',
      where: { id: { in: shownIds } },
      pagination: false,
      depth: 1,
      select: {
        name: true,
        slug: true,
        description: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        featured: true,
        category: true,
        images: true,
        stoneOrigin: true,
        stoneType: true,
        weight: true,
        weightUnit: true,
      },
    })
    : { docs: [] }
  const byId = new Map(
    shown.docs
      .map(toStoreProduct)
      .filter((product): product is StoreProduct => product !== undefined)
      .map((product) => [product.id, product])
  )
  const products = shownIds.flatMap((id) => {
    const product = byId.get(id)
    return product ? [{ ...product, reserved: product.stock <= 0 && reservedIds.has(id) }] : []
  })

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
        totalDocs={matching.length}
        facetCounts={countStoreFacets(listings, query)}
        priceCounts={countPriceBands(listings, query)}
        soldCount={listings.filter((listing) => listing.stock <= 0 && !listing.reserved).length}
      />
      <StoreInsights query={query} results={matching.length} />
    </MarketingShell>
  )
}

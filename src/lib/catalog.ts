import type { Product } from '@/types/payload-types'
import { APP_URL } from '@/lib/constants'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import { mergeProductGallery } from '@/lib/product-gallery'
import { parseProductDescription } from '@/lib/product-description'
import { activeSale, saleApplies, saleLastDay, salePrice } from '@/lib/promotions'
import {
  STORE_CATEGORIES,
  STORE_MATERIALS,
  STORE_ORIGINS,
  STORE_STONES,
} from '@/app/(marketing)/store/store-query'

export type Availability = 'in_stock' | 'reserved' | 'sold'

export interface Weight {
  value: number
  unit: 'ct' | 'g'
}

export interface CatalogProduct {
  id: string
  name: string
  slug: string
  url: string
  description: string
  summary: string
  price: number
  regularPrice: number
  saleEndsAt?: string
  stock: number
  availability: Availability
  images: string[]
  sku: string
  category: string
  categoryLabel: string
  stone?: string
  origin?: string
  weight?: Weight
  metal?: string
  ringSize?: string
  updatedAt: string
}

export function absoluteUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  try {
    return new URL(value, `${APP_URL}/`).toString()
  } catch {
    return undefined
  }
}

export function summarize(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const cut = clean.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, '')}…`
}

function label(options: readonly (readonly [string, string])[], value: string | null | undefined) {
  return value ? options.find(([option]) => option === value)?.[1] : undefined
}

function productWeight(product: Product): Weight | undefined {
  const unit = product.weightUnit ?? (product.category === 'raw-opals' ? 'carats' : undefined)
  if (!product.weight || !unit) return undefined
  return { value: product.weight, unit: unit === 'carats' ? 'ct' : 'g' }
}

export function weightLabel(weight: Weight): string {
  return `${weight.value} ${weight.unit}`
}

export function productImageUrls(product: Product): string[] {
  const cmsImages = (product.images ?? []).flatMap((entry) => {
    const image = typeof entry.image === 'object' && entry.image ? entry.image : null
    const url = resolveMediaUrl(image?.url)
    return url ? [{ url, alt: image?.alt || product.name }] : []
  })
  const owned = ownedProductImageUrl(product.slug)
  const gallery = mergeProductGallery(
    product.slug,
    product.name,
    cmsImages.length === 0 && owned ? [{ url: owned, alt: product.name }] : cmsImages
  )
  return gallery.flatMap((image) => absoluteUrl(image.url) ?? [])
}

export function toCatalogProduct(
  product: Product,
  reservedIds: ReadonlySet<string> = new Set(),
  now = new Date()
): CatalogProduct {
  const about = parseProductDescription(product.description)
  const description = about.paragraphs.join(' ')
  const stock = product.stock ?? 0
  const id = String(product.id)
  const sale = saleApplies(product.category) ? activeSale(now) : undefined

  return {
    id,
    name: product.name,
    slug: product.slug,
    url: `${APP_URL}/store/${encodeURIComponent(product.slug)}`,
    description,
    summary: summarize(description),
    price: sale ? salePrice(product.price, sale) : product.price,
    regularPrice: product.price,
    saleEndsAt: sale && saleLastDay(sale),
    stock,
    availability: stock > 0 ? 'in_stock' : reservedIds.has(id) ? 'reserved' : 'sold',
    images: productImageUrls(product),
    sku: product.sku ?? String(product.id),
    category: product.category,
    categoryLabel: label(STORE_CATEGORIES, product.category) ?? product.category,
    stone: label(STORE_STONES, product.stoneType),
    origin: label(STORE_ORIGINS, product.stoneOrigin),
    weight: productWeight(product),
    metal: product.material && product.material !== 'none' ? label(STORE_MATERIALS, product.material) : undefined,
    ringSize: product.ringSize ?? undefined,
    updatedAt: product.updatedAt,
  }
}

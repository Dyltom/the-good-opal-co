import { PRODUCTS } from '@/data/products'

const ownedImageBySlug = new Map(
  PRODUCTS.flatMap((product) => (product.image ? [[product.slug, product.image] as const] : []))
)

/** Durable fallback for the legacy catalogue photography checked into this repository. */
export function ownedProductImageUrl(slug: string): string | undefined {
  return ownedImageBySlug.get(slug)
}

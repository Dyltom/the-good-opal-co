import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { Where } from 'payload'
import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import type { Product } from '@/types/payload-types'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/media-url'
import { caratWeight } from '@/app/(marketing)/store/store-query'

async function findRelatedProducts(product: Product, limit: number): Promise<Product[]> {
  const tags = (product.tags ?? []).flatMap((entry) => (entry.tag ? [entry.tag] : []))
  const scopes: Where[] = [
    { category: { equals: product.category } },
    ...(tags.length > 0 ? [{ 'tags.tag': { in: tags } }] : []),
    { price: { greater_than_equal: product.price * 0.7, less_than_equal: product.price * 1.3 } },
  ]
  const found = new Map<string, Product>()
  try {
    const payload = await getPayload()
    for (const scope of scopes) {
      if (found.size >= limit) break
      const { docs } = await payload.find({
        collection: 'products',
        where: {
          and: [
            scope,
            { id: { not_equals: product.id } },
            LISTED_PRODUCTS,
            { stock: { greater_than: 0 } },
          ],
        },
        limit,
        sort: ['-featured', '-createdAt'],
        depth: 2,
      })
      for (const doc of docs) if (found.size < limit && !found.has(String(doc.id))) found.set(String(doc.id), doc)
    }
  } catch (error) {
    console.error('Failed to fetch related products:', error)
  }
  return [...found.values()]
}

interface RelatedProductsProps {
  product: Product
  className?: string
  title?: string
  limit?: number
}

export async function RelatedProducts({
  product,
  className,
  title = 'You may also like',
  limit = 4
}: RelatedProductsProps) {
  const relatedProducts = await findRelatedProducts(product, limit)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-medium text-charcoal">
          {title}
        </h2>
        <Link
          href="/store"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 font-sans text-sm font-semibold text-charcoal underline decoration-warm-grey underline-offset-8 hover:decoration-charcoal"
        >
          View all pieces
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {relatedProducts.map((relatedProduct, index) => {
          const firstImage = relatedProduct.images?.[0]?.image
          const imageUrl =
            typeof firstImage === 'string'
              ? firstImage
              : typeof firstImage === 'object' && firstImage !== null
                ? resolveMediaUrl(firstImage.url)
                : undefined
          return (
            <ProductCard
              key={relatedProduct.id}
              product={{
                id: String(relatedProduct.id),
                slug: relatedProduct.slug,
                name: relatedProduct.name,
                price: relatedProduct.price,
                compareAtPrice: relatedProduct.compareAtPrice ?? undefined,
                stock: relatedProduct.stock ?? 0,
                featured: relatedProduct.featured ?? undefined,
                image: imageUrl,
                category: relatedProduct.category,
                stoneOrigin: relatedProduct.stoneOrigin ?? undefined,
                stoneType: relatedProduct.stoneType ?? undefined,
                carats: caratWeight(relatedProduct),
              }}
              index={index}
            />
          )
        })}
      </div>
    </section>
  )
}

export function RelatedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-cream-dark" />
        <div className="h-5 w-32 animate-pulse rounded bg-cream-dark" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-md bg-cream-dark"
          />
        ))}
      </div>
    </section>
  )
}

export function RelatedProductsWithSuspense(props: RelatedProductsProps) {
  return (
    <Suspense fallback={<RelatedProductsSkeleton />}>
      <RelatedProducts {...props} />
    </Suspense>
  )
}

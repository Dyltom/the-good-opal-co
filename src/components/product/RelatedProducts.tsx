import { Suspense, type ComponentProps } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { Where } from 'payload'
import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { withSalePrice } from '@/lib/promotions'
import type { Product } from '@/types/payload-types'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/media-url'
import { caratWeight } from '@/app/(marketing)/store/store-query'

export function toProductCardProduct(product: Product): ComponentProps<typeof ProductCard>['product'] {
  const firstImage = product.images?.[0]?.image
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    stock: product.stock ?? 0,
    soldPerUnit: product.soldPerUnit ?? false,
    featured: product.featured ?? undefined,
    image:
      typeof firstImage === 'string'
        ? firstImage
        : typeof firstImage === 'object' && firstImage !== null
          ? resolveMediaUrl(firstImage.url)
          : undefined,
    category: product.category,
    stoneOrigin: product.stoneOrigin ?? undefined,
    stoneType: product.stoneType ?? undefined,
    carats: caratWeight(product),
  }
}

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
      for (const doc of docs) if (found.size < limit && !found.has(String(doc.id))) found.set(String(doc.id), withSalePrice(doc))
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
  title,
  limit = 4
}: RelatedProductsProps) {
  const relatedProducts = await findRelatedProducts(product, limit)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="mb-[22px] flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-[clamp(26px,3vw,38px)] leading-[1.05] tracking-[-0.015em] text-ink">
          {title ?? (
            <>
              More from the <i>collection</i>
            </>
          )}
        </h2>
        <Link
          href="/store"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink md:min-h-0"
        >
          All pieces
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 md:grid-cols-3 md:gap-x-4 lg:grid-cols-5 [&>article:nth-of-type(5)]:hidden md:[&>article:nth-of-type(n+4)]:hidden lg:[&>article:nth-of-type(n+4)]:flex">
        {relatedProducts.map((relatedProduct, index) => (
          <ProductCard key={relatedProduct.id} product={toProductCardProduct(relatedProduct)} index={index} />
        ))}
      </div>
    </section>
  )
}

export function RelatedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="mb-[22px] flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-sm bg-plinth" />
        <div className="h-5 w-20 animate-pulse rounded-sm bg-plinth" />
      </div>

      <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 md:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-sm bg-plinth"
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

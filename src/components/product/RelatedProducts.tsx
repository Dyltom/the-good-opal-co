import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { getRelatedProductService } from '@/lib/products/related-products'
import type { Product } from '@/types/payload-types'
import { cn } from '@/lib/utils'

interface RelatedProductsProps {
  product: Product
  className?: string
  title?: string
  limit?: number
}

/**
 * Server component that fetches and displays related products
 * Single Responsibility: Only responsible for displaying related products
 */
export async function RelatedProducts({
  product,
  className,
  title = 'You May Also Like',
  limit = 4
}: RelatedProductsProps) {
  const service = getRelatedProductService()
  const relatedProducts = await service.getRelatedProducts(product, limit)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-bold text-charcoal">
          {title}
        </h2>
        <Link
          href="/store"
          className="text-sm text-opal-electric-accessible hover:underline inline-flex items-center gap-1"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct, index) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            index={index}
            variant="default"
            animated
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Loading skeleton for related products
 */
export function RelatedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-lg animate-pulse"
            style={{ aspectRatio: '3/4' }}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Client component wrapper with loading state
 * Open/Closed Principle: Can extend with different loading behaviors
 */
export function RelatedProductsWithSuspense(props: RelatedProductsProps) {
  return (
    <Suspense fallback={<RelatedProductsSkeleton />}>
      <RelatedProducts {...props} />
    </Suspense>
  )
}
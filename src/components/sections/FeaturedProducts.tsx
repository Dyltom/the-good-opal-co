'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
  image?: string
  stoneType?: string
  origin?: string
}

interface FeaturedProductsProps {
  title?: string
  description?: string
  limit?: number
  featured?: boolean
  className?: string
  /** Use 'dark' when on dark backgrounds, 'light' for light backgrounds */
  variant?: 'light' | 'dark'
  /** Hide the title section */
  hideTitle?: boolean
}

/**
 * Featured Products Section
 * Displays real products from the database
 */
export function FeaturedProducts({
  title = 'Featured Collection',
  description = 'Hand-selected pieces showcasing exceptional Australian opals',
  limit = 8,
  featured = true,
  className = '',
  variant = 'light',
  hideTitle = false,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/store-products', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Product feed failed with ${response.status}`)
        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error('Product feed returned an invalid response')
        return data as Product[]
      })
      .then((data) => {
        const filtered = featured ? data.filter((p: Product) => p.featured) : data
        setProducts(filtered.slice(0, limit))
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return

        console.error('Failed to fetch products:', error)
        setLoading(false)
      })

    return () => controller.abort()
  }, [limit, featured])

  const isDark = variant === 'dark'

  return (
    <div className={className}>
      {!hideTitle && (
        <div className="mb-12 text-center">
          <h2
            className={`mb-4 font-serif text-3xl font-bold md:text-5xl ${isDark ? 'text-white' : 'text-charcoal'}`}
          >
            {title}
          </h2>
          <p
            className={`mx-auto max-w-2xl text-lg md:text-xl ${isDark ? 'text-white/60' : 'text-charcoal/60'}`}
          >
            {description}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i}>
              <div
                className={`mb-3 aspect-[4/5] animate-pulse rounded-2xl ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`}
              />
              <div
                className={`mb-2 h-4 animate-pulse rounded ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`}
              />
              <div
                className={`h-4 w-20 animate-pulse rounded ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`}
              />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              variant="default"
              darkBackground={isDark}
            />
          ))}
        </div>
      ) : (
        <div
          className={`rounded-2xl py-16 text-center ${isDark ? 'bg-white/5 backdrop-blur-sm' : 'bg-charcoal/5'}`}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-opal-electric to-fire-pink">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3
            className={`mb-2 font-serif text-xl font-semibold ${isDark ? 'text-white' : 'text-charcoal'}`}
          >
            Explore Our Collection
          </h3>
          <p className={`mx-auto mb-6 max-w-md ${isDark ? 'text-white/60' : 'text-charcoal/60'}`}>
            Discover unique Australian opals and handcrafted jewelry pieces in our store.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-opal-electric to-opal-deep px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            Visit Store
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}

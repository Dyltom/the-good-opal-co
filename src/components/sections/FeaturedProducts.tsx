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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const filtered = featured ? data.filter((p: Product) => p.featured) : data
        setProducts(filtered.slice(0, limit))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch products:', err)
        setLoading(false)
      })
  }, [limit, featured])

  const isDark = variant === 'dark'

  return (
    <div className={className}>
      {!hideTitle && (
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-charcoal'}`}>
            {title}
          </h2>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? 'text-white/60' : 'text-charcoal/60'}`}>
            {description}
          </p>
        </div>
      )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i}>
                <div className={`aspect-[4/5] animate-pulse mb-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
                <div className={`h-4 animate-pulse mb-2 rounded ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
                <div className={`h-4 animate-pulse w-20 rounded ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 backdrop-blur-sm' : 'bg-charcoal/5'}`}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>Explore Our Collection</h3>
            <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-white/60' : 'text-charcoal/60'}`}>
              Discover unique Australian opals and handcrafted jewelry pieces in our store.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-opal-electric to-opal-deep text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Visit Store
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
    </div>
  )
}

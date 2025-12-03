'use client'

import Link from 'next/link'
import { Container } from '@/components/layout'
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

  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(limit)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-warm-grey-light animate-pulse mb-3" />
                <div className="h-4 bg-warm-grey-light animate-pulse mb-2" />
                <div className="h-4 bg-warm-grey-light animate-pulse w-20" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">Explore Our Collection</h3>
            <p className="text-charcoal/60 max-w-md mx-auto mb-6">
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
      </Container>
    </section>
  )
}

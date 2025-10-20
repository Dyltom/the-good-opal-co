'use client'

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
        let filtered = featured ? data.filter((p: Product) => p.featured) : data
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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💎</div>
            <p className="text-lg text-muted-foreground">
              New collection coming soon...
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}

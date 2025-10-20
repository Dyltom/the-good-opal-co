'use client'

import { Container } from '@/components/layout'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroSection, TrustBadges, CTASection } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { CATEGORY_FILTERS, getCategoryName } from '@/data/categories'
import { sortProducts, type Product } from '@/data/products'
import { useState, useEffect } from 'react'

export default function StorePage() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch products from Payload API
  useEffect(() => {
    setLoading(true)
    fetch(`/api/products?category=${category}&includeOutOfStock=${showOutOfStock}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch products:', err)
        setLoading(false)
      })
  }, [category, showOutOfStock])

  const sortedProducts = sortProducts(products, sort)
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        badge={`${sortedProducts.length} ${sortedProducts.length === 1 ? 'Product' : 'Products'} Available`}
        title={getCategoryName(category === 'all' ? undefined : category)}
        description="Hand-selected authentic Australian opals, each piece certified for quality and authenticity"
        buttons={[]}
        gradient={true}
        className="py-16 md:py-20"
      />

      {/* Products Section */}
      <section className="py-12">
        <Container>
          {/* Category Filter Pills */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-6 py-2.5 rounded-full border-2 transition-all duration-300 font-medium ${
                  category === cat.value
                    ? 'bg-opal-blue text-white border-opal-blue shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-opal-blue hover:text-opal-blue hover:shadow-md'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Bar & Filters */}
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y py-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-charcoal-80 font-medium">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'piece' : 'pieces'}
                {!showOutOfStock && outOfStockCount > 0 && (
                  <span className="text-charcoal-40 ml-2">
                    ({outOfStockCount} sold out)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Out of Stock Toggle */}
              <label className="flex items-center gap-2 text-sm text-charcoal-80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                  className="rounded border-warm-grey text-opal-blue focus:ring-opal-blue"
                />
                <span>Show sold items</span>
              </label>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-charcoal-80">
                  Sort:
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-warm-grey bg-white text-sm font-medium hover:border-opal-blue focus:border-opal-blue focus:outline-none focus:ring-2 focus:ring-opal-blue/20 transition-all"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-warm-grey-light animate-pulse rounded-lg" />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💎</div>
              <p className="text-lg text-muted-foreground mb-4">No products found in this category</p>
              <button
                onClick={() => setCategory('all')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 bg-opal-blue text-white hover:bg-opal-blue-dark"
              >
                View All Products
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* Trust Section */}
      <TrustBadges />

      {/* CTA Section */}
      <CTASection
        title="Looking for Something Unique?"
        description="We offer custom commission services for bespoke opal jewelry"
        buttons={[{ href: '/contact', label: 'Get In Touch' }]}
      />

      <Footer />
    </div>
  )
}

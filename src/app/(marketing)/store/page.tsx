'use client'

import { Container } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroSection, TrustBadges, CTASection } from '@/components/sections'
import { CATEGORY_FILTERS, getCategoryName } from '@/data/categories'
import { DEMO_PRODUCTS, getProductsByCategory, sortProducts } from '@/data/products'
import Link from 'next/link'
import { useState } from 'react'

export default function StorePage() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')

  // Get filtered and sorted products
  const filteredProducts = getProductsByCategory(category)
  const sortedProducts = sortProducts(filteredProducts, sort)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection
        badge={`${sortedProducts.length} ${sortedProducts.length === 1 ? 'Product' : 'Products'}`}
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

          {/* Sort Bar */}
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y py-4">
            <p className="text-sm text-muted-foreground font-medium">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 bg-white text-sm font-medium hover:border-opal-blue focus:border-opal-blue focus:outline-none focus:ring-2 focus:ring-opal-blue/20 transition-all"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
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
    </div>
  )
}

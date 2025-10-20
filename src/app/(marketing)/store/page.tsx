'use client'

import { Container } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'
import { useState } from 'react'

// Demo products with placeholder images
const demoProducts = [
  {
    id: '1',
    slug: 'black-opal-ring-sterling-silver',
    name: 'Lightning Ridge Black Opal Ring',
    description: 'Stunning black opal from Lightning Ridge set in sterling silver with intricate band detailing',
    price: 1899.00,
    compareAtPrice: 2299.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
  {
    id: '2',
    slug: 'boulder-opal-pendant-gold',
    name: 'Queensland Boulder Opal Pendant',
    description: 'Natural boulder opal showcasing vibrant greens and blues in 14K gold setting',
    price: 2499.00,
    stock: 1,
    featured: true,
    category: 'opal-necklaces',
  },
  {
    id: '3',
    slug: 'crystal-opal-stud-earrings',
    name: 'Crystal Opal Stud Earrings',
    description: 'Delicate crystal opal studs with rainbow fire, set in rose gold',
    price: 1299.00,
    stock: 2,
    featured: false,
    category: 'opal-earrings',
  },
  {
    id: '4',
    slug: 'white-opal-bracelet',
    name: 'Coober Pedy White Opal Bracelet',
    description: 'Elegant bracelet featuring five matched white opals in sterling silver links',
    price: 1799.00,
    compareAtPrice: 2199.00,
    stock: 1,
    featured: false,
    category: 'opal-bracelets',
  },
  {
    id: '5',
    slug: 'fire-opal-statement-ring',
    name: 'Mexican Fire Opal Statement Ring',
    description: 'Vibrant orange fire opal in bold 18K gold setting',
    price: 3299.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
  {
    id: '6',
    slug: 'raw-black-opal-collectors',
    name: 'Raw Black Opal - Collector Grade',
    description: 'Unset Lightning Ridge black opal, 8.5ct with exceptional color play',
    price: 4500.00,
    stock: 1,
    featured: false,
    category: 'raw-opals',
  },
  {
    id: '7',
    slug: 'matrix-opal-pendant',
    name: 'Andamooka Matrix Opal Pendant',
    description: 'Unique matrix opal with natural patterns in sterling silver',
    price: 899.00,
    stock: 3,
    featured: false,
    category: 'opal-necklaces',
  },
  {
    id: '8',
    slug: 'crystal-opal-ring-platinum',
    name: 'Crystal Opal Ring - Platinum',
    description: 'Premium crystal opal set in platinum with diamond accents',
    price: 5999.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
]

const categories = [
  { label: 'All Jewelry', value: 'all' },
  { label: 'Opal Rings', value: 'opal-rings' },
  { label: 'Necklaces & Pendants', value: 'opal-necklaces' },
  { label: 'Earrings', value: 'opal-earrings' },
  { label: 'Bracelets', value: 'opal-bracelets' },
  { label: 'Raw Opals', value: 'raw-opals' },
]

export default function StorePage() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')

  // Filter products
  let filteredProducts = category === 'all'
    ? demoProducts
    : demoProducts.filter(p => p.category === category)

  // Sort products
  if (sort === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price)
  } else if (sort === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price)
  } else if (sort === 'featured') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })
  }

  const categoryName = categories.find(c => c.value === category)?.label || 'All Jewelry'

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 border-b py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-opal-blue/10 text-opal-blue border-opal-blue/20">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              {categoryName}
            </h1>
            <p className="text-lg text-muted-foreground">
              Hand-selected authentic Australian opals, each piece certified for quality and authenticity
            </p>
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <Container>
          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-6 py-2.5 rounded-full border-2 transition-all font-medium ${
                  category === cat.value
                    ? 'bg-opal-blue text-white border-opal-blue shadow-lg'
                    : 'bg-white border-gray-200 hover:border-opal-blue hover:text-opal-blue hover:shadow-md'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Bar */}
          <div className="mb-12 flex items-center justify-between border-y py-4">
            <p className="text-sm text-muted-foreground font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Sort by:</label>
              <select
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
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💎</div>
              <p className="text-lg text-muted-foreground mb-4">No products found in this category</p>
              <Button onClick={() => setCategory('all')}>
                View All Products
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-50">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl mb-2">💎</div>
              <div className="font-semibold text-lg">100% Authentic</div>
              <div className="text-sm text-muted-foreground">Certified Australian opals</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">📦</div>
              <div className="font-semibold text-lg">Free Shipping</div>
              <div className="text-sm text-muted-foreground">On orders over $500</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">🔄</div>
              <div className="font-semibold text-lg">Easy Returns</div>
              <div className="text-sm text-muted-foreground">30-day return policy</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">🎁</div>
              <div className="font-semibold text-lg">Gift Packaging</div>
              <div className="text-sm text-muted-foreground">Complimentary on all orders</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-opal-blue to-opal-teal text-white">
        <Container className="text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Looking for Something Unique?</h2>
          <p className="text-lg mb-6 opacity-90">
            We offer custom commission services for bespoke opal jewelry
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-opal-blue hover:bg-gray-100 font-semibold">
            <Link href="/contact">Get In Touch</Link>
          </Button>
        </Container>
      </section>
    </div>
  )
}

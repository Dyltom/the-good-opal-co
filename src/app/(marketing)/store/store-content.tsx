'use client'

/**
 * Store Content Client Component
 *
 * Handles client-side filtering, sorting, and search functionality.
 * Receives products from server component via props.
 */

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/store/ProductFilters'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Product } from './page'

interface StoreContentProps {
  products: Product[]
  searchQuery?: string
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest'

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products]
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'featured':
    default:
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }
}

export function StoreContent({ products, searchQuery: initialSearchQuery }: StoreContentProps) {
  // Sorting and display state
  const [sort, setSort] = useState<SortOption>('featured')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStoneTypes, setSelectedStoneTypes] = useState<string[]>([])
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  // Extract unique filter options from products
  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    const stoneTypes = Array.from(new Set(products.map(p => p.stoneType).filter((t): t is string => !!t)))
    const origins = Array.from(new Set(products.map(p => p.stoneOrigin).filter((o): o is string => !!o)))
    const materials = Array.from(new Set(products.map(p => p.material).filter((m): m is string => !!m)))
    const maxPrice = Math.max(...products.map(p => p.price), 1000)

    return {
      categories: ['all', ...categories],
      stoneTypes,
      origins,
      materials,
      priceRange: [0, maxPrice] as [number, number],
      maxPrice,
    }
  }, [products])

  // Apply filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Stock filter
      if (!showOutOfStock && product.stock === 0) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${product.name} ${product.description} ${product.category} ${product.stoneType ?? ''} ${product.stoneOrigin ?? ''}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
        if (!selectedCategories.includes(product.category)) return false
      }

      // Stone type filter
      if (selectedStoneTypes.length > 0) {
        if (!product.stoneType || !selectedStoneTypes.includes(product.stoneType)) return false
      }

      // Origin filter
      if (selectedOrigins.length > 0) {
        if (!product.stoneOrigin || !selectedOrigins.includes(product.stoneOrigin)) return false
      }

      // Material filter
      if (selectedMaterials.length > 0) {
        if (!product.material || !selectedMaterials.includes(product.material)) return false
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false

      return true
    })
  }, [products, searchQuery, selectedCategories, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange, showOutOfStock])

  const sortedProducts = sortProducts(filteredProducts, sort)
  const outOfStockCount = products.filter(p => p.stock === 0).length

  // Filter handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev.filter(c => c !== 'all'), category]
    )
  }

  const handleStoneTypeChange = (type: string) => {
    setSelectedStoneTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleOriginChange = (origin: string) => {
    setSelectedOrigins(prev =>
      prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin]
    )
  }

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    )
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedStoneTypes([])
    setSelectedOrigins([])
    setSelectedMaterials([])
    setPriceRange([0, filterOptions.maxPrice])
  }

  return (
    <div className="py-4 px-4 max-w-[90rem] mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enchanted Filters Sidebar */}
        <aside className="lg:w-80 flex-shrink-0">
          <div
            className="lg:sticky lg:top-24 bg-gradient-to-br from-white/95 via-white/90 to-opal-electric/5 backdrop-blur-sm rounded-3xl border border-warm-grey/20 shadow-2xl p-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E8E6E3 transparent',
              scrollbarGutter: 'stable'
            }}
          >
          {/* Magical Header */}
          <div className="text-center mb-6 pb-4 border-b border-warm-grey/20">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-2">
              <span className="font-accent text-opal-electric">✨</span> Filter Treasures <span className="font-accent text-opal-electric">✨</span>
            </h2>
            <p className="font-accent text-sm text-opal-electric/70">~ Discover your perfect gem ~</p>
          </div>

          <ProductFilters
            filters={filterOptions}
            selectedCategories={selectedCategories}
            selectedStoneTypes={selectedStoneTypes}
            selectedOrigins={selectedOrigins}
            selectedMaterials={selectedMaterials}
            priceRange={priceRange}
            onCategoryChange={handleCategoryChange}
            onStoneTypeChange={handleStoneTypeChange}
            onOriginChange={handleOriginChange}
            onMaterialChange={handleMaterialChange}
            onPriceRangeChange={setPriceRange}
            onClearAll={handleClearFilters}
          />
          </div>
        </aside>

      {/* Products Area */}
      <div className="flex-1">
        {/* Magical Search Bar */}
        <div className="mb-6">
          <label htmlFor="store-search" className="sr-only">Search products</label>
          <div className="relative">
            <input
              id="store-search"
              type="text"
              placeholder="Search for your magical opal... ✨"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
              className="w-full px-6 py-4 pr-16 text-base rounded-2xl border border-warm-grey/20 bg-white/90 backdrop-blur-sm focus:border-opal-electric-accessible focus:outline-none focus:ring-2 focus:ring-opal-electric-accessible/20 transition-all shadow-lg font-sans placeholder:text-charcoal/40 placeholder:font-accent"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 text-charcoal/40 hover:text-charcoal/70 transition-colors"
                  aria-label="Clear search"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg
                className="w-5 h-5 text-opal-electric/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Enchanted Sort Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-white/95 via-white/90 to-opal-electric/5 backdrop-blur-sm rounded-2xl border border-warm-grey/20 shadow-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-opal-electric rounded-full animate-pulse"></span>
              <p className="font-sans text-charcoal font-medium">
                <span className="font-serif text-lg font-semibold text-opal-electric">{sortedProducts.length}</span>
                <span className="ml-1">{sortedProducts.length === 1 ? 'magical treasure' : 'magical treasures'} discovered</span>
                {!showOutOfStock && outOfStockCount > 0 && (
                  <span className="text-charcoal/50 ml-2 font-normal">
                    <span className="font-accent">({outOfStockCount} claimed by collectors)</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {/* Enchanted Out of Stock Toggle */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/50">
              <Checkbox
                id="show-sold"
                checked={showOutOfStock}
                onCheckedChange={(checked) => setShowOutOfStock(!!checked)}
                className="data-[state=checked]:bg-opal-electric data-[state=checked]:border-opal-electric-accessible"
              />
              <Label htmlFor="show-sold" className="font-sans text-sm cursor-pointer font-medium text-charcoal/80">
                <span className="font-accent">✨</span> Show claimed treasures
              </Label>
            </div>

            {/* Magical Sort */}
            <div className="flex items-center gap-3">
              <Label htmlFor="sort" className="font-serif text-sm font-semibold text-charcoal">
                <span className="font-accent text-opal-electric">⚡</span> Arrange by:
              </Label>
              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="w-[190px] rounded-xl border border-warm-grey/30 hover:border-opal-electric-accessible focus:border-opal-electric-accessible focus:ring-2 focus:ring-opal-electric-accessible/20 shadow-md bg-white/90 backdrop-blur-sm font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-warm-grey/30 rounded-xl shadow-xl">
                  <SelectItem value="featured" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">✨ Featured Finds</SelectItem>
                  <SelectItem value="price-low" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">💎 Price: High to Low</SelectItem>
                  <SelectItem value="newest" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">🌟 Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  image: product.images?.[0]?.image?.url,
                  category: product.category,
                  featured: product.featured,
                  stock: product.stock,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-gradient-to-br from-white/90 via-opal-electric/5 to-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-warm-grey/20 relative overflow-hidden">
            {/* Magical sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-1/4 w-2 h-2 bg-opal-electric/30 rounded-full animate-pulse" />
              <div className="absolute bottom-12 right-1/3 w-1.5 h-1.5 bg-fire-pink/40 rounded-full animate-pulse delay-300" />
              <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-opal-turquoise/30 rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-opal-electric/60 drop-shadow-lg">
                    <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
                    <path d="m11 3 1 9"/>
                    <path d="m12 3 1 9"/>
                    <path d="m13 3 1 9"/>
                  </svg>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-opal-electric to-fire-pink rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-accent">✨</span>
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold text-charcoal mb-3">No magical treasures found</h3>
              <p className="font-accent text-xl text-opal-electric/70 mb-2">~ The opals are hiding from these filters ~</p>
              <p className="font-sans text-sm text-charcoal/60 mb-10">Try adjusting your search or clearing the filters to discover more gems</p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-2xl text-base font-medium transition-all h-12 px-8 bg-gradient-to-r from-opal-electric to-opal-deep text-white hover:from-opal-deep hover:to-opal-electric shadow-xl hover:shadow-2xl hover:scale-105 transform font-sans"
              >
                <span className="font-accent text-lg">✨</span>
                Clear All Filters
                <span className="font-accent text-lg">✨</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

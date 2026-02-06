'use client'

/**
 * Professional Store Content Component
 * Clean, minimal design with improved UX
 */

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/product'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from './page'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { getStickyOffset, LAYOUT } from '@/lib/constants/layout'

interface StoreContentProps {
  products: Product[]
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

export function StoreContentPro({ products }: StoreContentProps) {
  // State
  const [sort, setSort] = useState<SortOption>('featured')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStoneTypes, setSelectedStoneTypes] = useState<string[]>([])
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  // Extract unique filter options
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
        const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (product.category !== selectedCategory) return false
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

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false

      return true
    })
  }, [products, searchQuery, selectedCategory, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange, showOutOfStock])

  const sortedProducts = sortProducts(filteredProducts, sort)

  // Category pills with better design
  const categoryPills = filterOptions.categories.map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
        selectedCategory === category
          ? "bg-gradient-to-r from-opal-electric to-opal-deep text-white"
          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
      )}
    >
      {category === 'all' ? 'All' : category.replace(/-/g, ' ')}
    </button>
  ))

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStoneTypes([])
    setSelectedOrigins([])
    setSelectedMaterials([])
    setPriceRange([0, filterOptions.maxPrice])
  }

  const activeFilterCount = [
    selectedCategory !== 'all' ? 1 : 0,
    selectedStoneTypes.length,
    selectedOrigins.length,
    selectedMaterials.length,
    priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <div
          className={cn(
            "sticky bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col",
            getStickyOffset(),
            "max-h-[calc(100vh-6rem)]" // 6rem = 96px (80px nav + 16px gap)
          )}
          style={{
            maxHeight: `calc(100vh - ${LAYOUT.navigation.desktop}px - 1rem)`
          }}>
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-semibold text-base text-gray-900">Refine</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-4 pt-3">
            <div className="space-y-4">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-sm mb-2 text-gray-900">Category</h4>
              <div className="space-y-0.5">
                {filterOptions.categories.map((category) => (
                  <label key={category} className="flex items-center cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="w-4 h-4 text-opal-electric-accessible focus:ring-opal-electric-accessible border-gray-300"
                    />
                    <span className="ml-2 text-sm capitalize text-gray-700">
                      {category === 'all' ? 'All Products' : category.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stone Types */}
            {filterOptions.stoneTypes.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-sm mb-2 text-gray-900">Stone Type</h4>
                <div className="space-y-0.5">
                  {filterOptions.stoneTypes.map((type) => (
                    <label key={type} className="flex items-center cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedStoneTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStoneTypes([...selectedStoneTypes, type])
                          } else {
                            setSelectedStoneTypes(selectedStoneTypes.filter(t => t !== type))
                          }
                        }}
                        className="w-4 h-4 rounded text-opal-electric-accessible focus:ring-opal-electric-accessible border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Origins */}
            {filterOptions.origins.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-sm mb-2 text-gray-900">Origin</h4>
                <div className="space-y-0.5">
                  {filterOptions.origins.map((origin) => (
                    <label key={origin} className="flex items-center cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedOrigins.includes(origin)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrigins([...selectedOrigins, origin])
                          } else {
                            setSelectedOrigins(selectedOrigins.filter(o => o !== origin))
                          }
                        }}
                        className="w-4 h-4 rounded text-opal-electric-accessible focus:ring-opal-electric-accessible border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{origin}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-medium text-sm mb-2">Price Range</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 focus:border-charcoal focus:outline-none"
                  />
                  <span className="py-1.5 text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  AUD ${priceRange[0]} - ${priceRange[1]}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-opal-electric-accessible focus:bg-white focus:outline-none focus:ring-1 focus:ring-opal-electric-accessible/20 text-sm transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-opal-electric-accessible focus:outline-none focus:ring-1 focus:ring-opal-electric-accessible/20 bg-white cursor-pointer transition-all text-sm"
            >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryPills}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
          </p>

          {/* Show out of stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={(e) => setShowOutOfStock(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-charcoal"
            />
            <span className="text-sm text-content-muted">Show sold items</span>
          </label>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg lg:hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Categories */}
              <div>
                <h4 className="font-medium text-sm mb-2">Category</h4>
                <div className="space-y-1">
                  {filterOptions.categories.map((category) => (
                    <label key={category} className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <input
                        type="radio"
                        name="category-mobile"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm capitalize">
                        {category === 'all' ? 'All Products' : category.replace(/-/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stone Types */}
              {filterOptions.stoneTypes.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Stone Type</h4>
                  <div className="space-y-1">
                    {filterOptions.stoneTypes.map((type) => (
                      <label key={type} className="flex items-center p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={selectedStoneTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStoneTypes([...selectedStoneTypes, type])
                            } else {
                              setSelectedStoneTypes(selectedStoneTypes.filter(t => t !== type))
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="ml-2 text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Origins */}
              {filterOptions.origins.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Origin</h4>
                  <div className="space-y-1">
                    {filterOptions.origins.map((origin) => (
                      <label key={origin} className="flex items-center p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={selectedOrigins.includes(origin)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrigins([...selectedOrigins, origin])
                            } else {
                              setSelectedOrigins(selectedOrigins.filter(o => o !== origin))
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="ml-2 text-sm">{origin}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-sm mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:border-charcoal focus:outline-none"
                  />
                  <span className="py-2 text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Apply/Clear buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 text-sm bg-charcoal text-white rounded-lg hover:bg-charcoal/90"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {sortedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.images?.[0]?.image?.url,
                category: product.category,
                stock: product.stock,
                stoneOrigin: product.stoneOrigin,
                stoneType: product.stoneType,
                createdAt: product.createdAt,
              }}
              index={index}
              variant="museum"
              showMetadata={true}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No products found</h3>
          <p className="text-content-muted mb-6">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
      </div>
    </div>
  )
}
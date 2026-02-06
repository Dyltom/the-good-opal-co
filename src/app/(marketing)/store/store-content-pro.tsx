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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { EnhancedSearchEmptyState } from '@/components/store/EnhancedSearchEmptyState'
import { QuickFilterPills, type QuickFilter } from '@/components/store/QuickFilterPills'

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
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | undefined>(undefined)

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

      // New arrivals filter (products created within last 7 days)
      if (activeQuickFilter === 'new-arrivals') {
        const productDate = new Date(product.createdAt)
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - 7)
        if (productDate < daysAgo) return false
      }

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
  }, [products, searchQuery, selectedCategory, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange, showOutOfStock, activeQuickFilter])

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
    setActiveQuickFilter(undefined)
  }

  // Handle quick filter selection
  const handleQuickFilterSelect = (filter: QuickFilter) => {
    // Clear all filters first
    clearAllFilters()

    // Apply the selected filter
    switch (filter.action.type) {
      case 'category':
        setSelectedCategory(filter.action.value as string)
        break
      case 'price':
        setPriceRange(filter.action.value as [number, number])
        break
      case 'sort':
        setSort(filter.action.value as SortOption)
        break
      case 'new':
        // Will be handled in filtering logic
        break
    }

    setActiveQuickFilter(filter.id === 'clear' ? undefined : filter.id)
  }

  const activeFilterCount = [
    selectedCategory !== 'all' ? 1 : 0,
    selectedStoneTypes.length,
    selectedOrigins.length,
    selectedMaterials.length,
    priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <div
          className={cn(
            "sticky",
            getStickyOffset(),
            "max-h-[calc(100vh-6rem)]"
          )}
          style={{
            maxHeight: `calc(100vh - ${LAYOUT.navigation.desktop}px - 1rem)`
          }}>
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="link"
                onClick={clearAllFilters}
                className="p-0 h-auto text-sm mt-1"
              >
                Clear all ({activeFilterCount})
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Category</h4>
              <div className="space-y-1">
                {filterOptions.categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "ghost"}
                    onClick={() => setSelectedCategory(category)}
                    className="w-full justify-start text-sm"
                  >
                    {category === 'all' ? 'All Products' : category.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stone Types */}
            {filterOptions.stoneTypes.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Stone Type</h4>
                <div className="space-y-2">
                  {filterOptions.stoneTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stone-${type}`}
                        checked={selectedStoneTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStoneTypes([...selectedStoneTypes, type])
                          } else {
                            setSelectedStoneTypes(selectedStoneTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`stone-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Origins */}
            {filterOptions.origins.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Origin</h4>
                <div className="space-y-2">
                  {filterOptions.origins.map((origin) => (
                    <div key={origin} className="flex items-center space-x-2">
                      <Checkbox
                        id={`origin-${origin}`}
                        checked={selectedOrigins.includes(origin)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrigins([...selectedOrigins, origin])
                          } else {
                            setSelectedOrigins(selectedOrigins.filter(o => o !== origin))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`origin-${origin}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {origin}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <Separator className="mb-4" />
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Price Range</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="h-9"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="h-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  AUD ${priceRange[0]} - ${priceRange[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search Australian opals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Pills - 2026 Best Practice for One-Click Filtering */}
          <QuickFilterPills
            onFilterSelect={handleQuickFilterSelect}
            activeFilter={activeQuickFilter}
            productCount={sortedProducts.length}
          />

          {/* Results Count */}
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-lg font-semibold text-charcoal">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'Opal' : 'Opals'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Handpicked from Australia's finest mines
              </p>
            </div>

            {/* Show out of stock toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-sold"
                checked={showOutOfStock}
                onCheckedChange={setShowOutOfStock}
              />
              <Label
                htmlFor="show-sold"
                className="text-sm font-medium cursor-pointer"
              >
                Show sold items
              </Label>
            </div>
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
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
                featured: product.featured,
              }}
              index={index}
              variant="default"
              showMetadata={true}
              animated={true}
              darkBackground={false}
            />
          ))}
        </motion.div>
      ) : (
        <EnhancedSearchEmptyState
          query={searchQuery}
          onClearFilters={clearAllFilters}
          onSelectCategory={setSelectedCategory}
          onSelectPriceRange={setPriceRange}
        />
      )}
      </div>
    </div>
  )
}
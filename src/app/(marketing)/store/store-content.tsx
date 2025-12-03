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

export function StoreContent({ products }: StoreContentProps) {
  // Sorting and display state
  const [sort, setSort] = useState<SortOption>('featured')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:w-72 flex-shrink-0">
        <div
          className="lg:sticky lg:top-24 bg-cream rounded-xl border border-warm-grey shadow-sm p-6 pr-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-thin"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#E8E6E3 #FAF9F6',
            scrollbarGutter: 'stable'
          }}
        >
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
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for your next treasure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3.5 pr-12 text-base rounded-xl border border-warm-grey bg-white focus:border-opal-blue focus:outline-none focus:ring-2 focus:ring-opal-blue/20 transition-all shadow-sm"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-40"
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

        {/* Sort Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream rounded-xl border border-warm-grey shadow-sm p-5">
          <div className="flex items-center gap-4">
            <p className="text-sm text-charcoal font-semibold">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'treasure' : 'treasures'} available
              {!showOutOfStock && outOfStockCount > 0 && (
                <span className="text-charcoal-60 ml-2 font-normal">
                  ({outOfStockCount} collected)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Out of Stock Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-sold"
                checked={showOutOfStock}
                onCheckedChange={(checked) => setShowOutOfStock(!!checked)}
                className="data-[state=checked]:bg-opal-blue data-[state=checked]:border-opal-blue"
              />
              <Label htmlFor="show-sold" className="text-sm cursor-pointer font-medium text-charcoal">
                Show already collected items
              </Label>
            </div>

            {/* Sort - Using shadcn Select */}
            <div className="flex items-center gap-2">
              <Label htmlFor="sort" className="text-sm font-semibold text-charcoal">
                Sort:
              </Label>
              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="w-[180px] rounded-lg border border-warm-grey hover:border-opal-blue focus:border-opal-blue focus:ring-2 focus:ring-opal-blue/20 shadow-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-warm-grey">
                  <SelectItem value="featured" className="focus:bg-opal-blue/10 focus:text-opal-blue">Featured Finds</SelectItem>
                  <SelectItem value="price-low" className="focus:bg-opal-blue/10 focus:text-opal-blue">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="focus:bg-opal-blue/10 focus:text-opal-blue">Price: High to Low</SelectItem>
                  <SelectItem value="newest" className="focus:bg-opal-blue/10 focus:text-opal-blue">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">💎</div>
            <p className="text-lg text-muted-foreground mb-4">No products match your filters</p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors h-10 px-6 bg-opal-blue text-white hover:bg-opal-blue-dark shadow-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

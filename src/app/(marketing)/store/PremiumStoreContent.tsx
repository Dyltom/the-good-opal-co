'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { Product } from './page'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { QuickFilterPills, type QuickFilter } from '@/components/store/QuickFilterPills'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PremiumStoreContentProps {
  products: Product[]
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest'

/**
 * Premium Store Content
 * Simplified, luxury-focused design with better visual hierarchy
 */
export function PremiumStoreContent({ products }: PremiumStoreContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | undefined>()

  // Extract filter options
  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    const origins = Array.from(new Set(products.map(p => p.stoneOrigin).filter((o): o is string => !!o)))
    const maxPrice = Math.max(...products.map(p => p.price), 10000)

    return { categories, origins, maxPrice }
  }, [products])

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products] // Start with all products

    // Handle quick filter for new arrivals
    if (activeQuickFilter === 'new-arrivals') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = filtered.filter(p => new Date(p.createdAt) >= sevenDaysAgo)
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.stoneType?.toLowerCase().includes(query)
      )
    }

    // Categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category))
    }

    // Origins
    if (selectedOrigins.length > 0) {
      filtered = filtered.filter(p => p.stoneOrigin && selectedOrigins.includes(p.stoneOrigin))
    }

    // Price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [products, searchQuery, selectedCategories, selectedOrigins, priceRange, sortBy, activeQuickFilter])

  const handleQuickFilterSelect = (filter: QuickFilter) => {
    // Clear other filters when using quick filters
    setSelectedCategories([])
    setSelectedOrigins([])
    setPriceRange([0, filterOptions.maxPrice])

    if (activeQuickFilter === filter.id) {
      // Toggle off if clicking same filter
      setActiveQuickFilter(undefined)
      setSortBy('featured')
    } else {
      setActiveQuickFilter(filter.id)

      // Apply the filter action
      switch (filter.action.type) {
        case 'category':
          setSelectedCategories([filter.action.value as string])
          break
        case 'price':
          const [min, max] = filter.action.value as [number, number]
          setPriceRange([min, max])
          break
        case 'sort':
          setSortBy(filter.action.value as SortOption)
          break
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedOrigins([])
    setPriceRange([0, filterOptions.maxPrice])
    setSortBy('featured')
    setActiveQuickFilter(undefined)
  }

  const activeFilterCount = selectedCategories.length + selectedOrigins.length +
    (priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0)

  return (
    <div className="min-h-screen">
      {/* Refined Header */}
      <div className="border-b bg-white sticky top-[84px] z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search opals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-opal-electric"
              />
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] h-12 border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(true)}
              className="h-12 px-6 border-gray-200 hover:border-opal-electric"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-opal-electric text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Quick Filter Pills */}
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <QuickFilterPills
              onFilterSelect={handleQuickFilterSelect}
              activeFilter={activeQuickFilter}
              productCount={filteredProducts.length}
            />
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-screen-2xl mx-auto">
            {filteredProducts.map((product, index) => (
              <div key={product.id}>
                  <ProductCard
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      compareAtPrice: product.compareAtPrice,
                      stock: product.stock,
                      featured: product.featured,
                      category: product.category,
                      image: product.images?.[0]?.image?.url,
                      stoneOrigin: product.stoneOrigin,
                      stoneType: product.stoneType,
                      createdAt: product.createdAt,
                    }}
                    index={index}
                    variant="museum"
                    showMetadata
                    animated
                  />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Products</SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-8">

            {/* Categories */}
            {filterOptions.categories.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-4 block">Category</Label>
                <div className="space-y-3">
                  {filterOptions.categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category])
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category))
                          }
                        }}
                      />
                      <span className="ml-3 capitalize">{category.replace(/-/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Origin */}
            {filterOptions.origins.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-4 block">Origin</Label>
                <div className="space-y-3">
                  {filterOptions.origins.map((origin) => (
                    <label key={origin} className="flex items-center">
                      <Checkbox
                        checked={selectedOrigins.includes(origin)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrigins([...selectedOrigins, origin])
                          } else {
                            setSelectedOrigins(selectedOrigins.filter(o => o !== origin))
                          }
                        }}
                      />
                      <span className="ml-3">{origin}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Price Range */}
            <div>
              <Label className="text-base font-medium mb-4 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={filterOptions.maxPrice}
                step={100}
                className="mb-6"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-opal-electric hover:bg-opal-electric-accessible"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
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
  }, [products, searchQuery, selectedCategories, selectedOrigins, priceRange, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedOrigins([])
    setPriceRange([0, filterOptions.maxPrice])
    setSortBy('featured')
  }

  const activeFilterCount = selectedCategories.length + selectedOrigins.length +
    (priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0)

  return (
    <div className="min-h-screen">
      {/* Refined Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
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
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center py-8 px-4">
        <h1 className="text-4xl font-serif mb-2">Our Collection</h1>
        <p className="text-gray-600">
          {filteredProducts.length} exceptional {filteredProducts.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-screen-2xl mx-auto"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
            {/* Sort */}
            <div>
              <Label className="text-base font-medium mb-4 block">Sort by</Label>
              <div className="space-y-2">
                {[
                  { value: 'featured', label: 'Featured' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-4 h-4 text-opal-electric"
                    />
                    <span className="ml-3">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

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
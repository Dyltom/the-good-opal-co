'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, LayoutGrid, Grid3X3, Filter } from 'lucide-react'
import type { Product } from './page'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Import all new components
import { EnhancedSearchEmptyState } from '@/components/store/EnhancedSearchEmptyState'
import { QuickFilterPills, type QuickFilter } from '@/components/store/QuickFilterPills'
import { ProductFinderQuiz } from '@/components/store/ProductFinderQuiz'
import { ProductFinderCallout } from '@/components/store/ProductFinderCallout'
import { EnhancedProductCard } from '@/components/product/EnhancedProductCard'
import { MasonryProductGrid } from '@/components/store/MasonryProductGrid'
import { EnhancedFilterSidebar } from '@/components/store/EnhancedFilterSidebar'
import { ProductRecommendations } from '@/components/ai/ProductRecommendations'
import { RecentPurchaseNotification } from '@/components/store/RecentPurchaseNotification'
import { VoiceSearch } from '@/components/ai/VoiceSearch'
import { usePersonalization } from '@/hooks/usePersonalization'

// Lazy load heavy components
const TrendingNow = lazy(() => import('@/components/ai/ProductRecommendations').then(m => ({ default: m.TrendingNow })))

interface EnhancedStoreContentProps {
  products: Product[]
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest'
type ViewMode = 'grid' | 'masonry'

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

/**
 * Enhanced Store Content Component
 * Integrates all new features from the uplift plan
 */
export function EnhancedStoreContent({ products }: EnhancedStoreContentProps) {
  // State
  const [sort, setSort] = useState<SortOption>('featured')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStoneTypes, setSelectedStoneTypes] = useState<string[]>([])
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizFilters, setQuizFilters] = useState<any>(null)

  // Personalization
  const [personalizationData, personalizationActions] = usePersonalization()

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

      // Quiz filters
      if (quizFilters) {
        if (quizFilters.categories?.length > 0 && !quizFilters.categories.includes(product.category)) {
          return false
        }
        if (quizFilters.stoneTypes?.length > 0 && (!product.stoneType || !quizFilters.stoneTypes.includes(product.stoneType))) {
          return false
        }
        if (quizFilters.priceRange && (product.price < quizFilters.priceRange[0] || product.price > quizFilters.priceRange[1])) {
          return false
        }
      }

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
  }, [products, searchQuery, selectedCategory, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange, showOutOfStock, activeQuickFilter, quizFilters])

  const sortedProducts = sortProducts(filteredProducts, sort)

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStoneTypes([])
    setSelectedOrigins([])
    setSelectedMaterials([])
    setPriceRange([0, filterOptions.maxPrice])
    setActiveQuickFilter(undefined)
    setQuizFilters(null)
  }

  const handleQuickFilterSelect = (filter: QuickFilter) => {
    clearAllFilters()

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
        // Handled in filtering logic
        break
    }

    setActiveQuickFilter(filter.id === 'clear' ? undefined : filter.id)
  }

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.categories !== undefined) setSelectedCategory(newFilters.categories.length === 1 ? newFilters.categories[0] : 'all')
    if (newFilters.stoneTypes !== undefined) setSelectedStoneTypes(newFilters.stoneTypes)
    if (newFilters.origins !== undefined) setSelectedOrigins(newFilters.origins)
    if (newFilters.priceRange !== undefined) setPriceRange(newFilters.priceRange)
  }

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query)
    personalizationActions.trackSearch(query)
  }

  const handleQuizComplete = (filters: any) => {
    setQuizFilters(filters)
    setShowQuiz(false)
    personalizationActions.saveQuizResults(filters)
  }

  const activeFilterCount = [
    selectedCategory !== 'all' ? 1 : 0,
    selectedStoneTypes.length,
    selectedOrigins.length,
    selectedMaterials.length,
    priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0,
    quizFilters ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-2xl w-full"
            >
              <ProductFinderQuiz
                products={products}
                onComplete={handleQuizComplete}
                onSkip={() => setShowQuiz(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Enhanced Filter Sidebar */}
        <EnhancedFilterSidebar
          products={products}
          filters={{
            categories: selectedCategory === 'all' ? [] : [selectedCategory],
            stoneTypes: selectedStoneTypes,
            origins: selectedOrigins,
            materials: selectedMaterials,
            priceRange,
          }}
          onFilterChange={handleFilterChange}
          activeFilterCount={activeFilterCount}
          onClearAll={clearAllFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            {/* Search with Voice */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Search Australian opals..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    personalizationActions.trackSearch(e.target.value)
                  }}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <VoiceSearch onSearch={handleVoiceSearch} />

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

              {/* View Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="masonry" aria-label="Masonry view">
                  <Grid3X3 className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Quick Filter Pills */}
            <QuickFilterPills
              onFilterSelect={handleQuickFilterSelect}
              activeFilter={activeQuickFilter}
              productCount={sortedProducts.length}
            />

            {/* Product Finder CTA */}
            {!quizFilters && (
              <ProductFinderCallout
                onStartQuiz={() => setShowQuiz(true)}
                className="mb-6"
              />
            )}

            {/* Results Count and Options */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-lg font-semibold text-charcoal">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'Opal' : 'Opals'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {quizFilters ? 'Personalized for you' : 'Handpicked from Australia\'s finest mines'}
                </p>
              </div>

              {/* Show out of stock toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-sold"
                  checked={showOutOfStock}
                  onCheckedChange={setShowOutOfStock}
                />
                <label
                  htmlFor="show-sold"
                  className="text-sm font-medium cursor-pointer"
                >
                  Show sold items
                </label>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {sortedProducts.length > 0 ? (
            viewMode === 'masonry' ? (
              <MasonryProductGrid
                products={sortedProducts}
                columns={4}
                gap={20}
                infiniteScroll={false}
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {sortedProducts.map((product, index) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    showRating
                    showQuickView
                    showCompare
                  />
                ))}
              </motion.div>
            )
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

      {/* Personalized Recommendations */}
      {sortedProducts.length > 0 && (
        <div className="mt-16">
          <ProductRecommendations
            products={products}
            title={personalizationData.viewedProducts.length > 0 ? "Recommended for You" : "Featured Collection"}
          />
        </div>
      )}

      {/* Trending Now Section */}
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <TrendingNow products={products} />
      </Suspense>

      {/* Social Proof Notification */}
      <RecentPurchaseNotification products={products} />
    </>
  )
}
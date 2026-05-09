'use client'

/**
 * Store Content Client Component
 *
 * Handles client-side filtering, sorting, and search functionality.
 * Receives products from server component via props.
 */

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/store/ProductFilters'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { clampPage, paginate, totalPages } from '@/lib/pagination'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Product } from './page'

const PRODUCTS_PER_PAGE = 24

interface StoreContentProps {
  products: Product[]
  searchQuery?: string
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest'

function formatFilterLabel(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

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
  const searchParams = useSearchParams()

  // Initialize state from URL parameters
  const [sort, setSort] = useState<SortOption>(() => {
    const sortParam = searchParams?.get('sort') as SortOption
    return ['featured', 'price-low', 'price-high', 'newest'].includes(sortParam) ? sortParam : 'featured'
  })
  const [showOutOfStock, setShowOutOfStock] = useState(() => searchParams?.get('showOutOfStock') === 'true')
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || searchParams?.get('search') || '')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Filter states - initialize from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams?.get('category')
    return categoryParam ? [categoryParam] : (searchParams?.get('categories')?.split(',').filter(Boolean) || [])
  })
  const [selectedStoneTypes, setSelectedStoneTypes] = useState<string[]>(() =>
    searchParams?.get('stoneTypes')?.split(',').filter(Boolean) || []
  )
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(() =>
    searchParams?.get('origins')?.split(',').filter(Boolean) || []
  )
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(() =>
    searchParams?.get('materials')?.split(',').filter(Boolean) || []
  )
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const minPrice = Number(searchParams?.get('minPrice')) || 0
    const maxPrice = Number(searchParams?.get('maxPrice')) || 10000
    return [minPrice, maxPrice]
  })
  const [page, setPage] = useState<number>(() => {
    const parsed = Number(searchParams?.get('page'))
    return Number.isFinite(parsed) && parsed > 1 ? Math.floor(parsed) : 1
  })

  // Reset to page 1 whenever filters or sort change — stale page numbers
  // after narrowing filters would otherwise land on an empty view.
  useEffect(() => {
    setPage(1)
  }, [sort, showOutOfStock, searchQuery, selectedCategories, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange])

  useEffect(() => {
    if (!isMobileFiltersOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileFiltersOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileFiltersOpen])

  // Sync state to URL parameters
  useEffect(() => {
    const params = new URLSearchParams()

    if (sort !== 'featured') params.set('sort', sort)
    if (showOutOfStock) params.set('showOutOfStock', 'true')
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','))
    if (selectedStoneTypes.length > 0) params.set('stoneTypes', selectedStoneTypes.join(','))
    if (selectedOrigins.length > 0) params.set('origins', selectedOrigins.join(','))
    if (selectedMaterials.length > 0) params.set('materials', selectedMaterials.join(','))
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
    if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1].toString())
    if (page > 1) params.set('page', page.toString())

    const queryString = params.toString()
    const newUrl = queryString ? `/store?${queryString}` : '/store'

    // Only update URL if it's different to avoid infinite loops
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl)
    }
  }, [sort, showOutOfStock, searchQuery, selectedCategories, selectedStoneTypes, selectedOrigins, selectedMaterials, priceRange, page])

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

  const pageCount = totalPages(sortedProducts.length, PRODUCTS_PER_PAGE)
  const currentPage = clampPage(page, pageCount)
  const pagedProducts = paginate(sortedProducts, currentPage, PRODUCTS_PER_PAGE)
  const resultRangeStart = sortedProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1
  const resultRangeEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length)
  const hasCustomPriceRange = priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.filter((category) => category !== 'all').length +
    selectedStoneTypes.length +
    selectedOrigins.length +
    selectedMaterials.length +
    (hasCustomPriceRange ? 1 : 0)

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

  const selectedFilters: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...(searchQuery
      ? [{
          key: 'search',
          label: `Search: ${searchQuery}`,
          onRemove: () => setSearchQuery(''),
        }]
      : []),
    ...selectedCategories
      .filter((category) => category !== 'all')
      .map((category) => ({
        key: `category-${category}`,
        label: formatFilterLabel(category),
        onRemove: () => handleCategoryChange(category),
      })),
    ...selectedStoneTypes.map((type) => ({
      key: `stone-${type}`,
      label: formatFilterLabel(type),
      onRemove: () => handleStoneTypeChange(type),
    })),
    ...selectedOrigins.map((origin) => ({
      key: `origin-${origin}`,
      label: formatFilterLabel(origin),
      onRemove: () => handleOriginChange(origin),
    })),
    ...selectedMaterials.map((material) => ({
      key: `material-${material}`,
      label: formatFilterLabel(material),
      onRemove: () => handleMaterialChange(material),
    })),
    ...(hasCustomPriceRange
      ? [{
          key: 'price',
          label: `$${priceRange[0]}-$${priceRange[1]}`,
          onRemove: () => setPriceRange([0, filterOptions.maxPrice]),
        }]
      : []),
  ]

  return (
    <div className="py-4 px-4 max-w-[90rem] mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
          <div
            className="lg:sticky lg:top-24 bg-white rounded-xl border border-warm-grey/30 shadow-sm p-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E8E6E3 transparent',
              scrollbarGutter: 'stable'
            }}
          >
          <div className="mb-6 pb-4 border-b border-warm-grey/30">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              Filters
            </h2>
          </div>

          <ProductFilters
            idPrefix="desktop"
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
        <section
          aria-label="Store search and refinement"
          className="mb-8 rounded-2xl border border-warm-grey/30 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(13.5rem,auto)] sm:items-center">
            <div>
              <label htmlFor="store-search" className="sr-only">Search products</label>
              <div className="relative">
                <input
                  id="store-search"
                  type="search"
                  inputMode="search"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                  className="h-12 w-full rounded-xl border border-warm-grey/30 bg-white px-5 pr-14 font-sans text-base shadow-sm transition-all placeholder:text-charcoal/40 focus:border-opal-electric-accessible focus:outline-none focus:ring-2 focus:ring-opal-electric-accessible/20"
                />
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal/45 transition-colors hover:text-charcoal/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible/30"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  ) : (
                    <div
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center text-opal-electric-accessible/65"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-5 w-5"
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
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-warm-grey/30 bg-cream px-4 py-3 font-sans text-sm font-semibold text-charcoal transition-colors hover:border-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible/30 lg:hidden"
              aria-label="Open filters"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-opal-electric-accessible" aria-hidden="true" />
                Filter & refine
              </span>
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-opal-electric-accessible px-2.5 py-1 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : (
                <span className="shrink-0 text-xs font-medium text-charcoal/55">
                  Optional
                </span>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-warm-grey/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-sans text-sm text-charcoal" aria-live="polite">
                <span className="font-semibold">
                  Showing {resultRangeStart}-{resultRangeEnd} of {sortedProducts.length}
                </span>
                <span className="ml-1 text-charcoal/70">{sortedProducts.length === 1 ? 'product' : 'products'}</span>
                {!showOutOfStock && outOfStockCount > 0 && (
                  <span className="ml-2 text-charcoal/50">
                    ({outOfStockCount} sold)
                  </span>
                )}
              </p>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-opal-electric-accessible/10 px-3 py-1 font-sans text-xs font-semibold text-opal-electric-accessible">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-h-[44px] items-center gap-3">
                <Checkbox
                  id="show-sold"
                  checked={showOutOfStock}
                  onCheckedChange={(checked) => setShowOutOfStock(!!checked)}
                  className="data-[state=checked]:bg-opal-electric-accessible data-[state=checked]:border-opal-electric-accessible"
                />
                <Label htmlFor="show-sold" className="font-sans text-sm cursor-pointer font-medium text-charcoal/80">
                  Include sold items
                </Label>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="sort" className="font-sans text-sm font-medium text-charcoal/80">
                  Sort by
                </Label>
                <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                  <SelectTrigger className="h-11 w-full sm:w-[190px] rounded-xl border border-warm-grey/30 bg-white font-sans shadow-sm hover:border-opal-electric-accessible focus:border-opal-electric-accessible focus:ring-2 focus:ring-opal-electric-accessible/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-warm-grey/30 rounded-xl shadow-lg">
                    <SelectItem value="featured" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">Featured</SelectItem>
                    <SelectItem value="price-low" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">Price: High to Low</SelectItem>
                    <SelectItem value="newest" className="font-sans focus:bg-opal-electric/10 focus:text-charcoal rounded-lg">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {isMobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filter & refine"
            aria-labelledby="mobile-filters-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Dismiss filter panel"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-warm-grey/30 px-5 py-4">
                <div>
                  <h2 id="mobile-filters-title" className="font-serif text-xl font-semibold text-charcoal">
                    Filter & refine
                  </h2>
                  <p className="font-sans text-xs text-charcoal/60">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-warm-grey/30 text-charcoal transition-colors hover:bg-warm-grey/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible/30"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <ProductFilters
                  idPrefix="mobile"
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
              <div className="border-t border-warm-grey/30 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-charcoal px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible/30"
                >
                  Show {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedFilters.length > 0 && (
          <div className="mb-8 rounded-xl border border-opal-electric-accessible/20 bg-opal-electric-accessible/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-sans text-sm font-semibold text-charcoal">Selected filters</h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex min-h-[44px] items-center rounded-full font-sans text-sm font-semibold text-opal-electric-accessible hover:text-opal-deep"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.onRemove}
                  className="inline-flex min-h-[44px] rounded-full items-center gap-2 border border-opal-electric-accessible/25 bg-white px-3 font-sans text-sm text-charcoal shadow-sm transition-colors hover:border-opal-electric-accessible hover:text-opal-electric-accessible"
                  aria-label={`Remove filter ${filter.label}`}
                >
                  <span>{filter.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <>
            <h2 className="sr-only">Products</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              data-testid="product-grid"
            >
              {pagedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  index={index}
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

            {pageCount > 1 && (
              <StorePagination
                currentPage={currentPage}
                totalPages={pageCount}
                onPageChange={(nextPage) => {
                  setPage(nextPage)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-warm-grey/30">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-6 text-charcoal/40"
              aria-hidden="true"
            >
              <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
              <path d="m11 3 1 9" />
              <path d="m12 3 1 9" />
              <path d="m13 3 1 9" />
            </svg>
            <h3 className="font-serif text-2xl font-semibold text-charcoal mb-2">No products found</h3>
            <p className="font-sans text-sm text-charcoal/60 mb-8">Try adjusting your search or clearing the filters.</p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors h-11 px-6 bg-charcoal text-white hover:bg-charcoal-dark font-sans"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

interface StorePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function StorePagination({ currentPage, totalPages, onPageChange }: StorePaginationProps) {
  const pages = buildPageRange(currentPage, totalPages)

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Store pagination"
      data-testid="store-pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl border border-warm-grey/30 bg-white px-4 py-2 font-sans text-sm text-charcoal transition-colors hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((entry, index) =>
        entry === '…' ? (
          <span key={`gap-${index}`} className="px-2 font-sans text-sm text-charcoal/50">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === currentPage ? 'page' : undefined}
            className={
              entry === currentPage
                ? 'rounded-xl bg-charcoal px-4 py-2 font-sans text-sm font-semibold text-white'
                : 'rounded-xl border border-warm-grey/30 bg-white px-4 py-2 font-sans text-sm text-charcoal transition-colors hover:border-charcoal hover:text-charcoal'
            }
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-warm-grey/30 bg-white px-4 py-2 font-sans text-sm text-charcoal transition-colors hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  )
}

function buildPageRange(current: number, total: number): Array<number | '…'> {
  const delta = 1
  const entries: Array<number | '…'> = []
  const pushed = new Set<number>()

  const push = (page: number) => {
    if (page >= 1 && page <= total && !pushed.has(page)) {
      entries.push(page)
      pushed.add(page)
    }
  }

  push(1)
  if (current - delta > 2) entries.push('…')
  for (let p = Math.max(2, current - delta); p <= Math.min(total - 1, current + delta); p++) {
    push(p)
  }
  if (current + delta < total - 1) entries.push('…')
  if (total > 1) push(total)

  return entries
}

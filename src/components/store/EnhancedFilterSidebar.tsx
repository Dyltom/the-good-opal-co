'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, ChevronUp, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStickyOffset, LAYOUT } from '@/lib/constants/layout'
import type { Product } from '@/app/(marketing)/store/page'

interface FilterOption {
  value: string
  label: string
  count: number
}

interface EnhancedFilterSidebarProps {
  products: Product[]
  filters: {
    categories: string[]
    stoneTypes: string[]
    origins: string[]
    materials: string[]
    priceRange: [number, number]
  }
  onFilterChange: (filters: any) => void
  activeFilterCount: number
  onClearAll: () => void
}

// Stone type color mapping for visual swatches
const stoneTypeColors: Record<string, string> = {
  'Black Opal': 'bg-gradient-to-br from-gray-900 to-gray-700',
  'White Opal': 'bg-gradient-to-br from-gray-100 to-white',
  'Boulder Opal': 'bg-gradient-to-br from-amber-700 to-amber-900',
  'Crystal Opal': 'bg-gradient-to-br from-blue-200 to-transparent',
  'Fire Opal': 'bg-gradient-to-br from-orange-500 to-red-600',
  'Matrix Opal': 'bg-gradient-to-br from-gray-600 to-gray-400',
}

// Australian mining locations for map
const miningLocations = {
  'Lightning Ridge': { x: 75, y: 45 },
  'Coober Pedy': { x: 50, y: 70 },
  'Mintabie': { x: 52, y: 68 },
  'Andamooka': { x: 54, y: 72 },
  'Queensland': { x: 80, y: 35 },
  'Other': { x: 65, y: 60 },
}

/**
 * Enhanced Filter Sidebar Component
 * Advanced filtering UI with visual previews
 */
export function EnhancedFilterSidebar({
  products,
  filters,
  onFilterChange,
  activeFilterCount,
  onClearAll,
}: EnhancedFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    stoneTypes: true,
    origins: false,
    materials: false,
    price: true,
  })

  // Calculate filter options with counts
  const getFilterOptions = (field: keyof Product): FilterOption[] => {
    const counts = products.reduce((acc, product) => {
      const value = product[field] as string
      if (value) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: value.replace(/-/g, ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  const categoryOptions = getFilterOptions('category')
  const stoneTypeOptions = getFilterOptions('stoneType')
  const originOptions = getFilterOptions('stoneOrigin')


  // Calculate price distribution for histogram
  const priceDistribution = () => {
    const buckets = 10
    const maxPrice = Math.max(...products.map(p => p.price))
    const bucketSize = Math.ceil(maxPrice / buckets)
    const distribution = new Array(buckets).fill(0)

    products.forEach(product => {
      const bucketIndex = Math.min(
        Math.floor(product.price / bucketSize),
        buckets - 1
      )
      distribution[bucketIndex]++
    })

    return distribution.map((count, index) => ({
      range: [index * bucketSize, (index + 1) * bucketSize],
      count,
      percentage: (count / products.length) * 100,
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <aside className="w-72 flex-shrink-0">
      <div
        className={cn(
          "sticky",
          getStickyOffset(),
          "max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin"
        )}
        style={{
          maxHeight: `calc(100vh - ${LAYOUT.navigation.desktop}px - 1rem)`
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Gem className="w-5 h-5 text-opal-electric" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <Button
              variant="link"
              onClick={onClearAll}
              className="p-0 h-auto text-sm mt-1"
            >
              Clear all ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <FilterSection
            title="Category"
            expanded={expandedSections.categories ?? false}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-1">
              <Button
                variant={filters.categories.length === 0 ? "secondary" : "ghost"}
                onClick={() => onFilterChange({ categories: [] })}
                className="w-full justify-between text-sm"
              >
                <span>All Categories</span>
                <span className="text-muted-foreground">{products.length}</span>
              </Button>
              {categoryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.categories.includes(option.value) ? "secondary" : "ghost"}
                  onClick={() => {
                    const newCategories = filters.categories.includes(option.value)
                      ? filters.categories.filter(c => c !== option.value)
                      : [...filters.categories, option.value]
                    onFilterChange({ categories: newCategories })
                  }}
                  className="w-full justify-between text-sm capitalize"
                >
                  <span>{option.label}</span>
                  <span className="text-muted-foreground">{option.count}</span>
                </Button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Stone Types with Visual Swatches */}
          <FilterSection
            title="Stone Type"
            expanded={expandedSections.stoneTypes ?? false}
            onToggle={() => toggleSection('stoneTypes')}
          >
            <div className="grid grid-cols-2 gap-3">
              {stoneTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    const newTypes = filters.stoneTypes.includes(option.value)
                      ? filters.stoneTypes.filter(t => t !== option.value)
                      : [...filters.stoneTypes, option.value]
                    onFilterChange({ stoneTypes: newTypes })
                  }}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all",
                    filters.stoneTypes.includes(option.value)
                      ? "border-opal-electric"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {/* Color swatch */}
                  <div
                    className={cn(
                      "w-full h-12 rounded-md mb-2",
                      stoneTypeColors[option.value] || 'bg-gray-300'
                    )}
                  />
                  <p className="text-xs font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">({option.count})</p>
                </button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Origins with Map */}
          <FilterSection
            title="Origin"
            expanded={expandedSections.origins ?? false}
            onToggle={() => toggleSection('origins')}
          >
            {/* Mini Australia map */}
            <div className="relative w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Simplified Australia outline */}
                <path
                  d="M 20,40 Q 30,20 50,25 T 80,30 Q 85,50 75,70 L 60,80 Q 40,75 25,65 Z"
                  fill="#e5e7eb"
                  stroke="#d1d5db"
                  strokeWidth="0.5"
                />

                {/* Location markers */}
                {Object.entries(miningLocations).map(([location, pos]) => {
                  const isSelected = filters.origins.includes(location)
                  const count = originOptions.find(o => o.value === location)?.count || 0

                  return count > 0 ? (
                    <g key={location}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 4 : 3}
                        fill={isSelected ? '#3b82f6' : '#6b7280'}
                        className="cursor-pointer transition-all hover:r-5"
                        onClick={() => {
                          const newOrigins = filters.origins.includes(location)
                            ? filters.origins.filter(o => o !== location)
                            : [...filters.origins, location]
                          onFilterChange({ origins: newOrigins })
                        }}
                      />
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={6}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  ) : null
                })}
              </svg>
            </div>

            {/* Origin checkboxes */}
            <div className="space-y-2">
              {originOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`origin-${option.value}`}
                    checked={filters.origins.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newOrigins = checked
                        ? [...filters.origins, option.value]
                        : filters.origins.filter(o => o !== option.value)
                      onFilterChange({ origins: newOrigins })
                    }}
                  />
                  <Label
                    htmlFor={`origin-${option.value}`}
                    className="text-sm font-normal cursor-pointer flex-1 flex justify-between"
                  >
                    <span>{option.label}</span>
                    <span className="text-muted-foreground">{option.count}</span>
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Price Range with Histogram */}
          <FilterSection
            title="Price Range"
            expanded={expandedSections.price ?? false}
            onToggle={() => toggleSection('price')}
          >
            {/* Price histogram */}
            <div className="mb-4">
              <div className="flex items-end gap-1 h-16">
                {priceDistribution().map((bucket, index) => {
                  const [bucketMin = 0, bucketMax = 0] = bucket.range
                  const isInRange =
                    bucketMin >= filters.priceRange[0] &&
                    bucketMax <= filters.priceRange[1]

                  return (
                    <div
                      key={index}
                      className="flex-1 relative group"
                      style={{ height: '100%' }}
                    >
                      <div
                        className={cn(
                          "absolute bottom-0 w-full rounded-t transition-all",
                          isInRange
                            ? "bg-opal-electric"
                            : "bg-gray-300"
                        )}
                        style={{
                          height: `${Math.max(10, bucket.percentage * 3)}%`,
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          ${bucket.range[0]}-${bucket.range[1]}
                          <br />
                          {bucket.count} items
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange({ priceRange: value })}
                min={0}
                max={Math.max(...products.map(p => p.price))}
                step={50}
                className="w-full"
              />

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  ${filters.priceRange[0].toLocaleString()}
                </span>
                <span className="text-muted-foreground">to</span>
                <span className="font-medium">
                  ${filters.priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  )
}

/**
 * Collapsible Filter Section
 */
function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-opal-electric transition-colors mb-3"
      >
        <span className="uppercase tracking-wider">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
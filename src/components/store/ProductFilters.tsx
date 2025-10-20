'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FilterOptions {
  categories: string[]
  stoneTypes: string[]
  origins: string[]
  materials: string[]
  priceRange: [number, number]
  maxPrice: number
}

interface ProductFiltersProps {
  filters: FilterOptions
  selectedCategories: string[]
  selectedStoneTypes: string[]
  selectedOrigins: string[]
  selectedMaterials: string[]
  priceRange: [number, number]
  onCategoryChange: (category: string) => void
  onStoneTypeChange: (type: string) => void
  onOriginChange: (origin: string) => void
  onMaterialChange: (material: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onClearAll: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  'all': 'All Products',
  'opal-rings': 'Rings',
  'opal-necklaces': 'Necklaces & Pendants',
  'opal-earrings': 'Earrings',
  'opal-bracelets': 'Bracelets',
  'raw-opals': 'Raw Opals',
  'custom-commissions': 'Custom Commissions',
}

const STONE_TYPE_LABELS: Record<string, string> = {
  'black-opal': 'Black Opal',
  'white-opal': 'White Opal',
  'boulder-opal': 'Boulder Opal',
  'crystal-opal': 'Crystal Opal',
  'fire-opal': 'Fire Opal',
  'matrix-opal': 'Matrix Opal',
}

const ORIGIN_LABELS: Record<string, string> = {
  'lightning-ridge': 'Lightning Ridge, NSW',
  'coober-pedy': 'Coober Pedy, SA',
  'mintabie': 'Mintabie, SA',
  'andamooka': 'Andamooka, SA',
  'queensland': 'Queensland',
  'other-australian': 'Other Australian',
}

const MATERIAL_LABELS: Record<string, string> = {
  'sterling-silver': 'Sterling Silver',
  '14k-gold': '14K Gold',
  '18k-gold': '18K Gold',
  'white-gold': 'White Gold',
  'rose-gold': 'Rose Gold',
  'platinum': 'Platinum',
  'none': 'Raw Opal (No Setting)',
}

export function ProductFilters({
  filters,
  selectedCategories,
  selectedStoneTypes,
  selectedOrigins,
  selectedMaterials,
  priceRange,
  onCategoryChange,
  onStoneTypeChange,
  onOriginChange,
  onMaterialChange,
  onPriceRangeChange,
  onClearAll,
}: ProductFiltersProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStoneTypes.length > 0 ||
    selectedOrigins.length > 0 ||
    selectedMaterials.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== filters.maxPrice

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filters - Always Expanded */}
      <div className="w-full space-y-6">
        {/* Price Range Filter - Moved to Top */}
        <div className="pb-6 border-b border-warm-grey/50">
          <h3 className="text-sm font-semibold mb-4 text-charcoal">Price Range</h3>
          <div className="space-y-4">
            <div className="px-1">
              <Slider
                min={0}
                max={filters.maxPrice}
                step={10}
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-charcoal">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {filters.categories.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/50">
            <h3 className="text-sm font-semibold mb-3 text-charcoal">Category</h3>
            <div className="space-y-2.5">
              {filters.categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => onCategoryChange(category)}
                    className="data-[state=checked]:bg-opal-blue data-[state=checked]:border-opal-blue"
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer leading-none text-charcoal-80 hover:text-opal-blue transition-colors"
                  >
                    {CATEGORY_LABELS[category] || category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stone Type Filter */}
        {filters.stoneTypes.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/50">
            <h3 className="text-sm font-semibold mb-3 text-charcoal">Stone Type</h3>
            <div className="space-y-2.5">
              {filters.stoneTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stone-${type}`}
                    checked={selectedStoneTypes.includes(type)}
                    onCheckedChange={() => onStoneTypeChange(type)}
                    className="data-[state=checked]:bg-opal-blue data-[state=checked]:border-opal-blue"
                  />
                  <Label
                    htmlFor={`stone-${type}`}
                    className="text-sm font-normal cursor-pointer leading-none text-charcoal-80 hover:text-opal-blue transition-colors"
                  >
                    {STONE_TYPE_LABELS[type] || type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Origin Filter */}
        {filters.origins.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/50">
            <h3 className="text-sm font-semibold mb-3 text-charcoal">Origin</h3>
            <div className="space-y-2.5">
              {filters.origins.map((origin) => (
                <div key={origin} className="flex items-center space-x-2">
                  <Checkbox
                    id={`origin-${origin}`}
                    checked={selectedOrigins.includes(origin)}
                    onCheckedChange={() => onOriginChange(origin)}
                    className="data-[state=checked]:bg-opal-blue data-[state=checked]:border-opal-blue"
                  />
                  <Label
                    htmlFor={`origin-${origin}`}
                    className="text-sm font-normal cursor-pointer leading-none text-charcoal-80 hover:text-opal-blue transition-colors"
                  >
                    {ORIGIN_LABELS[origin] || origin}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Material Filter */}
        {filters.materials.length > 0 && (
          <div className="pb-6">
            <h3 className="text-sm font-semibold mb-3 text-charcoal">Material</h3>
            <div className="space-y-2.5">
              {filters.materials.map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material}`}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => onMaterialChange(material)}
                    className="data-[state=checked]:bg-opal-blue data-[state=checked]:border-opal-blue"
                  />
                  <Label
                    htmlFor={`material-${material}`}
                    className="text-sm font-normal cursor-pointer leading-none text-charcoal-80 hover:text-opal-blue transition-colors"
                  >
                    {MATERIAL_LABELS[material] || material}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

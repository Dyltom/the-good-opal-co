'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X, Star, Crown, Sparkles, Moon, Gem, Flower2 } from 'lucide-react'

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

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  'all': { label: 'All', icon: <Star size={16} className="text-charcoal/50" /> },
  'opal-rings': { label: 'Rings', icon: <Crown size={16} className="text-charcoal/50" /> },
  'opal-necklaces': { label: 'Necklaces & Pendants', icon: <Sparkles size={16} className="text-charcoal/50" /> },
  'opal-earrings': { label: 'Earrings', icon: <Sparkles size={16} className="text-charcoal/50" /> },
  'opal-bracelets': { label: 'Bracelets', icon: <Moon size={16} className="text-charcoal/50" /> },
  'raw-opals': { label: 'Raw Opals', icon: <Gem size={16} className="text-charcoal/50" /> },
  'custom-commissions': { label: 'Custom Commissions', icon: <Flower2 size={16} className="text-charcoal/50" /> },
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
    <div className="w-full space-y-8">
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear all
        </Button>
      )}

      <div className="w-full space-y-6">
        <div className="pb-6 border-b border-warm-grey/30">
          <h3 className="font-sans text-xs uppercase tracking-[0.15em] font-semibold mb-4 text-charcoal/70">
            Price
          </h3>
          <div className="space-y-4">
            {/* Price Input Fields */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="min-price" className="block text-xs font-medium text-charcoal/70 mb-1">
                  Min
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/60">$</span>
                  <input
                    id="min-price"
                    type="number"
                    min={0}
                    max={filters.maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(Number(e.target.value) || 0, priceRange[1]))
                      onPriceRangeChange([value, priceRange[1]])
                    }}
                    className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-warm-grey/30 focus:border-opal-electric focus:outline-none focus:ring-2 focus:ring-opal-electric/20 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="text-charcoal/40 mt-5">to</div>
              <div className="flex-1">
                <label htmlFor="max-price" className="block text-xs font-medium text-charcoal/70 mb-1">
                  Max
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/60">$</span>
                  <input
                    id="max-price"
                    type="number"
                    min={priceRange[0]}
                    max={filters.maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Math.min(filters.maxPrice, Math.max(Number(e.target.value) || filters.maxPrice, priceRange[0]))
                      onPriceRangeChange([priceRange[0], value])
                    }}
                    className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-warm-grey/30 focus:border-opal-electric focus:outline-none focus:ring-2 focus:ring-opal-electric/20 transition-all"
                    placeholder={filters.maxPrice.toString()}
                  />
                </div>
              </div>
            </div>
            {/* Slider */}
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
          </div>
        </div>

        {filters.categories.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/30">
            <h3 className="font-sans text-xs uppercase tracking-[0.15em] font-semibold mb-4 text-charcoal/70">
              Category
            </h3>
            <div className="space-y-3">
              {filters.categories.map((category) => (
                <div key={category} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-warm-grey/20 transition-all">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => onCategoryChange(category)}
                    className="data-[state=checked]:bg-opal-electric data-[state=checked]:border-opal-electric-accessible shadow-sm"
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="font-sans text-sm font-medium cursor-pointer leading-none text-charcoal/80 hover:text-opal-electric transition-colors flex items-center gap-2 flex-1"
                  >
                    {CATEGORY_LABELS[category]?.icon}
                    <span>{CATEGORY_LABELS[category]?.label || category}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {filters.stoneTypes.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/30">
            <h3 className="font-sans text-xs uppercase tracking-[0.15em] font-semibold mb-4 text-charcoal/70">
              Stone Type
            </h3>
            <div className="space-y-3">
              {filters.stoneTypes.map((type) => (
                <div key={type} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-warm-grey/20 transition-all">
                  <Checkbox
                    id={`stone-${type}`}
                    checked={selectedStoneTypes.includes(type)}
                    onCheckedChange={() => onStoneTypeChange(type)}
                    className="data-[state=checked]:bg-opal-electric data-[state=checked]:border-opal-electric-accessible shadow-sm"
                  />
                  <Label
                    htmlFor={`stone-${type}`}
                    className="font-sans text-sm font-medium cursor-pointer leading-none text-charcoal/80 hover:text-opal-electric transition-colors flex-1"
                  >
                    {STONE_TYPE_LABELS[type] || type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {filters.origins.length > 0 && (
          <div className="pb-6 border-b border-warm-grey/30">
            <h3 className="font-sans text-xs uppercase tracking-[0.15em] font-semibold mb-4 text-charcoal/70">
              Origin
            </h3>
            <div className="space-y-3">
              {filters.origins.map((origin) => (
                <div key={origin} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-warm-grey/20 transition-all">
                  <Checkbox
                    id={`origin-${origin}`}
                    checked={selectedOrigins.includes(origin)}
                    onCheckedChange={() => onOriginChange(origin)}
                    className="data-[state=checked]:bg-opal-electric data-[state=checked]:border-opal-electric-accessible shadow-sm"
                  />
                  <Label
                    htmlFor={`origin-${origin}`}
                    className="font-sans text-sm font-medium cursor-pointer leading-none text-charcoal/80 hover:text-opal-electric transition-colors flex-1"
                  >
                    {ORIGIN_LABELS[origin] || origin}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {filters.materials.length > 0 && (
          <div className="pb-6">
            <h3 className="font-sans text-xs uppercase tracking-[0.15em] font-semibold mb-4 text-charcoal/70">
              Material
            </h3>
            <div className="space-y-3">
              {filters.materials.map((material) => (
                <div key={material} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-warm-grey/20 transition-all">
                  <Checkbox
                    id={`material-${material}`}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => onMaterialChange(material)}
                    className="data-[state=checked]:bg-opal-electric data-[state=checked]:border-opal-electric-accessible shadow-sm"
                  />
                  <Label
                    htmlFor={`material-${material}`}
                    className="font-sans text-sm font-medium cursor-pointer leading-none text-charcoal/80 hover:text-opal-electric transition-colors flex-1"
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

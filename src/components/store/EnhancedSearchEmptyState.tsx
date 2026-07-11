'use client'

import Link from 'next/link'
import { Search, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface EnhancedSearchEmptyStateProps {
  query?: string
  onClearFilters: () => void
  onSelectCategory?: (category: string) => void
  onSelectPriceRange?: (range: [number, number]) => void
}

/**
 * Enhanced Search Empty State with Personalized Suggestions
 * Following 2026 UX best practices for helpful empty states with actionable suggestions
 */
export function EnhancedSearchEmptyState({
  query,
  onClearFilters,
  onSelectCategory,
  onSelectPriceRange,
}: EnhancedSearchEmptyStateProps) {
  // Popular searches based on typical opal shopping patterns
  const popularSearches = [
    { term: 'Black Opal', category: 'black-opal' },
    { term: 'Lightning Ridge', origin: 'Lightning Ridge' },
    { term: 'Under $500', priceRange: [0, 500] as [number, number] },
    { term: 'Rings', category: 'rings' },
  ]

  // Trending categories
  const trendingCategories = [
    { name: 'Raw Opals', slug: 'raw-opals', color: 'from-opal-electric to-opal-deep' },
    { name: 'Pendants', slug: 'necklaces', color: 'from-fire-gold to-fire-orange' },
    { name: 'Earrings', slug: 'earrings', color: 'from-opal-emerald to-opal-turquoise' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-4"
    >
      {/* Icon and Message */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <Search className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-2xl font-semibold text-foreground mb-3">
        {query ? `No opals found for "${query}"` : 'No products found'}
      </h3>

      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {query
          ? "Try adjusting your search or explore our suggestions below"
          : "Try adjusting your filters or explore our popular collections"
        }
      </p>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <Button onClick={onClearFilters} size="lg">
          Clear All Filters
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/store">View All Products</Link>
        </Button>
      </div>

      {/* Suggestions Section */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Popular Searches */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-opal-electric" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Popular Searches
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularSearches.map((search) => (
              <button
                key={search.term}
                onClick={() => {
                  if (search.category && onSelectCategory) {
                    onSelectCategory(search.category)
                  } else if (search.priceRange && onSelectPriceRange) {
                    onSelectPriceRange(search.priceRange)
                  }
                }}
                className="group"
              >
                <Badge
                  variant="outline"
                  className="px-4 py-2 hover:bg-opal-electric/10 hover:border-opal-electric transition-colors cursor-pointer"
                >
                  {search.term}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Categories */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-fire-gold" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trending Collections
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trendingCategories.map((category, index) => (
              <motion.button
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectCategory && onSelectCategory(category.slug)}
                className="relative overflow-hidden rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all hover:shadow-md group"
              >
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${category.color}`} />
                <h5 className="font-semibold text-foreground relative z-10 group-hover:text-opal-electric transition-colors">
                  {category.name}
                </h5>
                <p className="text-sm text-muted-foreground mt-1 relative z-10">
                  Explore collection →
                </p>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}

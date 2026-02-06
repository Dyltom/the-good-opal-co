'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, DollarSign, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface QuickFilterPillsProps {
  onFilterSelect: (filter: QuickFilter) => void
  activeFilter?: string
  productCount: number
}

export interface QuickFilter {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  action: {
    type: 'category' | 'price' | 'sort' | 'new'
    value: string | [number, number] | { days: number }
  }
}

/**
 * Quick Filter Pills Component
 * Provides one-click access to popular filters following 2026 UX best practices
 */
export function QuickFilterPills({
  onFilterSelect,
  activeFilter,
  productCount
}: QuickFilterPillsProps) {
  const [hoveredPill, setHoveredPill] = useState<string | null>(null)

  const quickFilters: QuickFilter[] = [
    {
      id: 'new-arrivals',
      label: 'New Arrivals',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'from-fire-gold to-fire-orange',
      action: {
        type: 'new',
        value: { days: 7 }
      }
    },
    {
      id: 'best-sellers',
      label: 'Best Sellers',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: 'from-opal-electric to-opal-deep',
      action: {
        type: 'sort',
        value: 'featured'
      }
    },
    {
      id: 'under-500',
      label: 'Under $500',
      icon: <DollarSign className="w-3.5 h-3.5" />,
      color: 'from-opal-emerald to-opal-turquoise',
      action: {
        type: 'price',
        value: [0, 500]
      }
    },
    {
      id: 'black-opals',
      label: 'Black Opals',
      icon: <Gem className="w-3.5 h-3.5" />,
      color: 'from-black-rich to-gray-800',
      action: {
        type: 'category',
        value: 'black-opal'
      }
    }
  ]

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Filters
        </h3>
        {activeFilter && (
          <button
            onClick={() => onFilterSelect({
              id: 'clear',
              label: 'Clear',
              icon: null,
              color: '',
              action: { type: 'category', value: 'all' }
            })}
            className="text-xs text-opal-electric hover:text-opal-electric-accessible transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter, index) => {
          const isActive = activeFilter === filter.id

          return (
            <motion.button
              key={filter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onFilterSelect(filter)}
              onMouseEnter={() => setHoveredPill(filter.id)}
              onMouseLeave={() => setHoveredPill(null)}
              className="group relative"
            >
              {/* Gradient background on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity",
                  "bg-gradient-to-r",
                  isActive && "opacity-15"
                )}
                style={{
                  backgroundImage: hoveredPill === filter.id || isActive
                    ? `linear-gradient(to right, ${filter.color.replace('from-', 'var(--').replace('to-', '), var(--')})`
                    : undefined
                }}
              />

              <Badge
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "px-4 py-1.5 flex items-center gap-2 transition-all cursor-pointer relative",
                  "hover:border-opacity-50",
                  isActive && "bg-gradient-to-r text-white border-0",
                  isActive && filter.color
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-opal-electric"
                )}>
                  {filter.icon}
                </span>
                <span className="font-medium text-sm">{filter.label}</span>
              </Badge>

              {/* Hover tooltip */}
              {hoveredPill === filter.id && !isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black-rich text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                >
                  {filter.id === 'new-arrivals' && `${productCount} new this week`}
                  {filter.id === 'best-sellers' && 'Most popular opals'}
                  {filter.id === 'under-500' && 'Budget-friendly options'}
                  {filter.id === 'black-opals' && 'Premium collection'}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black-rich rotate-45" />
                </motion.div>
              )}
            </motion.button>
          )
        })}

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-2 self-center" />

        {/* Product Count */}
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{productCount}</span>
          <span className="ml-1">products</span>
        </div>
      </div>
    </div>
  )
}
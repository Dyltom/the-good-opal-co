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
    <div>
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
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
              className={cn(
                "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200",
                "flex items-center gap-2.5 group",
                isActive
                  ? "bg-black-rich text-white shadow-lg"
                  : "bg-white text-gray-700 hover:text-black-rich hover:shadow-md border border-gray-200"
              )}
            >
              <span className={cn(
                "transition-transform duration-200",
                isActive ? "text-white" : "text-gray-500 group-hover:text-black-rich",
                "group-hover:scale-110"
              )}>
                {filter.icon}
              </span>
              <span>{filter.label}</span>

              {isActive && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs">✓</span>
                </motion.span>
              )}
            </motion.button>
          )
        })}

        {activeFilter && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onFilterSelect({
              id: 'clear',
              label: 'Clear',
              icon: null,
              color: '',
              action: { type: 'category', value: 'all' }
            })}
            className="text-sm text-gray-600 hover:text-black-rich transition-colors underline-offset-4 hover:underline"
          >
            Clear filters
          </motion.button>
        )}
      </div>
    </div>
  )
}
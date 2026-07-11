'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/lib/analytics'

interface ProductViewTrackerProps {
  product: {
    id: string | number
    name?: string
    category?: string | null
    price?: number
  }
  children: React.ReactNode
}

/**
 * Product View Tracker Component
 * Tracks product views to Google Analytics on mount
 * Single Responsibility: Only handles product view tracking
 */
export function ProductViewTracker({ product, children }: ProductViewTrackerProps) {
  useEffect(() => {
    // Track product view when component mounts
    trackProductView({
      id: String(product.id),
      name: product.name,
      category: product.category ?? undefined,
      price: product.price,
    })
  }, [product])

  // Render children without wrapper to avoid layout issues
  return <>{children}</>
}

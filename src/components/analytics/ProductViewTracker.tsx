'use client'

import { useEffect } from 'react'
import type { Product } from '@/payload-types'
import { trackProductView } from '@/lib/analytics'

interface ProductViewTrackerProps {
  product: Product
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
    trackProductView(product)
  }, [product])

  // Render children without wrapper to avoid layout issues
  return <>{children}</>
}
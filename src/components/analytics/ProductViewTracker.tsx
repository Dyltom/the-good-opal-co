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

export function ProductViewTracker({ product, children }: ProductViewTrackerProps) {
  const { id, name, category, price } = product
  useEffect(() => {
    trackProductView({ id: String(id), name, category: category ?? undefined, price })
  }, [id, name, category, price])

  return <>{children}</>
}

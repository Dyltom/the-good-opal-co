'use client'

import { useEffect } from 'react'
import { trackSearch, trackStoreFilter } from '@/lib/analytics'
import type { StoreQuery } from './store-query'

function activeFilters(query: StoreQuery): Record<string, string> {
  const filters: Record<string, string> = {}
  if (query.category) filters.category = query.category
  if (query.stone) filters.stone = query.stone
  if (query.origin) filters.origin = query.origin
  if (query.material) filters.material = query.material
  if (query.price) filters.price = query.price
  if (query.availability === 'all') filters.availability = 'all'
  if (query.sort !== 'featured') filters.sort = query.sort
  return filters
}

export function StoreInsights({ query, results }: { query: StoreQuery; results: number }) {
  const { search, page } = query
  const filters = activeFilters(query)
  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (page === 1 && search) trackSearch(search, results)
  }, [search, page, results])

  useEffect(() => {
    const active: Record<string, string> = JSON.parse(filterKey)
    if (page === 1 && Object.keys(active).length > 0) trackStoreFilter(active, results)
  }, [filterKey, page, results])

  return null
}

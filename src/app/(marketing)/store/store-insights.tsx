'use client'

import { useEffect } from 'react'
import { trackSearch, trackStoreFilter } from '@/lib/analytics'
import { STORE_FACETS, type StoreQuery } from './store-query'

function activeFilters(query: StoreQuery): Record<string, string> {
  const filters: Record<string, string> = {}
  for (const facet of STORE_FACETS) {
    if (query[facet].length > 0) filters[facet] = query[facet].join(',')
  }
  if (query.priceMin !== undefined) filters.price_min = String(query.priceMin)
  if (query.priceMax !== undefined) filters.price_max = String(query.priceMax)
  if (query.availability === 'all') filters.availability = 'all'
  if (query.sort !== 'featured') filters.sort = query.sort
  return filters
}

export function StoreInsights({ query, results }: { query: StoreQuery; results: number }) {
  const { search, page } = query
  const filterKey = JSON.stringify(activeFilters(query))

  useEffect(() => {
    if (page === 1 && search) trackSearch(search, results)
  }, [search, page, results])

  useEffect(() => {
    const active: Record<string, string> = JSON.parse(filterKey)
    if (page === 1 && Object.keys(active).length > 0) trackStoreFilter(active, results)
  }, [filterKey, page, results])

  return null
}

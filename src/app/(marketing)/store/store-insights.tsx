'use client'

import { useEffect } from 'react'
import { trackSearch, trackStoreFilter } from '@/lib/analytics'
import { storeFilterDetail, type StoreQuery } from './store-query'

export function StoreInsights({ query, results }: { query: StoreQuery; results: number }) {
  const { search, page } = query
  const filterKey = JSON.stringify(storeFilterDetail(query))

  useEffect(() => {
    if (page === 1 && search) trackSearch(search, results)
  }, [search, page, results])

  useEffect(() => {
    const active: Record<string, string> = JSON.parse(filterKey)
    if (page === 1 && Object.keys(active).length > 0) trackStoreFilter(active, results)
  }, [filterKey, page, results])

  return null
}

'use server'

import { getPayload } from '@/lib/payload'

export interface SearchSuggestion {
  label: string
  href: string
}

const filterSuggestions: readonly SearchSuggestion[] = [
  { label: 'Black opal', href: '/store?stone=black-opal' },
  { label: 'White opal', href: '/store?stone=white-opal' },
  { label: 'Boulder opal', href: '/store?stone=boulder-opal' },
  { label: 'Crystal opal', href: '/store?stone=crystal-opal' },
  { label: 'Fire opal', href: '/store?stone=fire-opal' },
  { label: 'Matrix opal', href: '/store?stone=matrix-opal' },
  { label: 'Opal rings', href: '/store?category=opal-rings' },
  { label: 'Opal necklaces & pendants', href: '/store?category=opal-necklaces' },
  { label: 'Opal earrings', href: '/store?category=opal-earrings' },
  { label: 'Opal bracelets', href: '/store?category=opal-bracelets' },
  { label: 'Raw opals', href: '/store?category=raw-opals' },
]

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const cleanQuery = query.trim().slice(0, 80)
    if (!cleanQuery) return []

    const queryLower = cleanQuery.toLowerCase()
    const matchingFilters = filterSuggestions.filter((suggestion) =>
      suggestion.label.toLowerCase().startsWith(queryLower)
    )
    if (cleanQuery.length === 1) return matchingFilters.slice(0, 5)

    const payload = await getPayload()
    const results = await payload.find({
      collection: 'products',
      where: {
        and: [{ status: { equals: 'published' } }, { name: { contains: cleanQuery } }],
      },
      limit: 5,
      select: { name: true, slug: true },
    })

    const productSuggestions = results.docs.map((product) => ({
      label: product.name,
      href: `/store/${encodeURIComponent(product.slug)}`,
    }))
    const seen = new Set(productSuggestions.map((suggestion) => suggestion.href))

    return [
      ...productSuggestions,
      ...matchingFilters.filter((suggestion) => !seen.has(suggestion.href)),
    ].slice(0, 5)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return []
  }
}

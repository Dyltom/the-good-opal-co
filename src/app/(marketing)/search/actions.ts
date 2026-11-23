'use server'

import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { withSalePrice } from '@/lib/promotions'
import { productGalleryUrls } from '@/lib/product-gallery'
import { rankProductSuggestions, type SearchSuggestion } from './suggestions'

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
        and: [LISTED_PRODUCTS, { name: { contains: cleanQuery } }],
      },
      sort: ['-featured', '-createdAt'],
      limit: 40,
      depth: 1,
      select: { name: true, slug: true, price: true, stock: true, category: true, images: true },
    })

    const productSuggestions = rankProductSuggestions(
      results.docs.map((product) => ({
        name: product.name,
        slug: product.slug,
        price: withSalePrice(product).price,
        stock: product.stock ?? 0,
        category: product.category,
        image: productGalleryUrls(product.slug, product.name, product.images)[0],
      }))
    ).slice(0, 5)

    return [...productSuggestions, ...matchingFilters.slice(0, 2)]
  } catch (error) {
    console.error('Search suggestions error:', error)
    return []
  }
}

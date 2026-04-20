'use server'

import { getPayload } from '@/lib/payload'
import type { Product } from '@/types/payload-types'

export interface SearchResult {
  products: Product[]
  totalResults: number
  query: string
}

export async function searchProducts(
  query: string,
  page: number = 1,
  limit: number = 12
): Promise<SearchResult> {
  try {
    // Sanitize and validate input
    const cleanQuery = query.trim()
    if (!cleanQuery || cleanQuery.length < 2) {
      return {
        products: [],
        totalResults: 0,
        query: cleanQuery,
      }
    }

    const payload = await getPayload()

    // Search across multiple fields using Payload's text search
    const results = await payload.find({
      collection: 'products',
      where: {
        or: [
          {
            name: {
              contains: cleanQuery,
            },
          },
          {
            description: {
              contains: cleanQuery,
            },
          },
          {
            'details.value': {
              contains: cleanQuery,
            },
          },
          {
            'category.value.name': {
              contains: cleanQuery,
            },
          },
          {
            tags: {
              contains: cleanQuery,
            },
          },
        ],
        and: [
          {
            status: {
              equals: 'active',
            },
          },
          {
            stock: {
              greater_than: 0,
            },
          },
        ],
      },
      page,
      limit,
      depth: 2, // Include category and image data
      sort: '-featured,-createdAt', // Featured products first, then newest
    })

    return {
      products: results.docs as Product[],
      totalResults: results.totalDocs,
      query: cleanQuery,
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      products: [],
      totalResults: 0,
      query,
    }
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    if (!query.trim() || query.length < 2) {
      return []
    }

    const payload = await getPayload()

    // Get unique product names that match the query
    const results = await payload.find({
      collection: 'products',
      where: {
        name: {
          contains: query,
        },
        status: {
          equals: 'active',
        },
      },
      limit: 5,
      select: {
        name: true,
      },
    })

    // Also get categories that match
    const categories = await payload.find({
      collection: 'categories',
      where: {
        name: {
          contains: query,
        },
      },
      limit: 3,
      select: {
        name: true,
      },
    })

    const suggestions: string[] = []

    // Add product names
    results.docs.forEach(product => {
      const name = typeof product.name === 'string' ? product.name : ''
      if (name && !suggestions.includes(name)) {
        suggestions.push(name)
      }
    })

    // Add category names
    categories.docs.forEach(category => {
      const name = typeof category.name === 'string' ? category.name : ''
      if (name && !suggestions.includes(name)) {
        suggestions.push(name)
      }
    })

    return suggestions.slice(0, 5)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return []
  }
}
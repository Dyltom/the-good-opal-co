'use server'

import { getPayload } from '@/lib/payload'

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      return []
    }

    // For single character queries, only suggest stone types and categories
    if (cleanQuery.length === 1) {
      const stoneTypes = [
        'Black Opal', 'White Opal', 'Boulder Opal',
        'Crystal Opal', 'Fire Opal', 'Matrix Opal'
      ]
      const categories = [
        'Opal Rings', 'Opal Necklaces & Pendants', 'Opal Earrings',
        'Opal Bracelets', 'Raw Opals'
      ]

      const suggestions = [
        ...stoneTypes.filter(type => type.toLowerCase().startsWith(cleanQuery.toLowerCase())),
        ...categories.filter(cat => cat.toLowerCase().startsWith(cleanQuery.toLowerCase()))
      ]

      return suggestions.slice(0, 5)
    }

    const payload = await getPayload()

    // Get unique product names that match the query (for 2+ characters)
    const results = await payload.find({
      collection: 'products',
      where: {
        or: [
          {
            name: {
              contains: query,
            },
          },
          {
            category: {
              contains: query,
            },
          },
          {
            stoneType: {
              contains: query,
            },
          },
        ],
        and: [
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      limit: 8,
      select: {
        name: true,
        category: true,
        stoneType: true,
      },
    })

    const suggestions: string[] = []
    const queryLower = query.toLowerCase().trim()

    // Add exact product name matches (prioritize these)
    results.docs.forEach(product => {
      const name = typeof product.name === 'string' ? product.name : ''
      if (name && name.toLowerCase().includes(queryLower) && !suggestions.includes(name)) {
        suggestions.push(name)
      }
    })

    // Add unique stone types from actual products that match the query
    const matchingStoneTypes = new Set<string>()
    results.docs.forEach(product => {
      const stoneType = typeof product.stoneType === 'string' ? product.stoneType : ''
      if (stoneType && stoneType.toLowerCase().includes(queryLower)) {
        matchingStoneTypes.add(stoneType)
      }
    })

    // Add stone type suggestions from actual products
    Array.from(matchingStoneTypes).forEach(stoneType => {
      if (!suggestions.includes(stoneType) && suggestions.length < 5) {
        suggestions.push(stoneType)
      }
    })

    // Only add category suggestions if they closely match the query
    const categoryOptions = [
      'Opal Rings', 'Opal Necklaces & Pendants', 'Opal Earrings',
      'Opal Bracelets', 'Raw Opals', 'Custom Commissions'
    ]
    categoryOptions.forEach(category => {
      if (category.toLowerCase().startsWith(queryLower) &&
          !suggestions.includes(category) &&
          suggestions.length < 5) {
        suggestions.push(category)
      }
    })

    // If we don't have many suggestions, add some stone types that start with the query
    if (suggestions.length < 3) {
      const stoneTypes = [
        'Black Opal', 'White Opal', 'Boulder Opal',
        'Crystal Opal', 'Fire Opal', 'Matrix Opal'
      ]
      stoneTypes.forEach(stoneType => {
        if (stoneType.toLowerCase().startsWith(queryLower) &&
            !suggestions.includes(stoneType) &&
            suggestions.length < 5) {
          suggestions.push(stoneType)
        }
      })
    }

    return suggestions.slice(0, 5)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return []
  }
}

'use server'

import { getPayload } from '@/lib/payload'
import type { Product, Post } from '@/types/payload-types'

export interface SearchResult {
  products: Product[]
  posts: Post[]
  pages: Array<{
    title: string
    slug: string
    type: 'page'
    excerpt?: string
  }>
  totalResults: number
  totalProducts: number
  totalPosts: number
  query: string
}

export async function searchProducts(
  query: string,
  _page: number = 1,
  limit: number = 8
): Promise<SearchResult> {
  try {
    // Sanitize and validate input
    const cleanQuery = query.trim()
    if (!cleanQuery || cleanQuery.length < 2) {
      return {
        products: [],
        posts: [],
        pages: [],
        totalResults: 0,
        totalProducts: 0,
        totalPosts: 0,
        query: cleanQuery,
      }
    }

    console.log('Site-wide search for:', cleanQuery)
    const payload = await getPayload()

    // Search products
    const productResults = await payload.find({
      collection: 'products',
      where: {
        or: [
          { name: { contains: cleanQuery } },
          { category: { contains: cleanQuery } },
          { material: { contains: cleanQuery } },
          { stoneType: { contains: cleanQuery } },
          { stoneOrigin: { contains: cleanQuery } },
          { sku: { contains: cleanQuery } },
        ],
        and: [
          { status: { equals: 'published' } },
          { stock: { greater_than: 0 } },
        ],
      },
      limit: limit,
      depth: 2,
      sort: '-featured,-createdAt',
    })

    // Search blog posts (excluding content field due to JSONB type incompatibility)
    const postResults = await payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            or: [
              { title: { contains: cleanQuery } },
              { excerpt: { contains: cleanQuery } },
            ],
          },
          { status: { equals: 'published' } },
        ],
      },
      limit: 6,
      depth: 1,
      sort: '-publishedAt',
    })

    // Define static pages that can be searched
    const staticPages = [
      { title: 'About Us', slug: '/about', excerpt: 'Learn about The Good Opal Co and our passion for Australian opals' },
      { title: 'Contact', slug: '/contact', excerpt: 'Get in touch with our team for questions and custom orders' },
      { title: 'FAQ', slug: '/faq', excerpt: 'Frequently asked questions about opals, shipping, and orders' },
      { title: 'Courses', slug: '/courses', excerpt: 'Educational courses about opal identification and appreciation' },
      { title: 'Shipping Information', slug: '/shipping', excerpt: 'Delivery options and shipping policies for Australian and international orders' },
      { title: 'Returns Policy', slug: '/returns', excerpt: 'Return and exchange information for your purchases' },
      { title: 'Privacy Policy', slug: '/legal/privacy', excerpt: 'How we protect and use your personal information' },
      { title: 'Terms of Service', slug: '/legal/terms', excerpt: 'Terms and conditions for using our website and services' },
    ]

    // Filter pages that match the search query
    const matchingPages = staticPages.filter(page =>
      page.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      page.excerpt.toLowerCase().includes(cleanQuery.toLowerCase())
    ).map(page => ({
      ...page,
      type: 'page' as const,
    }))

    const totalResults = productResults.totalDocs + postResults.totalDocs + matchingPages.length

    console.log('Site search completed:', {
      products: productResults.totalDocs,
      posts: postResults.totalDocs,
      pages: matchingPages.length,
      total: totalResults
    })

    return {
      products: productResults.docs as Product[],
      posts: postResults.docs as Post[],
      pages: matchingPages,
      totalResults,
      totalProducts: productResults.totalDocs,
      totalPosts: postResults.totalDocs,
      query: cleanQuery,
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      products: [],
      posts: [],
      pages: [],
      totalResults: 0,
      totalProducts: 0,
      totalPosts: 0,
      query,
    }
  }
}

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
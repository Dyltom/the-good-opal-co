/**
 * Related Products Service
 * Implements various strategies to find related products
 * Following Strategy Pattern and Open/Closed Principle
 */

import { getPayload } from '@/lib/payload'
import type { Product } from '@/types/payload-types'

/**
 * Strategy interface for finding related products
 */
export interface RelatedProductStrategy {
  findRelated(product: Product, limit: number): Promise<Product[]>
}

/**
 * Find related products by category
 */
export class CategoryRelatedProductStrategy implements RelatedProductStrategy {
  async findRelated(product: Product, limit: number): Promise<Product[]> {
    if (!product.category?.value?.id) {
      return []
    }

    const payload = await getPayload()

    const results = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            'category.value': {
              equals: product.category.value.id
            }
          },
          {
            id: {
              not_equals: product.id
            }
          },
          {
            status: {
              equals: 'active'
            }
          },
          {
            stock: {
              greater_than: 0
            }
          }
        ]
      },
      limit,
      sort: '-featured,-createdAt',
      depth: 2
    })

    return results.docs as Product[]
  }
}

/**
 * Find related products by tags
 */
export class TagsRelatedProductStrategy implements RelatedProductStrategy {
  async findRelated(product: Product, limit: number): Promise<Product[]> {
    if (!product.tags || product.tags.length === 0) {
      return []
    }

    const payload = await getPayload()

    const results = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            tags: {
              in: product.tags
            }
          },
          {
            id: {
              not_equals: product.id
            }
          },
          {
            status: {
              equals: 'active'
            }
          },
          {
            stock: {
              greater_than: 0
            }
          }
        ]
      },
      limit,
      sort: '-featured,-createdAt',
      depth: 2
    })

    return results.docs as Product[]
  }
}

/**
 * Find related products by price range
 */
export class PriceRangeRelatedProductStrategy implements RelatedProductStrategy {
  private readonly rangePercentage = 0.3 // 30% range

  async findRelated(product: Product, limit: number): Promise<Product[]> {
    const minPrice = product.price * (1 - this.rangePercentage)
    const maxPrice = product.price * (1 + this.rangePercentage)

    const payload = await getPayload()

    const results = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            price: {
              greater_than_equal: minPrice
            }
          },
          {
            price: {
              less_than_equal: maxPrice
            }
          },
          {
            id: {
              not_equals: product.id
            }
          },
          {
            status: {
              equals: 'active'
            }
          },
          {
            stock: {
              greater_than: 0
            }
          }
        ]
      },
      limit,
      sort: '-featured,-createdAt',
      depth: 2
    })

    return results.docs as Product[]
  }
}

/**
 * Composite strategy that combines multiple strategies
 * Open/Closed Principle: Can add new strategies without modifying this class
 */
export class CompositeRelatedProductStrategy implements RelatedProductStrategy {
  constructor(private strategies: RelatedProductStrategy[]) {}

  async findRelated(product: Product, limit: number): Promise<Product[]> {
    const allResults: Product[] = []
    const seenIds = new Set<string>()

    // Try each strategy until we have enough products
    for (const strategy of this.strategies) {
      if (allResults.length >= limit) {
        break
      }

      const results = await strategy.findRelated(product, limit - allResults.length)

      for (const relatedProduct of results) {
        if (!seenIds.has(relatedProduct.id)) {
          seenIds.add(relatedProduct.id)
          allResults.push(relatedProduct)

          if (allResults.length >= limit) {
            break
          }
        }
      }
    }

    return allResults.slice(0, limit)
  }
}

/**
 * Main service for finding related products
 * Dependency Inversion: Depends on strategy interface, not concrete implementations
 */
export class RelatedProductService {
  private strategy: RelatedProductStrategy

  constructor(strategy?: RelatedProductStrategy) {
    // Default strategy uses category, then tags, then price range
    this.strategy = strategy || new CompositeRelatedProductStrategy([
      new CategoryRelatedProductStrategy(),
      new TagsRelatedProductStrategy(),
      new PriceRangeRelatedProductStrategy()
    ])
  }

  async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
    try {
      return await this.strategy.findRelated(product, limit)
    } catch (error) {
      console.error('Failed to fetch related products:', error)
      return []
    }
  }
}

/**
 * Singleton instance
 */
let relatedProductService: RelatedProductService | null = null

export function getRelatedProductService(): RelatedProductService {
  if (!relatedProductService) {
    relatedProductService = new RelatedProductService()
  }
  return relatedProductService
}
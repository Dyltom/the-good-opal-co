/**
 * Discount Repository
 * Repository Pattern: Abstracts data access
 * In production, this would connect to Payload CMS
 */

import type { Discount } from './types'

/**
 * Mock discount codes for demo
 * In production, these would be stored in Payload CMS
 */
const MOCK_DISCOUNTS: Discount[] = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    type: 'percentage',
    value: 10,
    active: true,
    minimumPurchase: 10000, // $100
    expiresAt: new Date('2026-12-31'),
    usageLimit: 1000,
    usageCount: 0
  },
  {
    code: 'SAVE20',
    description: '20% off for orders over $200',
    type: 'percentage',
    value: 20,
    maxDiscount: 10000, // Max $100 discount
    active: true,
    minimumPurchase: 20000, // $200
    expiresAt: new Date('2026-06-30'),
    usageLimit: 500,
    usageCount: 0
  },
  {
    code: 'OPAL50',
    description: '$50 off your order',
    type: 'fixed',
    value: 5000, // $50
    active: true,
    minimumPurchase: 15000, // $150
    usageLimit: 100,
    usageCount: 0
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on any order',
    type: 'shipping',
    value: 100, // 100% off shipping
    active: true,
    minimumPurchase: 5000, // $50
    usageLimit: undefined, // Unlimited
    usageCount: 0
  },
  {
    code: 'VIP2026',
    description: 'VIP customer discount',
    type: 'percentage',
    value: 25,
    active: true,
    minimumPurchase: 0,
    expiresAt: new Date('2026-12-31')
  }
]

export interface DiscountRepository {
  findByCode(code: string): Promise<Discount | null>
  incrementUsage(code: string): Promise<void>
}

/**
 * Mock implementation of discount repository
 */
export class MockDiscountRepository implements DiscountRepository {
  private discounts: Map<string, Discount>

  constructor() {
    this.discounts = new Map(
      MOCK_DISCOUNTS.map(discount => [discount.code.toUpperCase(), discount])
    )
  }

  async findByCode(code: string): Promise<Discount | null> {
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 100))

    const discount = this.discounts.get(code.toUpperCase())
    return discount || null
  }

  async incrementUsage(code: string): Promise<void> {
    const discount = this.discounts.get(code.toUpperCase())
    if (discount && discount.usageCount !== undefined) {
      discount.usageCount++
    }
  }
}

/**
 * Production implementation would connect to Payload CMS
 * Example implementation commented out:
 */
// export class PayloadDiscountRepository implements DiscountRepository {
//   async findByCode(code: string): Promise<Discount | null> {
//     const payload = await getPayload()
//     const results = await payload.find({
//       collection: 'discounts',
//       where: {
//         code: {
//           equals: code.toUpperCase()
//         }
//       },
//       limit: 1
//     })
//     return results.docs[0] || null
//   }
//
//   async incrementUsage(code: string): Promise<void> {
//     const payload = await getPayload()
//     const discount = await this.findByCode(code)
//     if (discount) {
//       await payload.update({
//         collection: 'discounts',
//         id: discount.id,
//         data: {
//           usageCount: (discount.usageCount || 0) + 1
//         }
//       })
//     }
//   }
// }

/**
 * Factory to get the appropriate repository
 */
export function createDiscountRepository(): DiscountRepository {
  // In production, check environment and return appropriate implementation
  return new MockDiscountRepository()
}
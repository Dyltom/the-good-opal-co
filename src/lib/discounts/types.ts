/**
 * Discount Types and Interfaces
 * Following Interface Segregation Principle - small, focused interfaces
 */

export type DiscountType = 'percentage' | 'fixed' | 'shipping'

export interface BaseDiscount {
  code: string
  description: string
  type: DiscountType
  active: boolean
  minimumPurchase?: number
  expiresAt?: Date
  usageLimit?: number
  usageCount?: number
}

export interface PercentageDiscount extends BaseDiscount {
  type: 'percentage'
  value: number // 0-100
  maxDiscount?: number // Maximum discount amount in cents
}

export interface FixedDiscount extends BaseDiscount {
  type: 'fixed'
  value: number // Amount in cents
}

export interface ShippingDiscount extends BaseDiscount {
  type: 'shipping'
  value: number // Percentage off shipping (0-100)
}

export type Discount = PercentageDiscount | FixedDiscount | ShippingDiscount

export interface DiscountApplication {
  code: string
  type: DiscountType
  amount: number // Amount saved in cents
  description: string
}

export interface DiscountValidationResult {
  valid: boolean
  discount?: Discount
  error?: string
}

export interface DiscountCalculationResult {
  discountAmount: number
  shippingDiscount: number
  finalSubtotal: number
  finalShipping: number
  finalTotal: number
  application?: DiscountApplication
}
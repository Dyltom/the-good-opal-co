/**
 * Discount Module Public API
 * Facade Pattern: Provides a simple interface to the complex discount system
 */

import { createDiscountValidator } from './validators'
import { DiscountService } from './calculators'
import { createDiscountRepository } from './repository'
import type {
  DiscountValidationResult,
  DiscountCalculationResult,
  CalculationContext,
  ValidationContext
} from './types'

export * from './types'

/**
 * Main discount facade that provides a simple API
 * Follows Dependency Inversion: Depends on interfaces, not concrete implementations
 */
export class DiscountManager {
  private validator = createDiscountValidator()
  private calculator = new DiscountService()
  private repository = createDiscountRepository()

  /**
   * Validates a discount code
   */
  async validateCode(
    code: string,
    context: ValidationContext
  ): Promise<DiscountValidationResult> {
    if (!code) {
      return {
        valid: false,
        error: 'Please enter a discount code'
      }
    }

    const discount = await this.repository.findByCode(code)

    if (!discount) {
      return {
        valid: false,
        error: 'Invalid discount code'
      }
    }

    return this.validator.validate(discount, context)
  }

  /**
   * Applies a discount code and calculates the new totals
   */
  async applyDiscount(
    code: string,
    context: CalculationContext & ValidationContext
  ): Promise<DiscountCalculationResult & { error?: string }> {
    const validationResult = await this.validateCode(code, context)

    if (!validationResult.valid || !validationResult.discount) {
      return {
        discountAmount: 0,
        shippingDiscount: 0,
        finalSubtotal: context.subtotal,
        finalShipping: context.shipping,
        finalTotal: context.subtotal + context.shipping + context.tax,
        error: validationResult.error
      }
    }

    const calculationResult = this.calculator.calculateDiscount(
      validationResult.discount,
      context
    )

    // Increment usage count (in real app, do this after successful payment)
    await this.repository.incrementUsage(code)

    return calculationResult
  }

  /**
   * Gets discount information without applying it
   */
  async getDiscountInfo(code: string): Promise<{
    valid: boolean
    description?: string
    error?: string
  }> {
    const discount = await this.repository.findByCode(code)

    if (!discount) {
      return {
        valid: false,
        error: 'Invalid discount code'
      }
    }

    // Basic validation without context
    if (!discount.active) {
      return {
        valid: false,
        error: 'This discount code is no longer active'
      }
    }

    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return {
        valid: false,
        error: 'This discount code has expired'
      }
    }

    return {
      valid: true,
      description: discount.description
    }
  }
}

/**
 * Singleton instance for the application
 */
let discountManager: DiscountManager | null = null

export function getDiscountManager(): DiscountManager {
  if (!discountManager) {
    discountManager = new DiscountManager()
  }
  return discountManager
}
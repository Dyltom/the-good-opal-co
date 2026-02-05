/**
 * Discount Validators
 * Single Responsibility: Each validator handles one aspect of validation
 */

import type { Discount, DiscountValidationResult } from './types'

export interface DiscountValidator {
  validate(discount: Discount, context: ValidationContext): DiscountValidationResult
}

export interface ValidationContext {
  subtotal: number
  customerId?: string
  previousUsage?: string[]
}

/**
 * Validates if discount is currently active
 */
export class ActiveDiscountValidator implements DiscountValidator {
  validate(discount: Discount): DiscountValidationResult {
    if (!discount.active) {
      return {
        valid: false,
        error: 'This discount code is no longer active'
      }
    }
    return { valid: true, discount }
  }
}

/**
 * Validates discount expiry date
 */
export class ExpiryDateValidator implements DiscountValidator {
  validate(discount: Discount): DiscountValidationResult {
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return {
        valid: false,
        error: 'This discount code has expired'
      }
    }
    return { valid: true, discount }
  }
}

/**
 * Validates minimum purchase requirement
 */
export class MinimumPurchaseValidator implements DiscountValidator {
  validate(discount: Discount, context: ValidationContext): DiscountValidationResult {
    if (discount.minimumPurchase && context.subtotal < discount.minimumPurchase) {
      const minimum = (discount.minimumPurchase / 100).toFixed(2)
      return {
        valid: false,
        error: `Minimum purchase of $${minimum} required for this discount`
      }
    }
    return { valid: true, discount }
  }
}

/**
 * Validates usage limits
 */
export class UsageLimitValidator implements DiscountValidator {
  validate(discount: Discount): DiscountValidationResult {
    if (discount.usageLimit && discount.usageCount && discount.usageCount >= discount.usageLimit) {
      return {
        valid: false,
        error: 'This discount code has reached its usage limit'
      }
    }
    return { valid: true, discount }
  }
}

/**
 * Composite validator that runs all validators
 * Open/Closed Principle: Can add new validators without modifying this class
 */
export class CompositeDiscountValidator implements DiscountValidator {
  constructor(private validators: DiscountValidator[]) {}

  validate(discount: Discount, context: ValidationContext): DiscountValidationResult {
    for (const validator of this.validators) {
      const result = validator.validate(discount, context)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true, discount }
  }
}

/**
 * Factory function to create standard validator
 */
export function createDiscountValidator(): DiscountValidator {
  return new CompositeDiscountValidator([
    new ActiveDiscountValidator(),
    new ExpiryDateValidator(),
    new MinimumPurchaseValidator(),
    new UsageLimitValidator()
  ])
}
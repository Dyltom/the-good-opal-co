/**
 * Discount Calculators
 * Strategy Pattern: Different calculation strategies for different discount types
 * Liskov Substitution: All calculators are interchangeable
 */

import type {
  Discount,
  PercentageDiscount,
  FixedDiscount,
  ShippingDiscount,
  DiscountCalculationResult,
  DiscountApplication
} from './types'

export interface CalculationContext {
  subtotal: number
  shipping: number
  tax: number
}

export interface DiscountCalculator {
  calculate(discount: Discount, context: CalculationContext): DiscountCalculationResult
}

/**
 * Calculates percentage-based discounts
 */
export class PercentageDiscountCalculator implements DiscountCalculator {
  calculate(discount: PercentageDiscount, context: CalculationContext): DiscountCalculationResult {
    let discountAmount = Math.floor((context.subtotal * discount.value) / 100)

    // Apply maximum discount cap if specified
    if (discount.maxDiscount) {
      discountAmount = Math.min(discountAmount, discount.maxDiscount)
    }

    const finalSubtotal = context.subtotal - discountAmount

    return {
      discountAmount,
      shippingDiscount: 0,
      finalSubtotal,
      finalShipping: context.shipping,
      finalTotal: finalSubtotal + context.shipping + context.tax,
      application: {
        code: discount.code,
        type: 'percentage',
        amount: discountAmount,
        description: `${discount.value}% off`
      }
    }
  }
}

/**
 * Calculates fixed amount discounts
 */
export class FixedDiscountCalculator implements DiscountCalculator {
  calculate(discount: FixedDiscount, context: CalculationContext): DiscountCalculationResult {
    // Cannot discount more than the subtotal
    const discountAmount = Math.min(discount.value, context.subtotal)
    const finalSubtotal = context.subtotal - discountAmount

    return {
      discountAmount,
      shippingDiscount: 0,
      finalSubtotal,
      finalShipping: context.shipping,
      finalTotal: finalSubtotal + context.shipping + context.tax,
      application: {
        code: discount.code,
        type: 'fixed',
        amount: discountAmount,
        description: `$${(discountAmount / 100).toFixed(2)} off`
      }
    }
  }
}

/**
 * Calculates shipping discounts
 */
export class ShippingDiscountCalculator implements DiscountCalculator {
  calculate(discount: ShippingDiscount, context: CalculationContext): DiscountCalculationResult {
    const shippingDiscount = Math.floor((context.shipping * discount.value) / 100)
    const finalShipping = context.shipping - shippingDiscount

    return {
      discountAmount: 0,
      shippingDiscount,
      finalSubtotal: context.subtotal,
      finalShipping,
      finalTotal: context.subtotal + finalShipping + context.tax,
      application: {
        code: discount.code,
        type: 'shipping',
        amount: shippingDiscount,
        description: discount.value === 100 ? 'Free shipping' : `${discount.value}% off shipping`
      }
    }
  }
}

/**
 * Factory to get the appropriate calculator
 * Dependency Inversion: Depend on abstractions (DiscountCalculator interface)
 */
export class DiscountCalculatorFactory {
  private calculators: Map<string, DiscountCalculator>

  constructor() {
    this.calculators = new Map([
      ['percentage', new PercentageDiscountCalculator()],
      ['fixed', new FixedDiscountCalculator()],
      ['shipping', new ShippingDiscountCalculator()]
    ])
  }

  getCalculator(type: string): DiscountCalculator {
    const calculator = this.calculators.get(type)
    if (!calculator) {
      throw new Error(`Unknown discount type: ${type}`)
    }
    return calculator
  }
}

/**
 * Main discount service that orchestrates validation and calculation
 */
export class DiscountService {
  constructor(
    private calculatorFactory = new DiscountCalculatorFactory()
  ) {}

  calculateDiscount(
    discount: Discount,
    context: CalculationContext
  ): DiscountCalculationResult {
    const calculator = this.calculatorFactory.getCalculator(discount.type)
    return calculator.calculate(discount, context)
  }
}
import { calculateShipping } from '@/lib/constants/shipping'

interface CheckoutLineItem {
  price: number
  quantity: number
}

export interface CheckoutPricing {
  subtotal: number
  shipping: number
  total: number
  subtotalCents: number
  shippingCents: number
  totalCents: number
  freeShippingRemaining: number
}

export interface DiscountPricingContext {
  subtotal: number
  shipping: number
  tax: number
}

interface StripeCheckoutAmountsInput {
  shippingCents: number
  discountAmountCents: number
  shippingDiscountCents: number
}

export interface StripeCheckoutAmounts {
  couponAmountOffCents?: number
  adjustedShippingCents: number
}

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function centsToDollars(amount: number): number {
  return amount / 100
}

export function calculateCheckoutSubtotal(items: CheckoutLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateCheckoutPricing(subtotal: number): CheckoutPricing {
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping
  const freeShippingRemaining = Math.max(0, 500 - subtotal)

  return {
    subtotal,
    shipping,
    total,
    subtotalCents: dollarsToCents(subtotal),
    shippingCents: dollarsToCents(shipping),
    totalCents: dollarsToCents(total),
    freeShippingRemaining,
  }
}

export function toDiscountContext(pricing: CheckoutPricing): DiscountPricingContext {
  return {
    subtotal: pricing.subtotalCents,
    shipping: pricing.shippingCents,
    tax: 0,
  }
}

export function calculateStripeCheckoutAmounts({
  shippingCents,
  discountAmountCents,
  shippingDiscountCents,
}: StripeCheckoutAmountsInput): StripeCheckoutAmounts {
  return {
    couponAmountOffCents: discountAmountCents > 0 ? discountAmountCents : undefined,
    adjustedShippingCents: Math.max(0, shippingCents - shippingDiscountCents),
  }
}

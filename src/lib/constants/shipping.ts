/**
 * Shipping Configuration and Promises
 *
 * Centralized shipping promises, rates, and messages to ensure consistency
 * across the entire site and prevent conflicting information.
 */

export const SHIPPING_CONFIG = {
  // Free shipping threshold
  FREE_SHIPPING_THRESHOLD: 500, // AUD

  // Standard shipping rates
  RATES: {
    AUSTRALIA: {
      EXPRESS: 15,
      STANDARD: 8,
      FREE_THRESHOLD: 500
    },
    INTERNATIONAL: {
      EXPRESS: 25,
      STANDARD: 15,
      FREE_THRESHOLD: 500
    }
  }
} as const

export const SHIPPING_COUNTRIES = {
  AUSTRALIA: ['AU'],
  INTERNATIONAL: ['NZ', 'US', 'GB', 'CA', 'SG', 'HK', 'JP'],
} as const

export const RETURN_WINDOW_DAYS = 30

export const SHIPPING_MESSAGES = {
  // Free shipping banner message
  FREE_SHIPPING_BANNER: `Free shipping on orders over $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}`,

  // Cart page messages
  FREE_SHIPPING_ACHIEVED: 'Your order qualifies for free shipping!',
  FREE_SHIPPING_PROGRESS: (remaining: number) =>
    `Add $${remaining.toFixed(2)} more for free shipping`,

  // Product page messages
  FREE_SHIPPING_ELIGIBLE: `Free shipping (orders over $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD})`,
  EXPRESS_SHIPPING_INFO: 'Tracked delivery to available destinations',

  // Checkout messages
  SHIPPING_INSURANCE: 'Tracking provided after dispatch',
  GIFT_PACKAGING: 'Packed carefully for delivery',

  // Feature descriptions (for consistency)
  FEATURE_DESCRIPTION: 'Tracked delivery to available destinations with careful packaging'
} as const

export interface FreeShippingProgress {
  threshold: number
  remaining: number
  percent: number
  qualifies: boolean
  message: string
}

/**
 * Calculate shipping cost based on cart total and destination
 */
export function calculateShipping(
  cartTotal: number,
  destination: 'AUSTRALIA' | 'INTERNATIONAL' = 'AUSTRALIA',
  expressShipping: boolean = true
): number {
  // Free shipping if above threshold
  if (cartTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  // Return shipping cost based on destination and speed
  const rates = SHIPPING_CONFIG.RATES[destination]
  return expressShipping ? rates.EXPRESS : rates.STANDARD
}

/**
 * Get shipping message based on cart total
 */
export function getShippingMessage(cartTotal: number): string {
  if (cartTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return SHIPPING_MESSAGES.FREE_SHIPPING_ACHIEVED
  }

  const remaining = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cartTotal
  return SHIPPING_MESSAGES.FREE_SHIPPING_PROGRESS(remaining)
}

export function getFreeShippingProgress(cartTotal: number): FreeShippingProgress {
  const threshold = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
  const subtotal = Math.max(0, cartTotal)
  const remaining = Math.max(0, threshold - subtotal)
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100))

  return {
    threshold,
    remaining,
    percent,
    qualifies: remaining === 0,
    message: getShippingMessage(subtotal),
  }
}

export const DELIVERY_BUSINESS_DAYS = {
  DISPATCH: { min: 0, max: 2 },
  AUSTRALIA: { min: 1, max: 7 },
  INTERNATIONAL: { min: 3, max: 10 },
} as const

const { DISPATCH, AUSTRALIA, INTERNATIONAL } = DELIVERY_BUSINESS_DAYS
export const DELIVERY_ESTIMATE = `We aim to dispatch in-stock pieces within ${DISPATCH.max} business days of payment. Delivery then usually takes ${AUSTRALIA.min} to ${AUSTRALIA.max} business days within Australia and ${INTERNATIONAL.min} to ${INTERNATIONAL.max} business days to international destinations.`

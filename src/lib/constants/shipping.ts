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
  },

  // Delivery timeframes
  DELIVERY_TIMES: {
    AUSTRALIA: {
      EXPRESS: '1-2 business days',
      STANDARD: '3-5 business days'
    },
    INTERNATIONAL: {
      EXPRESS: '3-7 business days',
      STANDARD: '7-14 business days'
    }
  }
} as const

export const SHIPPING_MESSAGES = {
  // Free shipping banner message
  FREE_SHIPPING_BANNER: `Free express shipping on orders over $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}`,

  // Cart page messages
  FREE_SHIPPING_ACHIEVED: 'Your order qualifies for free express shipping! 🎉',
  FREE_SHIPPING_PROGRESS: (remaining: number) =>
    `Add $${remaining.toFixed(2)} more for free express shipping`,

  // Product page messages
  FREE_SHIPPING_ELIGIBLE: `Free express shipping (orders over $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD})`,
  EXPRESS_SHIPPING_INFO: 'Fully insured express shipping worldwide',

  // Checkout messages
  SHIPPING_INSURANCE: 'All orders fully insured during transit',
  GIFT_PACKAGING: 'Elegant gift packaging included',

  // Feature descriptions (for consistency)
  FEATURE_DESCRIPTION: 'Fully insured express shipping worldwide with elegant gift packaging'
} as const

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

/**
 * Get delivery timeframe message
 */
export function getDeliveryTime(
  destination: 'AUSTRALIA' | 'INTERNATIONAL' = 'AUSTRALIA',
  expressShipping: boolean = true
): string {
  const times = SHIPPING_CONFIG.DELIVERY_TIMES[destination]
  return expressShipping ? times.EXPRESS : times.STANDARD
}
import { calculateShipping, SHIPPING_CONFIG } from '@/lib/constants/shipping'

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

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function centsToDollars(amount: number): number {
  return amount / 100
}

export function gstIncluded(total: number): number {
  return centsToDollars(Math.round(dollarsToCents(total) / 11))
}

export function calculateCheckoutSubtotal(items: CheckoutLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateCheckoutPricing(
  subtotal: number,
  destination: 'AUSTRALIA' | 'INTERNATIONAL' = 'AUSTRALIA'
): CheckoutPricing {
  const shipping = calculateShipping(subtotal, destination)
  const total = subtotal + shipping
  const freeShippingRemaining = Math.max(0, SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal)

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

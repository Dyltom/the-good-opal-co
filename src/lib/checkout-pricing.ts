import { calculateShipping, SHIPPING_CONFIG } from '@/lib/constants/shipping'

interface CheckoutLineItem {
  price: number
  quantity: number
  deposit?: boolean
}

export interface CheckoutPricing {
  subtotal: number
  shippedSubtotal: number
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

function lineSubtotal(items: CheckoutLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateCheckoutPricing(
  items: CheckoutLineItem[],
  destination: 'AUSTRALIA' | 'INTERNATIONAL' = 'AUSTRALIA'
): CheckoutPricing {
  const subtotal = lineSubtotal(items)
  const shippedSubtotal = lineSubtotal(items.filter((item) => !item.deposit))
  const shipping = shippedSubtotal > 0 ? calculateShipping(shippedSubtotal, destination) : 0
  const total = subtotal + shipping
  const freeShippingRemaining =
    shippedSubtotal > 0 ? Math.max(0, SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - shippedSubtotal) : 0

  return {
    subtotal,
    shippedSubtotal,
    shipping,
    total,
    subtotalCents: dollarsToCents(subtotal),
    shippingCents: dollarsToCents(shipping),
    totalCents: dollarsToCents(total),
    freeShippingRemaining,
  }
}

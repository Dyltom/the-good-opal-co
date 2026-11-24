import {
  cheapestShippingOption,
  FREE_SHIPPING_THRESHOLD,
  shippingOptions,
  type ShippingCountry,
  type ShippingOption,
} from '@/lib/constants/shipping'

interface CheckoutLineItem {
  price: number
  quantity: number
  deposit?: boolean
}

export interface CheckoutPricing {
  subtotal: number
  shippedSubtotal: number
  shippingOptions: ShippingOption[]
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

const NO_SHIPPING: ShippingOption = { label: 'No shipping on deposits', cents: 0, days: { min: 0, max: 0 } }

export function calculateCheckoutPricing(
  items: CheckoutLineItem[],
  country: ShippingCountry = 'AU'
): CheckoutPricing {
  const subtotal = lineSubtotal(items)
  const shippedSubtotal = lineSubtotal(items.filter((item) => !item.deposit))
  const ships = shippedSubtotal > 0
  const shippingCents = ships ? cheapestShippingOption(country, shippedSubtotal).cents : 0
  const subtotalCents = dollarsToCents(subtotal)
  const totalCents = subtotalCents + shippingCents

  return {
    subtotal,
    shippedSubtotal,
    shippingOptions: ships ? shippingOptions(country, shippedSubtotal) : [NO_SHIPPING],
    shipping: centsToDollars(shippingCents),
    total: centsToDollars(totalCents),
    subtotalCents,
    shippingCents,
    totalCents,
    freeShippingRemaining: ships ? Math.max(0, FREE_SHIPPING_THRESHOLD - shippedSubtotal) : 0,
  }
}

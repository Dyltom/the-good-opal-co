export const FREE_SHIPPING_THRESHOLD = 500

export const RETURN_WINDOW_DAYS = 30

export const SHIPPING_COUNTRIES = ['AU', 'NZ', 'SG', 'HK', 'JP', 'US', 'CA', 'GB'] as const

export type ShippingCountry = (typeof SHIPPING_COUNTRIES)[number]

export function isShippingCountry(value: unknown): value is ShippingCountry {
  return SHIPPING_COUNTRIES.some((country) => country === value)
}

export const SHIPPING_COUNTRY_NAMES: Record<ShippingCountry, string> = {
  AU: 'Australia',
  NZ: 'New Zealand',
  SG: 'Singapore',
  HK: 'Hong Kong',
  JP: 'Japan',
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
}

export interface BusinessDays {
  min: number
  max: number
}

export const DISPATCH_BUSINESS_DAYS: BusinessDays = { min: 0, max: 2 }

export interface ShippingOption {
  label: string
  cents: number
  days: BusinessDays
}

const PARCEL_POST_DAYS = { min: 2, max: 6 }
const EXPRESS_POST_DAYS = { min: 1, max: 3 }
const INTERNATIONAL_STANDARD_DAYS = { min: 5, max: 10 }
const INTERNATIONAL_EXPRESS_DAYS = { min: 3, max: 6 }

function international(standardCents: number, expressCents: number): [ShippingOption, ShippingOption] {
  return [
    { label: 'International Standard', cents: standardCents, days: INTERNATIONAL_STANDARD_DAYS },
    { label: 'International Express', cents: expressCents, days: INTERNATIONAL_EXPRESS_DAYS },
  ]
}

const ASIA_PACIFIC = international(2060, 3760)
const NORTH_AMERICA = international(2305, 4005)

const AUSTRALIA_POST: Record<ShippingCountry, [standard: ShippingOption, express: ShippingOption]> = {
  AU: [
    { label: 'Parcel Post', cents: 1055, days: PARCEL_POST_DAYS },
    { label: 'Express Post', cents: 1355, days: EXPRESS_POST_DAYS },
  ],
  NZ: international(1790, 3490),
  SG: ASIA_PACIFIC,
  HK: ASIA_PACIFIC,
  JP: ASIA_PACIFIC,
  US: NORTH_AMERICA,
  CA: NORTH_AMERICA,
  GB: international(2840, 4540),
}

export function publishedShippingOptions(country: ShippingCountry): ShippingOption[] {
  return [...AUSTRALIA_POST[country]]
}

export function shippingOptions(country: ShippingCountry, subtotal: number): ShippingOption[] {
  const [standard, express] = AUSTRALIA_POST[country]
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    const free = country === 'AU' ? express : standard
    return [{ ...free, label: `Free ${free.label}`, cents: 0 }]
  }
  return [standard, express]
}

export function cheapestShippingOption(country: ShippingCountry, subtotal: number): ShippingOption {
  const [cheapest] = shippingOptions(country, subtotal)
  if (!cheapest) throw new Error(`No shipping options for ${country}`)
  return cheapest
}

export interface FreeShippingProgress {
  threshold: number
  remaining: number
  percent: number
  qualifies: boolean
  message: string
}

export function getShippingMessage(cartTotal: number): string {
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) return 'Your order qualifies for free shipping!'
  return `Add $${(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more for free shipping`
}

export function getFreeShippingProgress(cartTotal: number): FreeShippingProgress {
  const subtotal = Math.max(0, cartTotal)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return {
    threshold: FREE_SHIPPING_THRESHOLD,
    remaining,
    percent,
    qualifies: remaining === 0,
    message: getShippingMessage(subtotal),
  }
}

export const DELIVERY_ESTIMATE = `We aim to dispatch in-stock pieces within ${DISPATCH_BUSINESS_DAYS.max} business days of payment. Australia Post then usually delivers in ${PARCEL_POST_DAYS.min} to ${PARCEL_POST_DAYS.max} business days by Parcel Post or ${EXPRESS_POST_DAYS.min} to ${EXPRESS_POST_DAYS.max} by Express Post within Australia, and ${INTERNATIONAL_STANDARD_DAYS.min} to ${INTERNATIONAL_STANDARD_DAYS.max} business days by International Standard or ${INTERNATIONAL_EXPRESS_DAYS.min} to ${INTERNATIONAL_EXPRESS_DAYS.max} by International Express overseas.`

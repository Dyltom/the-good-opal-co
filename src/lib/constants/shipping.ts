export const RETURN_WINDOW_DAYS = 30

export const SHIPPING_COUNTRIES = ['AU', 'NZ', 'SG', 'US'] as const

export type ShippingCountry = (typeof SHIPPING_COUNTRIES)[number]

export function isShippingCountry(value: unknown): value is ShippingCountry {
  return SHIPPING_COUNTRIES.some((country) => country === value)
}

export const SHIPPING_COUNTRY_NAMES: Record<ShippingCountry, string> = {
  AU: 'Australia',
  NZ: 'New Zealand',
  SG: 'Singapore',
  US: 'United States',
}

export function shippingCountryList(): string {
  const names = SHIPPING_COUNTRIES.map((country) => SHIPPING_COUNTRY_NAMES[country])
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

export const LOOSE_STONE_CATEGORY = 'raw-opals'

export const LOOSE_STONE_SINGAPORE_MESSAGE =
  'Singapore needs an import permit for loose opals, so we can only send jewellery there. Remove the loose opals from your bag or choose another country.'

export function shippingRestriction(
  country: ShippingCountry,
  items: ReadonlyArray<{ looseStone?: boolean | undefined }>
): string | null {
  if (country === 'SG' && items.some((item) => item.looseStone)) return LOOSE_STONE_SINGAPORE_MESSAGE
  return null
}

export function shippingCountriesFor(category: string | null | undefined): ShippingCountry[] {
  const looseStone = category === LOOSE_STONE_CATEGORY
  return SHIPPING_COUNTRIES.filter((country) => !shippingRestriction(country, [{ looseStone }]))
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

const AUSTRALIA_POST: Record<ShippingCountry, [standard: ShippingOption, express: ShippingOption]> = {
  AU: [
    { label: 'Parcel Post', cents: 1020, days: PARCEL_POST_DAYS },
    { label: 'Express Post', cents: 1320, days: EXPRESS_POST_DAYS },
  ],
  NZ: international(1790, 3490),
  SG: international(2060, 3760),
  US: international(2305, 4005),
}

export const POSTAGE = ['standard', 'express'] as const

export type Postage = (typeof POSTAGE)[number]

export function publishedShippingOptions(country: ShippingCountry): ShippingOption[] {
  return [...AUSTRALIA_POST[country]]
}

export const EXTRA_COVER_INCLUDED = 100
export const EXTRA_COVER_MAX = 5000
export const EXTRA_COVER_CENTS_PER_100 = 250
export const SIGNATURE_ON_DELIVERY_CENTS = 295

export function extraCoverCents(country: ShippingCountry, value: number): number {
  const coveredCents = Math.min(Math.round(value * 100), EXTRA_COVER_MAX * 100)
  if (country !== 'AU' || coveredCents <= EXTRA_COVER_INCLUDED * 100) return 0
  const cover = Math.ceil((coveredCents - EXTRA_COVER_INCLUDED * 100) / 10000) * EXTRA_COVER_CENTS_PER_100
  return cover + SIGNATURE_ON_DELIVERY_CENTS
}

export function shippingOptions(country: ShippingCountry, subtotal: number): ShippingOption[] {
  const services = AUSTRALIA_POST[country]
  const coverCents = extraCoverCents(country, subtotal)
  if (coverCents === 0) return [...services]
  const covered = Math.ceil(Math.min(subtotal, EXTRA_COVER_MAX)).toLocaleString('en-AU')
  return services.map((service) => ({
    label: `${service.label} with Extra Cover for $${covered} and signature`,
    cents: service.cents + coverCents,
    days: service.days,
  }))
}

export function cheapestShippingOption(country: ShippingCountry, subtotal: number): ShippingOption {
  const [cheapest] = shippingOptions(country, subtotal)
  if (!cheapest) throw new Error(`No shipping options for ${country}`)
  return cheapest
}

export const DELIVERY_ESTIMATE = `We aim to dispatch in-stock pieces within ${DISPATCH_BUSINESS_DAYS.max} business days of payment. Australia Post then usually delivers in ${PARCEL_POST_DAYS.min} to ${PARCEL_POST_DAYS.max} business days by Parcel Post or ${EXPRESS_POST_DAYS.min} to ${EXPRESS_POST_DAYS.max} by Express Post within Australia, and ${INTERNATIONAL_STANDARD_DAYS.min} to ${INTERNATIONAL_STANDARD_DAYS.max} business days by International Standard or ${INTERNATIONAL_EXPRESS_DAYS.min} to ${INTERNATIONAL_EXPRESS_DAYS.max} by International Express overseas.`

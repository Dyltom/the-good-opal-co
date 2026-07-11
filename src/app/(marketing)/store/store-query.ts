export const PRODUCTS_PER_PAGE = 24

export const STORE_SORTS = ['featured', 'newest', 'price-low', 'price-high'] as const
export const STORE_PRICE_RANGES = ['under-250', '250-500', '500-1000', '1000-plus'] as const
export const STORE_CATEGORIES = [
  ['opal-rings', 'Rings'],
  ['opal-necklaces', 'Necklaces'],
  ['opal-earrings', 'Earrings'],
  ['opal-bracelets', 'Bracelets'],
  ['raw-opals', 'Loose opals'],
  ['custom-commissions', 'Custom commissions'],
] as const
export const STORE_STONES = [
  ['black-opal', 'Black opal'],
  ['white-opal', 'White opal'],
  ['boulder-opal', 'Boulder opal'],
  ['crystal-opal', 'Crystal opal'],
  ['fire-opal', 'Fire opal'],
  ['matrix-opal', 'Matrix opal'],
  ['opal-doublet', 'Opal doublet'],
] as const
export const STORE_ORIGINS = [
  ['lightning-ridge', 'Lightning Ridge, NSW'],
  ['coober-pedy', 'Coober Pedy, SA'],
  ['andamooka', 'Andamooka, SA'],
  ['mintabie', 'Mintabie, SA'],
  ['queensland', 'Queensland'],
  ['other-australian', 'Other Australian'],
] as const
export const STORE_MATERIALS = [
  ['sterling-silver', 'Sterling silver'],
  ['14k-gold', '14K gold'],
  ['18k-gold', '18K gold'],
  ['white-gold', 'White gold'],
  ['rose-gold', 'Rose gold'],
  ['platinum', 'Platinum'],
  ['none', 'Loose stone'],
] as const

export type StoreSort = (typeof STORE_SORTS)[number]
export type StorePriceRange = (typeof STORE_PRICE_RANGES)[number]

export interface StoreQuery {
  search: string
  category?: string
  stone?: string
  origin?: string
  material?: string
  price?: StorePriceRange
  availability: 'available' | 'all'
  sort: StoreSort
  page: number
}

export type StoreSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function isOneOf<T extends string>(value: string, values: readonly T[]): value is T {
  return values.includes(value as T)
}

function allowedValue(
  value: string,
  options: readonly (readonly [string, string])[]
): string | undefined {
  return options.some(([option]) => option === value) ? value : undefined
}

export function parseStoreQuery(params: StoreSearchParams): StoreQuery {
  const rawPage = Number(firstValue(params.page))
  const rawSort = firstValue(params.sort)
  const rawPrice = firstValue(params.price)

  return {
    search: firstValue(params.search).trim().slice(0, 80),
    category: allowedValue(firstValue(params.category), STORE_CATEGORIES),
    stone: allowedValue(firstValue(params.stone), STORE_STONES),
    origin: allowedValue(firstValue(params.origin), STORE_ORIGINS),
    material: allowedValue(firstValue(params.material), STORE_MATERIALS),
    price: isOneOf(rawPrice, STORE_PRICE_RANGES) ? rawPrice : undefined,
    availability: firstValue(params.availability) === 'all' ? 'all' : 'available',
    sort: isOneOf(rawSort, STORE_SORTS) ? rawSort : 'featured',
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  }
}

export function storeQueryParams(query: StoreQuery, page = query.page): URLSearchParams {
  const params = new URLSearchParams()

  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.stone) params.set('stone', query.stone)
  if (query.origin) params.set('origin', query.origin)
  if (query.material) params.set('material', query.material)
  if (query.price) params.set('price', query.price)
  if (query.availability === 'all') params.set('availability', 'all')
  if (query.sort !== 'featured') params.set('sort', query.sort)
  if (page > 1) params.set('page', String(page))

  return params
}

export function storeUrl(query: StoreQuery, page = query.page): string {
  const params = storeQueryParams(query, page)
  const search = params.toString()
  return search ? `/store?${search}` : '/store'
}

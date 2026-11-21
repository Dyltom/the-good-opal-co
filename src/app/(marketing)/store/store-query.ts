import type { Metadata } from 'next'
export const PRODUCTS_PER_PAGE = 24

export const STORE_SORTS = ['featured', 'newest', 'price-low', 'price-high', 'carat-high'] as const
export const STORE_SORT_LABELS: Record<StoreSort, string> = {
  featured: 'Featured',
  newest: 'Newest',
  'price-low': 'Price: low to high',
  'price-high': 'Price: high to low',
  'carat-high': 'Carat: high to low',
}
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

type Range = readonly [value: string, label: string, min: number, max: number]

export const STORE_PRICE_PRESETS: readonly { priceMin?: number; priceMax?: number }[] = [
  { priceMax: 250 },
  { priceMin: 250, priceMax: 500 },
  { priceMin: 500, priceMax: 1000 },
  { priceMin: 1000 },
]
export const STORE_CARAT_RANGES = [
  ['under-1', 'Under 1 ct', 0, 1],
  ['1-3', '1 to 3 ct', 1, 3],
  ['3-6', '3 to 6 ct', 3, 6],
  ['6-plus', '6 ct and over', 6, Number.POSITIVE_INFINITY],
] as const satisfies readonly Range[]

export const STORE_FACETS = ['category', 'stone', 'origin', 'carat'] as const
export type StoreFacet = (typeof STORE_FACETS)[number]

export const STORE_FACET_OPTIONS: Record<StoreFacet, readonly (readonly [string, string, ...unknown[]])[]> = {
  category: STORE_CATEGORIES,
  stone: STORE_STONES,
  origin: STORE_ORIGINS,
  carat: STORE_CARAT_RANGES,
}

export const STORE_FACET_LABELS: Record<StoreFacet, string> = {
  category: 'Piece',
  stone: 'Stone',
  origin: 'Origin',
  carat: 'Carat weight',
}

const STORE_LABELS = new Map<string, string>([...STORE_CATEGORIES, ...STORE_STONES, ...STORE_ORIGINS, ...STORE_MATERIALS])

export function storeLabel(value: string): string {
  const label = STORE_LABELS.get(value) ?? value.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function facetOptionLabel(facet: StoreFacet, value: string): string {
  return STORE_FACET_OPTIONS[facet].find(([option]) => option === value)?.[1] ?? value
}

export type StoreSort = (typeof STORE_SORTS)[number]

function rangeOf(ranges: readonly Range[], value: number): string | undefined {
  return ranges.find(([, , min, max]) => value >= min && value < max)?.[0]
}

export function caratRangeOf(carats: number): string | undefined {
  return rangeOf(STORE_CARAT_RANGES, carats)
}

export function caratWeight(product: { weight?: number | null; weightUnit?: string | null }): number | undefined {
  return product.weightUnit === 'carats' && typeof product.weight === 'number' && product.weight > 0
    ? product.weight
    : undefined
}

export interface StoreQuery {
  search: string
  category: string[]
  stone: string[]
  origin: string[]
  carat: string[]
  priceMin?: number
  priceMax?: number
  availability: 'available' | 'all'
  sort: StoreSort
  page: number
}

export type StoreSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function listValue(value: string | string[] | undefined, options: readonly (readonly [string, ...unknown[]])[]): string[] {
  const requested = new Set((Array.isArray(value) ? value : [value ?? '']).flatMap((entry) => entry.split(',')))
  return options.map(([option]) => option).filter((option) => requested.has(option))
}

const MAX_PRICE = 10_000_000

function wholeDollars(value: string | string[] | undefined): number | undefined {
  const text = firstValue(value).replace(/[\s$,]/g, '')
  if (!/^\d+(\.\d+)?$/.test(text)) return undefined
  const amount = Math.round(Number(text))
  return amount <= MAX_PRICE ? amount : undefined
}

export function priceRange(
  min: string | string[] | undefined,
  max: string | string[] | undefined
): Pick<StoreQuery, 'priceMin' | 'priceMax'> {
  const low = wholeDollars(min)
  const high = wholeDollars(max)
  const [from, to] = low !== undefined && high !== undefined && low > high ? [high, low] : [low, high]
  return { priceMin: from || undefined, priceMax: to }
}

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })

export function priceRangeLabel({ priceMin, priceMax }: Pick<StoreQuery, 'priceMin' | 'priceMax'>): string | undefined {
  if (priceMin !== undefined && priceMax !== undefined) return `${aud.format(priceMin)}–${aud.format(priceMax)}`
  if (priceMin !== undefined) return `${aud.format(priceMin)}+`
  if (priceMax !== undefined) return `Up to ${aud.format(priceMax)}`
  return undefined
}

function isOneOf<T extends string>(value: string, values: readonly T[]): value is T {
  return values.includes(value as T)
}

export function parseStoreQuery(params: StoreSearchParams): StoreQuery {
  const rawPage = Number(firstValue(params.page))
  const rawSort = firstValue(params.sort)

  return {
    search: firstValue(params.search).trim().slice(0, 80),
    category: listValue(params.category, STORE_CATEGORIES),
    stone: listValue(params.stone, STORE_STONES),
    origin: listValue(params.origin, STORE_ORIGINS),
    carat: listValue(params.carat, STORE_CARAT_RANGES),
    ...priceRange(params.price_min, params.price_max),
    availability: firstValue(params.availability) === 'all' ? 'all' : 'available',
    sort: isOneOf(rawSort, STORE_SORTS) ? rawSort : 'featured',
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  }
}

export const EMPTY_STORE_QUERY: StoreQuery = parseStoreQuery({})

export function storeQueryParams(query: StoreQuery, page = query.page): URLSearchParams {
  const params = new URLSearchParams()

  if (query.search) params.set('search', query.search)
  for (const facet of STORE_FACETS) {
    if (query[facet].length > 0) params.set(facet, query[facet].join(','))
  }
  if (query.priceMin !== undefined) params.set('price_min', String(query.priceMin))
  if (query.priceMax !== undefined) params.set('price_max', String(query.priceMax))
  if (query.availability === 'all') params.set('availability', 'all')
  if (query.sort !== 'featured') params.set('sort', query.sort)
  if (page > 1) params.set('page', String(page))

  return params
}

export function storeUrl(query: StoreQuery, page = query.page): string {
  const search = storeQueryParams(query, page).toString().replace(/%2C/g, ',')
  return search ? `/store?${search}` : '/store'
}

export function toggleFacetValue(query: StoreQuery, facet: StoreFacet, value: string): StoreQuery {
  const current = query[facet]
  const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
  return { ...query, [facet]: STORE_FACET_OPTIONS[facet].map(([option]) => option).filter((option) => next.includes(option)), page: 1 }
}

export function hasPriceRange(query: StoreQuery): boolean {
  return query.priceMin !== undefined || query.priceMax !== undefined
}

export function activeFilterCount(query: StoreQuery): number {
  return (
    STORE_FACETS.reduce((total, facet) => total + query[facet].length, 0) +
    (hasPriceRange(query) ? 1 : 0) +
    (query.availability === 'all' ? 1 : 0)
  )
}

export interface StoreListing {
  id: string
  name: string
  sku?: string
  category?: string
  stoneType?: string
  stoneOrigin?: string
  price: number
  stock: number
  featured: boolean
  createdAt: string
  carats?: number
}

function facetValue(item: StoreListing, facet: StoreFacet): string | undefined {
  switch (facet) {
    case 'category':
      return item.category
    case 'stone':
      return item.stoneType
    case 'origin':
      return item.stoneOrigin
    case 'carat':
      return item.carats === undefined ? undefined : caratRangeOf(item.carats)
  }
}

function inScope(item: StoreListing, query: StoreQuery): boolean {
  if (query.availability === 'available' && item.stock <= 0) return false
  if (query.priceMin !== undefined && item.price < query.priceMin) return false
  if (query.priceMax !== undefined && item.price > query.priceMax) return false
  if (!query.search) return true
  const term = query.search.toLowerCase()
  return item.name.toLowerCase().includes(term) || Boolean(item.sku?.toLowerCase().includes(term))
}

function matchesFacets(item: StoreListing, query: StoreQuery, except?: StoreFacet): boolean {
  return STORE_FACETS.every((facet) => {
    if (facet === except || query[facet].length === 0) return true
    const value = facetValue(item, facet)
    return value !== undefined && query[facet].includes(value)
  })
}

const byNewest = (a: StoreListing, b: StoreListing) => b.createdAt.localeCompare(a.createdAt)
const byFeatured = (a: StoreListing, b: StoreListing) => Number(b.featured) - Number(a.featured) || byNewest(a, b)

const SORTERS: Record<StoreSort, (a: StoreListing, b: StoreListing) => number> = {
  featured: byFeatured,
  newest: byNewest,
  'price-low': (a, b) => a.price - b.price || byFeatured(a, b),
  'price-high': (a, b) => b.price - a.price || byFeatured(a, b),
  'carat-high': (a, b) => (b.carats ?? -1) - (a.carats ?? -1) || byFeatured(a, b),
}

export function findStoreListings(items: StoreListing[], query: StoreQuery): StoreListing[] {
  return items
    .filter((item) => inScope(item, query) && matchesFacets(item, query))
    .sort(SORTERS[query.sort])
}

export type StoreFacetCounts = Record<StoreFacet, Record<string, number>>

export function countStoreFacets(items: StoreListing[], query: StoreQuery): StoreFacetCounts {
  const counts: StoreFacetCounts = { category: {}, stone: {}, origin: {}, carat: {} }
  for (const item of items) {
    if (!inScope(item, query)) continue
    for (const facet of STORE_FACETS) {
      const value = facetValue(item, facet)
      if (value === undefined || !matchesFacets(item, query, facet)) continue
      counts[facet][value] = (counts[facet][value] ?? 0) + 1
    }
  }
  return counts
}

export function storeMetadata(query: StoreQuery): Metadata {
  const plain = storeUrl(query) === '/store'

  return {
    title: 'Shop Australian Opals | The Good Opal Co',
    description:
      'Browse one-of-a-kind Australian opals, finished jewellery, loose stones, and pieces for gifting. Every listing includes its known origin and details.',
    alternates: { canonical: '/store' },
    robots: plain ? undefined : { index: false, follow: true },
  }
}

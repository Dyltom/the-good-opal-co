import { describe, expect, test } from 'vitest'
import {
  countPriceBands,
  countStoreFacets,
  findStoreListings,
  parseStoreQuery,
  priceRangeLabel,
  STORE_PRICE_BANDS,
  storeFilterDetail,
  storeUrl,
  toggleFacetValue,
  type StoreListing,
} from '../store-query'
import { parseInsightBody } from '@/lib/insights/ingest'

function listing(id: string, fields: Partial<StoreListing>): StoreListing {
  return { id, name: id, price: 100, stock: 1, featured: false, createdAt: '2026-01-01T00:00:00.000Z', ...fields }
}

const catalogue = [
  listing('black-ring', { category: 'opal-rings', stoneType: 'black-opal', price: 1200, carats: 2.1 }),
  listing('white-ring', { category: 'opal-rings', stoneType: 'white-opal', price: 300, carats: 0.8 }),
  listing('black-loose', { category: 'raw-opals', stoneType: 'black-opal', price: 450, carats: 6.3 }),
  listing('boulder-pendant', { category: 'opal-necklaces', stoneType: 'boulder-opal', price: 700 }),
  listing('sold-black', { category: 'raw-opals', stoneType: 'black-opal', price: 900, carats: 12, stock: 0 }),
]

const ids = (items: StoreListing[]) => items.map((item) => item.id)

describe('/store query URLs', () => {
  test('reads comma lists and repeated params, drops unknown values and keeps option order', () => {
    expect(
      parseStoreQuery({
        stone: ['white-opal,Black Opal', 'black-opal', 'white-opal'],
        category: 'raw-opals,opal-rings,jewellery',
        carat: '6-plus,huge',
        sort: 'unknown',
        page: '-3',
        search: ['  black opal  ', 'ignored'],
      })
    ).toMatchObject({
      stone: ['black-opal', 'white-opal'],
      category: ['opal-rings', 'raw-opals'],
      carat: ['6-plus'],
      sort: 'featured',
      page: 1,
      search: 'black opal',
    })
  })

  test('writes readable comma URLs that parse back to the same query', () => {
    const query = parseStoreQuery({ stone: 'white-opal,black-opal', price_min: '500', price_max: '1000', sort: 'carat-high', page: '2' })
    const url = storeUrl(query)

    expect(url).toBe('/store?stone=black-opal,white-opal&price_min=500&price_max=1000&sort=carat-high&page=2')
    expect(parseStoreQuery(Object.fromEntries(new URL(url, 'https://x.test').searchParams))).toEqual(query)
    expect(storeUrl(parseStoreQuery({}))).toBe('/store')
  })

  test('reads price bounds to the cent and ignores blanks, words, negatives and zero', () => {
    expect(parseStoreQuery({ price_min: '$1,250.60', price_max: ' 2000 ' })).toMatchObject({ priceMin: 1250.6, priceMax: 2000 })
    expect(parseStoreQuery({ price_min: '17.5', price_max: '.99' })).toMatchObject({ priceMin: 0.99, priceMax: 17.5 })
    expect(parseStoreQuery({ price_min: '0', price_max: '0' })).toMatchObject({ priceMin: undefined, priceMax: undefined })
    expect(parseStoreQuery({ price_min: '', price_max: 'cheap' })).toMatchObject({ priceMin: undefined, priceMax: undefined })
    expect(parseStoreQuery({ price_min: '-50', price_max: '1e9' })).toMatchObject({ priceMin: undefined, priceMax: undefined })
    expect(parseStoreQuery({ price_min: '0', price_max: '300' })).toMatchObject({ priceMin: undefined, priceMax: 300 })
  })

  test('swaps a minimum above the maximum instead of showing nothing', () => {
    expect(parseStoreQuery({ price_min: '900', price_max: '200' })).toMatchObject({ priceMin: 200, priceMax: 900 })
  })

  test('labels typed ranges inclusively and preset bands as half-open', () => {
    expect(priceRangeLabel({ priceMin: 500, priceMax: 1000 })).toBe('$500–$1,000')
    expect(priceRangeLabel({ priceMin: 1000 })).toBe('$1,000+')
    expect(priceRangeLabel({ priceMax: 250 })).toBe('Up to $250')
    expect(priceRangeLabel({ priceMin: 17.5 })).toBe('$17.50+')
    expect(priceRangeLabel({ priceMax: 249.99 })).toBe('Under $250')
    expect(priceRangeLabel({ priceMin: 250, priceMax: 499.99 })).toBe('$250–$500')
    expect(priceRangeLabel({})).toBeUndefined()
  })

  test('toggling a value adds or removes it and returns to the first page', () => {
    const query = parseStoreQuery({ stone: 'black-opal', page: '3' })

    expect(toggleFacetValue(query, 'stone', 'boulder-opal')).toMatchObject({ stone: ['black-opal', 'boulder-opal'], page: 1 })
    expect(toggleFacetValue(query, 'stone', 'black-opal')).toMatchObject({ stone: [], page: 1 })
  })
})

describe('/store filtering', () => {
  test('matches any value within a facet and every active facet', () => {
    const anyStone = parseStoreQuery({ stone: 'white-opal,boulder-opal' })
    expect(ids(findStoreListings(catalogue, anyStone)).sort()).toEqual(['boulder-pendant', 'white-ring'])

    const looseBlackOrWhite = parseStoreQuery({ stone: 'black-opal,white-opal', category: 'raw-opals' })
    expect(ids(findStoreListings(catalogue, looseBlackOrWhite))).toEqual(['black-loose'])
  })

  test('hides sold pieces unless sold pieces are included', () => {
    const query = parseStoreQuery({ stone: 'black-opal' })

    expect(ids(findStoreListings(catalogue, query))).not.toContain('sold-black')
    expect(ids(findStoreListings(catalogue, { ...query, availability: 'all' }))).toContain('sold-black')
  })

  test('keeps a piece held by a live checkout in the available listing while a sold piece stays hidden', () => {
    const held = [...catalogue, listing('held-black', { stock: 0, reserved: true })]
    const available = ids(findStoreListings(held, parseStoreQuery({})))
    expect(available).toContain('held-black')
    expect(available).not.toContain('sold-black')
  })

  test('filters and sorts by carat only where a carat weight is known', () => {
    expect(ids(findStoreListings(catalogue, parseStoreQuery({ carat: 'under-1,6-plus' }))).sort()).toEqual(['black-loose', 'white-ring'])
    expect(ids(findStoreListings(catalogue, parseStoreQuery({ sort: 'carat-high' })))).toEqual([
      'black-loose',
      'black-ring',
      'white-ring',
      'boulder-pendant',
    ])
  })

  test('includes prices equal to either bound and excludes prices outside them', () => {
    const prices = [listing('a', { price: 250 }), listing('b', { price: 1000 }), listing('c', { price: 249.99 }), listing('d', { price: 1000.5 })]

    expect(ids(findStoreListings(prices, parseStoreQuery({ price_min: '250', price_max: '1000' }))).sort()).toEqual(['a', 'b'])
    expect(ids(findStoreListings(prices, parseStoreQuery({ price_min: '1000' }))).sort()).toEqual(['b', 'd'])
    expect(ids(findStoreListings(prices, parseStoreQuery({ price_max: '250' }))).sort()).toEqual(['a', 'c'])
  })
})

describe('/store facet counts', () => {
  test('each price lands in exactly one preset band and band counts match their results', () => {
    const prices = [99.99, 100, 249.99, 250, 499.99, 500, 1000, 4999.99, 5000, 12000].map((price) =>
      listing(String(price), { price })
    )
    const query = parseStoreQuery({})
    const counts = countPriceBands(prices, query)

    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(prices.length)
    STORE_PRICE_BANDS.forEach((band, index) => {
      expect(counts[index], priceRangeLabel(band)).toBe(findStoreListings(prices, { ...query, ...band }).length)
    })
  })

  test('each count equals the results for that option alongside the other active filters', () => {
    const query = parseStoreQuery({ stone: 'black-opal', price_min: '400', price_max: '1500' })
    const counts = countStoreFacets(catalogue, query)

    for (const facet of ['category', 'stone', 'carat'] as const) {
      for (const [value, count] of Object.entries(counts[facet])) {
        expect(count, `${facet}=${value}`).toBe(findStoreListings(catalogue, { ...query, [facet]: [value] }).length)
      }
    }
    expect(counts.category).toEqual({ 'opal-rings': 1, 'raw-opals': 1 })
    expect(counts.stone).toEqual({ 'black-opal': 2, 'boulder-opal': 1 })
  })

  test('leaves out options that would show nothing', () => {
    const counts = countStoreFacets(catalogue, parseStoreQuery({ category: 'opal-rings' }))

    expect(counts.stone).toEqual({ 'black-opal': 1, 'white-opal': 1 })
    expect(counts.category).toEqual({ 'opal-rings': 2, 'raw-opals': 1, 'opal-necklaces': 1 })
  })
})

describe('/store filter insights', () => {
  test('a store_filter event with every filter and a price range is accepted by insight ingest', () => {
    const query = parseStoreQuery({
      category: 'opal-rings',
      stone: 'black-opal',
      origin: 'lightning-ridge',
      carat: '1-3',
      price_min: '100',
      price_max: '500',
      availability: 'all',
      sort: 'price-low',
    })
    const detail = { ...storeFilterDetail(query), results: 3 }

    expect(detail.price).toBe('100-500')
    expect(parseInsightBody(JSON.stringify({ name: 'store_filter', path: '/store', detail })).ok).toBe(true)
  })
})

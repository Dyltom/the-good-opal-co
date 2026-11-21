import { describe, expect, test } from 'vitest'
import {
  countStoreFacets,
  findStoreListings,
  parseStoreQuery,
  storeUrl,
  toggleFacetValue,
  type StoreListing,
} from '../store-query'

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
    const query = parseStoreQuery({ stone: 'white-opal,black-opal', price: '500-1000', sort: 'carat-high', page: '2' })
    const url = storeUrl(query)

    expect(url).toBe('/store?stone=black-opal,white-opal&price=500-1000&sort=carat-high&page=2')
    expect(parseStoreQuery(Object.fromEntries(new URL(url, 'https://x.test').searchParams))).toEqual(query)
    expect(storeUrl(parseStoreQuery({}))).toBe('/store')
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

  test('hides sold pieces unless collected pieces are included', () => {
    const query = parseStoreQuery({ stone: 'black-opal' })

    expect(ids(findStoreListings(catalogue, query))).not.toContain('sold-black')
    expect(ids(findStoreListings(catalogue, { ...query, availability: 'all' }))).toContain('sold-black')
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

  test('puts a boundary price in exactly one price range', () => {
    const atBoundary = [listing('a', { price: 250 }), listing('b', { price: 1000 }), listing('c', { price: 249.99 })]

    expect(ids(findStoreListings(atBoundary, parseStoreQuery({ price: '250-500' })))).toEqual(['a'])
    expect(ids(findStoreListings(atBoundary, parseStoreQuery({ price: '1000-plus' })))).toEqual(['b'])
    expect(ids(findStoreListings(atBoundary, parseStoreQuery({ price: 'under-250' })))).toEqual(['c'])
  })
})

describe('/store facet counts', () => {
  test('each count equals the results for that option alongside the other active filters', () => {
    const query = parseStoreQuery({ stone: 'black-opal', price: '1000-plus,250-500' })
    const counts = countStoreFacets(catalogue, query)

    for (const facet of ['category', 'stone', 'price', 'carat'] as const) {
      for (const [value, count] of Object.entries(counts[facet])) {
        expect(count, `${facet}=${value}`).toBe(findStoreListings(catalogue, { ...query, [facet]: [value] }).length)
      }
    }
    expect(counts.price).toEqual({ '1000-plus': 1, '250-500': 1 })
  })

  test('leaves out options that would show nothing', () => {
    const counts = countStoreFacets(catalogue, parseStoreQuery({ category: 'opal-rings' }))

    expect(counts.stone).toEqual({ 'black-opal': 1, 'white-opal': 1 })
    expect(counts.category).toEqual({ 'opal-rings': 2, 'raw-opals': 1, 'opal-necklaces': 1 })
  })
})

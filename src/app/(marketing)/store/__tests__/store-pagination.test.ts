import { describe, expect, test } from 'vitest'
import {
  parseStoreQuery,
  PRODUCTS_PER_PAGE,
  storeUrl,
} from '../store-query'

describe('/store server query', () => {
  test('caps each Payload request at 24 products', () => {
    expect(PRODUCTS_PER_PAGE).toBe(24)
  })

  test('normalises invalid and repeated URL values', () => {
    expect(parseStoreQuery({
      search: ['  black opal  ', 'ignored'],
      page: '-3',
      sort: 'unknown',
      availability: 'unexpected',
    })).toMatchObject({
      search: 'black opal',
      page: 1,
      sort: 'featured',
      availability: 'available',
    })
  })

  test('discards values that cannot be queried against catalog enums', () => {
    expect(
      parseStoreQuery({
        category: 'Jewellery',
        stone: 'Black Opal',
        origin: 'Lightning Ridge',
        material: 'silver',
      })
    ).toMatchObject({
      category: undefined,
      stone: undefined,
      origin: undefined,
      material: undefined,
    })
  })

  test('preserves active refinements between product pages', () => {
    const query = parseStoreQuery({
      category: 'opal-rings',
      origin: 'lightning-ridge',
      sort: 'price-high',
      page: '3',
    })

    expect(storeUrl(query, 2)).toBe(
      '/store?category=opal-rings&origin=lightning-ridge&sort=price-high&page=2'
    )
  })

  test('omits default values from the canonical URL', () => {
    expect(storeUrl(parseStoreQuery({}))).toBe('/store')
  })
})

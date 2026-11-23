import { describe, expect, test } from 'vitest'
import { parseStoreQuery, storeMetadata } from '../store-query'

describe('store metadata', () => {
  test('keeps the plain store indexable with a self canonical', () => {
    const metadata = storeMetadata(parseStoreQuery({}))

    expect(metadata.alternates?.canonical).toBe('/store')
    expect(metadata.robots).toBeUndefined()
  })

  test('indexes a single category, stone or origin as its own landing page', () => {
    for (const [params, url, title] of [
      [{ category: 'opal-rings' }, '/store?category=opal-rings', 'Australian Opal Rings | The Good Opal Co'],
      [{ stone: 'black-opal' }, '/store?stone=black-opal', 'Black Opal for Sale | The Good Opal Co'],
      [{ origin: 'lightning-ridge' }, '/store?origin=lightning-ridge', 'Lightning Ridge Opal for Sale | The Good Opal Co'],
    ] as const) {
      const metadata = storeMetadata(parseStoreQuery(params))

      expect(metadata.alternates?.canonical).toBe(url)
      expect(metadata.title).toBe(title)
      expect(metadata.robots).toBeUndefined()
    }
  })

  test('keeps filtered, sorted, searched and expanded views out of the index but crawlable', () => {
    for (const params of [
      { category: 'opal-rings', sort: 'price-low' },
      { category: 'opal-rings,opal-earrings' },
      { category: 'opal-rings', stone: 'black-opal' },
      { category: 'opal-necklaces' },
      { stone: 'black-opal', page: '2' },
      { sort: 'price-low' },
      { search: 'black' },
      { availability: 'all' },
      { page: '2' },
    ]) {
      const metadata = storeMetadata(parseStoreQuery(params))

      expect(metadata.alternates?.canonical, JSON.stringify(params)).toBe('/store')
      expect(metadata.robots, JSON.stringify(params)).toEqual({ index: false, follow: true })
    }
  })
})

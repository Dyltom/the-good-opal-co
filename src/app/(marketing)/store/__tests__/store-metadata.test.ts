import { describe, expect, test } from 'vitest'
import { parseStoreQuery, storeMetadata } from '../store-query'

describe('store metadata', () => {
  test('keeps the plain store indexable with a self canonical', () => {
    const metadata = storeMetadata(parseStoreQuery({}))

    expect(metadata.alternates?.canonical).toBe('/store')
    expect(metadata.robots).toBeUndefined()
  })

  test('indexes later pages under their own canonical and title', () => {
    const metadata = storeMetadata(parseStoreQuery({ page: '2' }))

    expect(metadata.alternates?.canonical).toBe('/store?page=2')
    expect(metadata.title).toContain('page 2')
    expect(metadata.robots).toBeUndefined()
  })

  test('keeps filtered, sorted, and searched views out of the index but crawlable', () => {
    for (const params of [{ category: 'opal-rings' }, { sort: 'price-low' }, { search: 'black' }, { availability: 'all' }]) {
      const metadata = storeMetadata(parseStoreQuery(params))

      expect(metadata.alternates?.canonical, JSON.stringify(params)).toBe('/store')
      expect(metadata.robots, JSON.stringify(params)).toEqual({ index: false, follow: true })
    }
  })
})

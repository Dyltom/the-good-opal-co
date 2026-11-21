import { describe, expect, test } from 'vitest'
import { rankProductSuggestions, type ProductMatch } from '../suggestions'

function match(slug: string, category: string, stock: number): ProductMatch {
  return { name: slug, slug, price: 100, stock, category }
}

describe('header search suggestions', () => {
  test('lists available pieces before sold ones and mixes rings in with loose stones', () => {
    const ranked = rankProductSuggestions([
      match('sold-black', 'raw-opals', 0),
      match('black-1', 'raw-opals', 1),
      match('black-2', 'raw-opals', 1),
      match('black-3', 'raw-opals', 1),
      match('black-ring', 'opal-rings', 1),
    ])

    expect(ranked.map((suggestion) => suggestion.href)).toEqual([
      '/store/black-1',
      '/store/black-ring',
      '/store/black-2',
      '/store/black-3',
      '/store/sold-black',
    ])
    expect(ranked.map((suggestion) => suggestion.sold)).toEqual([false, false, false, false, true])
  })
})

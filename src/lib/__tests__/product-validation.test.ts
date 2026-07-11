import { describe, expect, test } from 'vitest'
import { validateCurrencyAmount, validateWholeStock } from '@/lib/product-validation'

describe('product commerce validation', () => {
  test.each([0, 1, 1.2, 1.23, 19.99, 12_500.5])('accepts cent-safe price %s', (price) => {
    expect(validateCurrencyAmount(price)).toBe(true)
  })

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1.001, '19.99'])(
    'rejects unsafe price %s',
    (price) => {
      expect(validateCurrencyAmount(price)).not.toBe(true)
    }
  )

  test.each([0, 1, 42])('accepts whole non-negative stock %s', (stock) => {
    expect(validateWholeStock(stock)).toBe(true)
  })

  test.each([-1, 0.5, Number.NaN, '1'])('rejects unsafe stock %s', (stock) => {
    expect(validateWholeStock(stock)).not.toBe(true)
  })
})

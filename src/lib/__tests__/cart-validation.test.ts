import { describe, expect, test } from 'vitest'
import {
  cartAddQuantitySchema,
  cartUpdateQuantitySchema,
} from '@/lib/cart-validation'

describe('cart mutation validation', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 0, 1.5, 100])(
    'rejects invalid add quantity %s',
    (quantity) => {
      expect(cartAddQuantitySchema.safeParse(quantity).success).toBe(false)
    }
  )

  test('allows zero only for explicit removal updates', () => {
    expect(cartUpdateQuantitySchema.safeParse(0).success).toBe(true)
    expect(cartUpdateQuantitySchema.safeParse(-1).success).toBe(false)
  })
})

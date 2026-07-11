import { describe, expect, test } from 'vitest'
import {
  cartAddQuantitySchema,
  cartItemInputSchema,
  cartUpdateQuantitySchema,
} from '@/lib/cart-validation'

describe('cart mutation validation', () => {
  const item = {
    productId: '42',
    slug: 'opal-ring',
    name: 'Opal ring',
    price: 150,
  }

  test('accepts a finite database-backed cart item input', () => {
    expect(cartItemInputSchema.safeParse(item).success).toBe(true)
  })

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

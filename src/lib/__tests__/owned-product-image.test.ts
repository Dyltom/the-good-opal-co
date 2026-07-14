import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/data/products'
import { ownedProductImageUrl } from '../owned-product-image'

describe('owned catalogue image fallback', () => {
  test('resolves checked-in product photography by stable slug', () => {
    expect(ownedProductImageUrl('coober-pedy-carved-heart-parcel')).toBe(
      '/images/products/IMG_0808.jpg'
    )
    expect(ownedProductImageUrl('missing-product')).toBeUndefined()
  })

  test('covers every product in the current fallback catalogue', () => {
    expect(PRODUCTS).toHaveLength(56)

    for (const product of PRODUCTS) {
      expect(ownedProductImageUrl(product.slug), product.slug).toBe(product.image)
    }
  })
})

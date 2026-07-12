import { describe, expect, test } from 'vitest'
import { ownedProductImageUrl } from '../owned-product-image'

describe('owned catalogue image fallback', () => {
  test('resolves checked-in product photography by stable slug', () => {
    expect(ownedProductImageUrl('coober-pedy-carved-heart-parcel')).toBe(
      '/images/products/IMG_0810.jpg'
    )
    expect(ownedProductImageUrl('missing-product')).toBeUndefined()
  })
})

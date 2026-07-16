import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/data/products'
import { ownedProductImageUrl } from '../owned-product-image'

describe('owned catalogue image fallback', () => {
  test('scopes the corrected carved-heart primary to legacy product 5504', () => {
    const correctedProduct = PRODUCTS.find(({ id }) => id === '5504')
    const neighbouringProduct = PRODUCTS.find(({ id }) => id === '5505')

    expect(correctedProduct?.slug).toBe('coober-pedy-carved-heart-parcel')
    expect(ownedProductImageUrl(correctedProduct?.slug)).toBe('/images/products/IMG_0808.jpg')
    expect(neighbouringProduct?.slug).toBe('coober-pedy-carved-heart-parcel-2')
    expect(ownedProductImageUrl(neighbouringProduct?.slug)).toBe('/images/products/IMG_0810.jpg')
    expect(ownedProductImageUrl('missing-product')).toBeUndefined()
  })

  test('covers every product in the current fallback catalogue', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0)
    expect(PRODUCTS.reduce((count, product) => count + product.images.length, 0)).toBe(85)

    for (const product of PRODUCTS) {
      expect(ownedProductImageUrl(product.slug), product.slug).toBe(product.image)
      expect(product.image, product.slug).toBe(product.images[0]?.url)
      expect(new Set(product.images.map(({ sourceUrl }) => sourceUrl)).size, product.slug).toBe(
        product.images.length
      )
      for (const image of product.images) {
        expect(
          existsSync(resolve(process.cwd(), 'public', image.url.replace(/^\//, ''))),
          `${product.slug}: ${image.url}`
        ).toBe(true)
      }
    }
  })

  test('preserves secondary gallery order while removing an exact source duplicate', () => {
    const product = PRODUCTS.find(({ slug }) => slug === 'lightning-ridge-black-opal-1-25-ct')

    expect(product?.images.map(({ url }) => url)).toEqual([
      '/images/products/20210627_192839.jpg',
      '/images/products/20210505_103530.jpg',
      '/images/products/20210322_110201.png',
      '/images/products/20210627_193259.jpg',
    ])
  })
})

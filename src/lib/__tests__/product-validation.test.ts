import { describe, expect, test } from 'vitest'
import {
  validateBuilderProduct,
  validateCurrencyAmount,
  validateHexColour,
  validateWholeStock,
} from '@/lib/product-validation'

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

  test('requires complete reviewed data before enabling an opal in the builder', () => {
    const valid = {
      builderEligible: true,
      category: 'raw-opals',
      stoneType: 'crystal-opal',
      builderSilhouette: 'elongated',
      builderRecommendedStyle: 'gemini',
      builderBodyColour: '#78c5df',
      builderFlashColourPrimary: '#25d5e7',
      builderFlashColourSecondary: '#4bef9a',
      builderFlashColourAccent: '#4169ff',
      builderTransmission: 0.26,
      builderPhotoFocalX: 0.517,
      builderPhotoFocalY: 0.466,
      builderPhotoZoom: 4.74,
      builderPhotoRotation: 0,
      builderMappedImageIndex: 0,
      dimensions: { width: 5.3, length: 9.5, depth: 2.5 },
      images: [{ image: 1 }],
    }

    expect(validateBuilderProduct(valid)).toBe(true)
    expect(validateBuilderProduct({ ...valid, builderSilhouette: 'heart' })).toBe(true)
    expect(validateBuilderProduct({ ...valid, images: [] })).toBe(
      'Builder opals require a reviewed face image'
    )
    expect(validateBuilderProduct({ ...valid, builderPhotoZoom: 0.5 })).toBe(
      'Builder opals require a reviewed photo crop'
    )
    expect(validateBuilderProduct({ ...valid, builderPhotoRotation: 181 })).toBe(
      'Builder opals require a reviewed photo crop'
    )
    expect(validateBuilderProduct({ ...valid, builderMappedImageIndex: 1 })).toBe(
      'Builder mapped image must reference an existing gallery image'
    )
    expect(validateBuilderProduct({ ...valid, category: 'opal-rings' })).toBe(
      'Builder opals must use the Raw Opals category'
    )
    expect(validateBuilderProduct({ ...valid, builderMappingStatus: 'pending' })).toBe(
      'Builder opals require a reviewed or manually approved mapping'
    )
    expect(validateBuilderProduct({ ...valid, builderMappingStatus: 'manual' })).toBe(true)
  })

  test.each(['#78c5df', '#FFFFFF', undefined, null, ''])('accepts hex colour value %s', (value) => {
    expect(validateHexColour(value)).toBe(true)
  })

  test.each(['78c5df', '#fff', '#xyzxyz', 123])('rejects invalid colour value %s', (value) => {
    expect(validateHexColour(value)).not.toBe(true)
  })
})

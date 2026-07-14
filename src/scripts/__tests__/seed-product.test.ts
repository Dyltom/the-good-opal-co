import { syntheticBuilderMappingForSeed } from '../seed-product'

describe('fallback seed builder mapping', () => {
  test('creates complete reviewed mappings only for identifiable CI opals', () => {
    expect(
      syntheticBuilderMappingForSeed('Lightning Ridge Black Opal 1.45 cts', 'raw-opals', true)
    ).toEqual({ builderMappingStatus: 'reviewed', stoneType: 'black-opal' })
    expect(syntheticBuilderMappingForSeed('Custom Jewellery Deposit', 'raw-opals', true)).toEqual(
      {}
    )
  })

  test('does not invent maker approval in production recovery seeds', () => {
    expect(
      syntheticBuilderMappingForSeed('Lightning Ridge Black Opal 1.45 cts', 'raw-opals', false)
    ).toEqual({})
    expect(syntheticBuilderMappingForSeed('Aurora Opal Ring', 'opal-rings', true)).toEqual({})
  })
})

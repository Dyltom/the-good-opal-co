import { defaultRingConfig, type BuilderOpal } from '@/components/custom-builder/config'
import { resolveInitialBuilderState } from '../initial-state'
import {
  builderCatalogueImageAlt,
  resolveBuilderCatalogueImageUrl,
  shouldIncludeBuilderCatalogueProduct,
} from '../catalogue'

const availableOpal: BuilderOpal = {
  id: '127',
  name: 'Lightning Ridge black opal',
  slug: 'lightning-ridge-black-opal',
  imageUrl: '/black-opal.jpg',
  imageAlt: 'Black opal with blue fire',
  price: 250,
  stoneType: 'black-opal',
  stoneTypeLabel: 'Black opal',
  selectionKind: 'individual',
  renderStone: 'lightning',
  visual: {
    silhouette: 'oval',
    aspectRatio: 1.3,
    bodyColour: '#071521',
    flashColours: ['#315cff', '#42e29a'],
    transmission: 0.035,
    patternSeed: 127,
    evidence: 'type-fallback',
    recommendedStyle: 'gemini',
  },
}

describe('design page initial state', () => {
  test('starts in collection-reference mode when no inventory opal was requested', () => {
    const state = resolveInitialBuilderState(defaultRingConfig, [availableOpal])

    expect(state.config).toEqual(defaultRingConfig)
    expect(state.config.opalId).toBeUndefined()
    expect(state.unavailableOpalRequested).toBe(false)
  })

  test('hides unreviewed individuals but keeps representative multi-opal listings', () => {
    expect(
      shouldIncludeBuilderCatalogueProduct({
        builderMappingStatus: 'pending',
        name: 'New Lightning Ridge black opal',
      })
    ).toBe(false)
    expect(
      shouldIncludeBuilderCatalogueProduct({
        builderMappingStatus: 'stale',
        name: 'Changed Lightning Ridge black opal',
      })
    ).toBe(false)
    expect(
      shouldIncludeBuilderCatalogueProduct({
        builderMappingStatus: 'reviewed',
        name: 'Reviewed Lightning Ridge black opal',
      })
    ).toBe(true)
    expect(
      shouldIncludeBuilderCatalogueProduct({
        builderMappingStatus: 'pending',
        name: 'Coober Pedy carved heart parcel',
      })
    ).toBe(true)
  })

  test('prefers current mapped media and safely corrects known source alt drift', () => {
    expect(
      resolveBuilderCatalogueImageUrl(
        '/api/media/file/current.jpg',
        '/images/products/old.jpg',
        '/images/products/owned.jpg',
        undefined
      )
    ).toBe('/api/media/file/current.jpg')
    expect(
      builderCatalogueImageAlt(
        'queensland-boulder-opal-20-cts',
        'Queensland Boulder Opal 20 cts',
        'Large Koroit Boulder Opal Specimen 108.65 cts'
      )
    ).toBe('Queensland Boulder Opal 20 cts')
  })
})

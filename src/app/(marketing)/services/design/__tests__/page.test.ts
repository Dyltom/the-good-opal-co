import { defaultRingConfig, type BuilderOpal } from '@/components/custom-builder/config'
import { resolveInitialBuilderState } from '../initial-state'

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
})

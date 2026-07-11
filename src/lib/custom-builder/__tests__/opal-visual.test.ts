import { describe, expect, test } from 'vitest'
import { createOpalVisualProfile, isBuilderEligibleOpal } from '../opal-visual'

const reviewedOpals = [
  ['lightning-ridge-white-opal-1-05-cts', 'Lightning Ridge White Opal 1.05 cts'],
  ['mintabie-semi-black-opal-1-05-cts', 'Mintabie Semi Black Opal 1.05 cts'],
  ['mintabie-semi-black-opal-1-35-cts', 'Mintabie Semi Black Opal 1.35 cts'],
  ['queensland-crystal-pipe-opal-1-45-cts', 'Queensland Crystal Pipe Opal 1.05 cts'],
] as const

describe('custom builder opal visual profiles', () => {
  test.each(reviewedOpals)('makes reviewed store opal %s eligible by stable slug', (slug, name) => {
    expect(isBuilderEligibleOpal(slug, name)).toBe(true)
  })

  test('rejects legacy IDs and unsupported catalogue shapes', () => {
    expect(isBuilderEligibleOpal('128', 'Lightning Ridge Black Crystal Opal 3 cts')).toBe(false)
    expect(
      isBuilderEligibleOpal('coober-pedy-carved-heart-1-ct', 'Coober Pedy Carved Heart 1 ct')
    ).toBe(false)
    expect(
      isBuilderEligibleOpal(
        'coober-pedy-white-opal-2-30-cts-copy',
        'Coober Pedy White Opal 2.30 cts'
      )
    ).toBe(false)
  })

  test('uses the reviewed crop and body colour for a current live product slug', () => {
    const profile = createOpalVisualProfile(
      'queensland-crystal-pipe-opal-1-45-cts',
      'Queensland Crystal Pipe Opal 1.05 cts',
      'crystal-opal'
    )

    expect(profile.renderStone).toBe('blue-green')
    expect(profile.visual).toMatchObject({
      silhouette: 'elongated',
      aspectRatio: 1.79,
      recommendedStyle: 'gemini',
      evidence: 'catalogue',
      transmission: 0.26,
      bodyColour: '#a8d9d8',
      textureCrop: { focalX: 0.437, focalY: 0.414, zoom: 5.35 },
    })
  })

  test('keeps reviewed photo crops aligned with the complete stone face', () => {
    const white = createOpalVisualProfile(
      'lightning-ridge-white-opal-1-05-cts',
      'Lightning Ridge White Opal 1.05 ct',
      'white-opal'
    )
    const semiBlack = createOpalVisualProfile(
      'mintabie-semi-black-opal-1-35-cts',
      'Mintabie Semi Black Opal 1.35 cts',
      'black-opal'
    )

    expect(white.visual.textureCrop).toEqual({ focalX: 0.422, focalY: 0.413, zoom: 3.62 })
    expect(semiBlack.visual.textureCrop).toEqual({ focalX: 0.419, focalY: 0.422, zoom: 4.42 })
  })

  test('rejects product photos that cannot provide a clean isolated stone face', () => {
    expect(
      isBuilderEligibleOpal(
        'lightning-ridge-semi-black-opal-1-40-cts',
        'Lightning Ridge Semi Black Opal 1.40 cts'
      )
    ).toBe(false)
  })

  test('creates stable but distinct palettes for individual store stones', () => {
    const first = createOpalVisualProfile('black-opal-one', 'Black opal one', 'black-opal')
    const again = createOpalVisualProfile('black-opal-one', 'Black opal one', 'black-opal')
    const second = createOpalVisualProfile('black-opal-two', 'Black opal two', 'black-opal')

    expect(first).toEqual(again)
    expect(second.visual.patternSeed).not.toBe(first.visual.patternSeed)
  })
})

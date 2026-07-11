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

  test.each([
    'lightning-ridge-white-opal-105-ct',
    'mintabie-semi-black-opal-105-cts',
    'mintabie-semi-black-opal-135-cts',
    'queensland-crystal-pipe-opal-105-cts',
  ])('keeps the checked-in import slug %s eligible after a clean restore', (slug) => {
    expect(isBuilderEligibleOpal(slug, 'Imported store opal')).toBe(true)
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
      aspectRatio: 1.77,
      recommendedStyle: 'gemini',
      evidence: 'catalogue',
      transmission: 0.26,
      bodyColour: '#78c5df',
      dimensionsMm: { width: 5.3, length: 9.5, depth: 2.5 },
      textureCrop: { focalX: 0.517, focalY: 0.466, zoom: 4.74 },
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

    expect(white.visual.textureCrop).toEqual({ focalX: 0.507, focalY: 0.495, zoom: 3.08 })
    expect(white.visual.dimensionsMm).toEqual({ width: 6, length: 7, depth: 3 })
    expect(semiBlack.visual.textureCrop).toEqual({
      focalX: 0.501,
      focalY: 0.493,
      zoom: 3.61,
    })
    expect(semiBlack.visual.dimensionsMm).toEqual({ width: 7, length: 8, depth: 3.5 })
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

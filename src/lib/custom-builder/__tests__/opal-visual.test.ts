import { describe, expect, test } from 'vitest'
import {
  createOpalVisualProfile,
  isBuilderEligibleOpal,
  reviewedOpalImageUrl,
} from '../opal-visual'

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

  test.each([
    ['lightning-ridge-white-opal-1-05-cts', '/images/products/20211104_234659-1-1.jpg'],
    ['mintabie-semi-black-opal-105-cts', '/images/products/20210923_174046.jpg'],
    ['mintabie-semi-black-opal-1-35-cts', '/images/products/20210923_173846-1.jpg'],
    ['queensland-crystal-pipe-opal-105-cts', '/images/products/20211012_173649.jpg'],
  ] as const)('locks reviewed store opal %s to its audited source photo', (slug, imageUrl) => {
    expect(reviewedOpalImageUrl(slug)).toBe(imageUrl)
  })

  test('does not invent a source photo for a newly managed opal', () => {
    expect(reviewedOpalImageUrl('new-reviewed-opal')).toBeUndefined()
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
      aspectRatio: 9.5 / 5.3,
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
    expect(white.visual.aspectRatio).toBe(7 / 6)
    expect(semiBlack.visual.aspectRatio).toBe(8 / 7)
  })

  test('matches the oval Mintabie 1.05 stone to the Gemini setting', () => {
    const mintabie = createOpalVisualProfile(
      'mintabie-semi-black-opal-1-05-cts',
      'Mintabie Semi Black Opal 1.05 cts',
      'black-opal'
    )

    expect(mintabie.visual).toMatchObject({
      silhouette: 'oval',
      aspectRatio: 1.3,
      recommendedStyle: 'gemini',
      dimensionsMm: { width: 5, length: 6.5, depth: 3.5 },
    })
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

  test('uses complete Payload-managed visual data for newly reviewed store opals', () => {
    const managed = {
      builderEligible: true,
      builderSilhouette: 'pear',
      builderRecommendedStyle: 'aurora',
      builderBodyColour: '#173350',
      builderFlashColourPrimary: '#16d7ef',
      builderFlashColourSecondary: '#43ef8f',
      builderFlashColourAccent: '#ffcb42',
      builderTransmission: 0.08,
      builderPhotoFocalX: 0.48,
      builderPhotoFocalY: 0.52,
      builderPhotoZoom: 3.4,
      dimensions: { width: 6, length: 9, depth: 3 },
    }

    expect(isBuilderEligibleOpal('new-reviewed-opal', 'New reviewed opal', managed)).toBe(true)
    expect(
      createOpalVisualProfile('new-reviewed-opal', 'New reviewed opal', 'black-opal', managed)
        .visual
    ).toMatchObject({
      silhouette: 'pear',
      aspectRatio: 1.5,
      recommendedStyle: 'aurora',
      bodyColour: '#173350',
      flashColours: ['#16d7ef', '#43ef8f', '#ffcb42'],
      transmission: 0.08,
      textureCrop: { focalX: 0.48, focalY: 0.52, zoom: 3.4 },
      dimensionsMm: { width: 6, length: 9, depth: 3 },
    })
  })

  test('does not expose incomplete CMS builder records', () => {
    expect(
      isBuilderEligibleOpal('unfinished-opal', 'Unfinished opal', { builderEligible: true })
    ).toBe(false)
  })
})

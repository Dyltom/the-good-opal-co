import { describe, expect, test } from 'vitest'
import {
  classifyOpalListing,
  createOpalVisualProfile,
  inferBuilderStoneType,
  isAvailableOpalListing,
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
  test('admits physical opal listings while rejecting miscategorised services', () => {
    expect(isAvailableOpalListing('Lightning Ridge Black Opal 6.30ct')).toBe(true)
    expect(isAvailableOpalListing('Coober Pedy Carved Heart Parcel')).toBe(true)
    expect(isAvailableOpalListing('Large Koroit Boulder Opal Specimen')).toBe(true)
    expect(isAvailableOpalListing('Custom Jewellery Deposit')).toBe(false)
    expect(isAvailableOpalListing('Ring repair fee')).toBe(false)
  })

  test.each([
    ['Mintabie Dark Opal heart 0.55 cts', 'individual'],
    ['Premium Calibrated Rounds 2.5mm', 'assortment'],
    ['Freeform Doublet Parcel 2.3 cts', 'parcel'],
    ['Large Koroit Boulder Opal Specimen 108.65 cts', 'specimen'],
  ] as const)('classifies %s truthfully as %s', (name, kind) => {
    expect(classifyOpalListing(name)).toBe(kind)
  })

  test('infers only broad stone families when legacy records omit a type', () => {
    expect(inferBuilderStoneType(null, 'Freeform Doublet Parcel')).toBe('opal-doublet')
    expect(inferBuilderStoneType(null, 'Coober Pedy Carved Heart Parcel')).toBe('white-opal')
    expect(inferBuilderStoneType(null, 'Mystery Australian Opal')).toBe('unknown-opal')
    expect(inferBuilderStoneType('black-opal', 'White-looking listing')).toBe('black-opal')
  })

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

  test('preserves a carved heart as a heart instead of forcing a cushion cut', () => {
    const profile = createOpalVisualProfile(
      'coober-pedy-carved-heart-1-ct',
      'Coober Pedy Carved Heart 1 ct',
      'white-opal'
    )

    expect(profile.visual).toMatchObject({
      silhouette: 'heart',
      aspectRatio: 1,
      recommendedStyle: 'coral',
      photoFit: 'reviewed',
      textureCrop: { focalX: 0.5, focalY: 0.56, zoom: 3.2 },
    })
  })

  test.each([
    [
      'mintabie-dark-opal-heart-055-cts',
      'Mintabie Dark Opal heart 0.55 cts',
      { focalX: 0.49, focalY: 0.48, zoom: 1.85 },
    ],
    [
      'mintabie-dark-opal-heart-070cts',
      'Mintabie Dark Opal heart 0.70cts',
      { focalX: 0.48, focalY: 0.43, zoom: 2.25 },
    ],
  ] as const)('uses a separate reviewed crop for %s', (slug, name, textureCrop) => {
    const profile = createOpalVisualProfile(slug, name, 'white-opal')

    expect(profile.visual).toMatchObject({
      silhouette: 'heart',
      photoFit: 'reviewed',
      textureCrop,
    })
  })

  test.each([
    'lightning-ridge-black-opal-6-30ct',
    'lightning-ridge-black-opal-1-45-cts',
    'lightning-ridge-semi-black-opal-1-40-cts',
    'lightning-ridge-semi-black-opal-5-50-cts',
    'coober-pedy-white-opal-6-35-cts',
    'mintabie-semi-black-opal-6-80-cts',
    'coober-pedy-white-opal-2-30-cts-copy',
    'lightning-ridge-white-opal-1-70-cts-2',
  ])('maps the audited listing photo for current individual stone %s', (slug) => {
    const profile = createOpalVisualProfile(slug, 'Current individual opal', 'white-opal')

    expect(profile.visual.photoFit).toBe('estimated')
    expect(profile.visual.textureCrop).toMatchObject({
      focalX: expect.any(Number),
      focalY: expect.any(Number),
      zoom: expect.any(Number),
    })
  })

  test('treats the rough Queensland 20 ct piece as a specimen, not a ring cabochon', () => {
    expect(classifyOpalListing('Queensland Boulder Opal 20 cts')).toBe('specimen')
    expect(
      createOpalVisualProfile(
        'queensland-boulder-opal-20-cts',
        'Queensland Boulder Opal 20 cts',
        'boulder-opal'
      ).visual.textureCrop
    ).toBeUndefined()
  })

  test('keeps multi-stone listings on a representative material render', () => {
    const profile = createOpalVisualProfile(
      'freeform-doublet-parcel-2-3-cts',
      'Freeform Doublet Parcel 2.3 cts',
      'opal-doublet'
    )

    expect(profile.visual.textureCrop).toBeUndefined()
    expect(profile.visual.photoFit).toBeUndefined()
  })

  test('uses the selected product photo for every individual opal while review is refined', () => {
    const profile = createOpalVisualProfile(
      'newly-imported-individual-opal',
      'Newly imported Australian opal',
      'crystal-opal',
      { builderMappingStatus: 'reviewed' }
    )

    expect(profile.visual.textureCrop).toEqual({ focalX: 0.5, focalY: 0.5, zoom: 3.2 })
    expect(profile.visual.photoFit).toBe('estimated')
  })

  test('tightens estimated crops enough to keep photo backgrounds outside the cabochon', () => {
    const profile = createOpalVisualProfile(
      'coober-pedy-white-opal-2-30-cts-copy',
      'Coober Pedy White Opal 2.30 cts',
      'white-opal'
    )

    expect(profile.visual.photoFit).toBe('estimated')
    expect(profile.visual.textureCrop).toEqual({ focalX: 0.43, focalY: 0.43, zoom: 4.6 })
  })

  test('keeps the photographed hand outside the reviewed 1.70 ct pear face', () => {
    const profile = createOpalVisualProfile(
      'lightning-ridge-white-opal-1-70-cts-2',
      'Lightning Ridge White Opal 1.70 cts',
      'white-opal'
    )

    expect(profile.visual.textureCrop).toEqual({ focalX: 0.505, focalY: 0.48, zoom: 3.8 })
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

    expect(white.visual.textureCrop).toEqual({ focalX: 0.507, focalY: 0.489, zoom: 4.16 })
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

  test('keeps complete catalogue measurements without pretending a visual was reviewed', () => {
    const profile = createOpalVisualProfile('catalogue-opal', 'Australian opal', 'white-opal', {
      dimensions: { width: 6, length: 8, depth: 3 },
    })

    expect(profile.visual.evidence).toBe('type-fallback')
    expect(profile.visual.dimensionsMm).toEqual({ width: 6, length: 8, depth: 3 })
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
      builderPhotoRotation: -90,
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
      textureCrop: { focalX: 0.48, focalY: 0.52, zoom: 3.4, rotation: -90 },
      dimensionsMm: { width: 6, length: 9, depth: 3 },
    })
  })

  test('does not expose incomplete CMS builder records', () => {
    expect(
      isBuilderEligibleOpal('unfinished-opal', 'Unfinished opal', { builderEligible: true })
    ).toBe(false)
  })

  test('does not expose pending or stale CMS mappings', () => {
    const managed = {
      builderEligible: true,
      builderMappingStatus: 'pending',
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
      dimensions: { width: 6, length: 8, depth: 3 },
    }

    expect(isBuilderEligibleOpal('pending-opal', 'Pending opal', managed)).toBe(false)
    expect(
      isBuilderEligibleOpal('stale-opal', 'Stale opal', {
        ...managed,
        builderMappingStatus: 'stale',
      })
    ).toBe(false)
  })

  test('uses an approved mapped photo in the builder without enabling the store CTA', () => {
    const fields = {
      builderEligible: false,
      builderMappingStatus: 'reviewed',
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
      dimensions: { width: 6, length: 8, depth: 2 },
    }

    expect(isBuilderEligibleOpal('mapped-opal', 'Mapped opal', fields)).toBe(false)
    expect(
      createOpalVisualProfile('mapped-opal', 'Mapped opal', 'black-opal', fields).visual
    ).toMatchObject({
      silhouette: 'pear',
      textureCrop: { focalX: 0.48, focalY: 0.52, zoom: 3.4 },
    })
  })

  test('uses reviewed CMS crops when legacy catalogue dimensions are incomplete', () => {
    const profile = createOpalVisualProfile(
      'coober-pedy-white-opal-2-30-cts-copy',
      'Coober Pedy White Opal 2.30 cts',
      'white-opal',
      {
        builderEligible: false,
        builderMappingStatus: 'reviewed',
        builderSilhouette: 'oval',
        builderRecommendedStyle: 'gemini',
        builderBodyColour: '#dce6df',
        builderFlashColourPrimary: '#55cfff',
        builderFlashColourSecondary: '#5bea9a',
        builderFlashColourAccent: '#ffd34e',
        builderTransmission: 0.16,
        builderPhotoFocalX: 0.43,
        builderPhotoFocalY: 0.43,
        builderPhotoZoom: 4.6,
      }
    )

    expect(profile.visual).toMatchObject({
      aspectRatio: 1.2,
      photoFit: 'reviewed',
      textureCrop: { focalX: 0.43, focalY: 0.43, zoom: 4.6 },
    })
    expect(profile.visual.dimensionsMm).toBeUndefined()
  })

  test('never maps one crop onto a parcel containing multiple opals', () => {
    const profile = createOpalVisualProfile(
      'opal-parcel',
      'Australian opal parcel',
      'white-opal',
      {
        builderMappingStatus: 'reviewed',
        builderSilhouette: 'oval',
        builderRecommendedStyle: 'gemini',
        builderBodyColour: '#dce6df',
        builderFlashColourPrimary: '#55cfff',
        builderFlashColourSecondary: '#5bea9a',
        builderFlashColourAccent: '#ffd34e',
        builderTransmission: 0.16,
        builderPhotoFocalX: 0.48,
        builderPhotoFocalY: 0.52,
        builderPhotoZoom: 3.4,
        dimensions: { width: 6, length: 8, depth: 2 },
      }
    )

    expect(profile.visual.textureCrop).toBeUndefined()
  })
})

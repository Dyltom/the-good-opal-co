import { describe, expect, test } from 'vitest'
import {
  applyBuilderMappingLifecycle,
  builderMappingNeedsReview,
  BUILDER_MAPPING_VERSION,
  createBuilderSourceImageHash,
  inferDimensionsFromDescription,
  inferBuilderMapping,
  isBuilderMappingApproved,
} from '../mapping-lifecycle'

const now = '2026-07-12T12:00:00.000Z'

describe('opal builder mapping lifecycle', () => {
  test('deterministically infers visual fields from product facts', () => {
    const product = {
      category: 'raw-opals',
      dimensions: { depth: 3, length: 12, width: 6 },
      name: 'Lightning Ridge black opal',
      stoneType: 'black-opal',
    }

    expect(inferBuilderMapping(product)).toEqual({
      builderBodyColour: '#102434',
      builderFlashColourAccent: '#ffcb45',
      builderFlashColourPrimary: '#1bd8ed',
      builderFlashColourSecondary: '#38ed91',
      builderPhotoFocalX: 0.5,
      builderPhotoFocalY: 0.5,
      builderPhotoZoom: 2.25,
      builderRecommendedStyle: 'gemini',
      builderSilhouette: 'elongated',
      builderTransmission: 0.04,
    })
    expect(inferBuilderMapping(product)).toEqual(inferBuilderMapping(product))
  })

  test('uses shape and dimensions embedded in legacy description text', () => {
    expect(
      inferBuilderMapping({
        description: 'Natural pear cabochon measuring 9 x 6 x 2 mm',
        name: 'Lightning Ridge opal',
      })
    ).toMatchObject({
      builderRecommendedStyle: 'aurora',
      builderSilhouette: 'pear',
    })

    expect(
      inferBuilderMapping({
        description: 'Natural cabochon measuring 12 x 6 x 2 mm',
        name: 'Lightning Ridge opal',
      })
    ).toMatchObject({ builderSilhouette: 'elongated' })
  })

  test('uses stable image identity while respecting hero-image order', () => {
    const first = createBuilderSourceImageHash([
      { image: { id: 7, filename: 'opal.jpg', updatedAt: '2026-07-12' } },
      { image: 'media-2' },
    ])
    const same = createBuilderSourceImageHash([
      { image: { id: 7, filename: 'opal.jpg', updatedAt: '2026-07-12' } },
      { image: 'media-2' },
    ])
    const reordered = createBuilderSourceImageHash([
      { image: 'media-2' },
      { image: { id: 7, filename: 'opal.jpg', updatedAt: '2026-07-12' } },
    ])

    expect(first).toMatch(/^[0-9a-f]{16}$/)
    expect(same).toBe(first)
    expect(reordered).not.toBe(first)
  })

  test('tracks Payload focal-point changes as source-image changes', () => {
    const centred = createBuilderSourceImageHash([
      { image: { id: 7, filename: 'opal.jpg', focalX: 50, focalY: 50 } },
    ])
    const adjusted = createBuilderSourceImageHash([
      { image: { id: 7, filename: 'opal.jpg', focalX: 62, focalY: 44 } },
    ])

    expect(adjusted).not.toBe(centred)
  })

  test('recovers single-opal dimensions from legacy rich text regardless of axis order', () => {
    const description = {
      root: {
        children: [
          { children: [{ text: 'This opal measures 3 x 7 x 6 mm and has bright colour.' }] },
        ],
      },
    }

    expect(inferDimensionsFromDescription(description)).toEqual({
      depth: 3,
      length: 7,
      width: 6,
    })
    expect(inferDimensionsFromDescription('Measures 9.5 × 5.3 × 2.5 millimetres')).toEqual({
      depth: 2.5,
      length: 9.5,
      width: 5.3,
    })
  })

  test('uses uploaded media focal point and legacy measurements for a new individual opal', () => {
    const result = applyBuilderMappingLifecycle(
      {
        category: 'raw-opals',
        description: { root: { children: [{ children: [{ text: 'Measures 2 x 12 x 6 mm' }] }] } },
        images: [{ image: { filename: 'opal.jpg', focalX: 61, focalY: 43 } }],
        name: 'Lightning Ridge black opal',
        slug: 'legacy-black-opal',
        stoneType: 'black-opal',
      },
      undefined,
      now
    )

    expect(result).toMatchObject({
      builderPhotoFocalX: 0.61,
      builderPhotoFocalY: 0.43,
      builderSilhouette: 'elongated',
      dimensions: { depth: 2, length: 12, width: 6 },
    })
  })

  test('does not treat parcel measurements as one stone', () => {
    const result = applyBuilderMappingLifecycle(
      {
        category: 'raw-opals',
        description: 'Biggest measures 9 x 6 x 2 mm',
        images: [{ image: 'media-1' }],
        name: 'Bright opal parcel',
      },
      undefined,
      now
    )

    expect(result.dimensions).toBeUndefined()
  })

  test('queues a new raw opal for review and fills missing suggestions', () => {
    const result = applyBuilderMappingLifecycle(
      {
        category: 'raw-opals',
        dimensions: { depth: 2.5, length: 8, width: 8 },
        images: [{ image: 'media-1' }],
        name: 'Coober Pedy crystal opal',
        slug: 'new-crystal-opal',
        stoneType: 'crystal-opal',
      },
      undefined,
      now
    )

    expect(result).toMatchObject({
      builderEligible: false,
      builderMappingConfidence: 1,
      builderMappingStatus: 'pending',
      builderMappingVersion: BUILDER_MAPPING_VERSION,
      builderPhotoFocalX: 0.5,
      builderPhotoFocalY: 0.5,
      builderRecommendedStyle: 'sun-moon',
      builderSilhouette: 'round',
    })
    expect(result.builderMappingSourceImageHash).toMatch(/^[0-9a-f]{16}$/)
    expect(result.builderMappingInputHash).toMatch(/^[0-9a-f]{16}$/)
  })

  test('preserves manual fields and records explicit approval', () => {
    const result = applyBuilderMappingLifecycle(
      {
        builderBodyColour: '#112233',
        builderEligible: true,
        builderMappingStatus: 'manual',
      },
      {
        builderMappingStatus: 'pending',
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(result.builderBodyColour).toBe('#112233')
    expect(result.builderEligible).toBe(true)
    expect(result.builderMappingStatus).toBe('manual')
    expect(result.builderMappingReviewedAt).toBe(now)
  })

  test('marks an approved mapping stale and hides it after source changes', () => {
    const original = applyBuilderMappingLifecycle(
      {
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      undefined,
      now
    )
    const reviewed = { ...original, builderEligible: true, builderMappingStatus: 'reviewed' }
    const changed = applyBuilderMappingLifecycle(
      { images: [{ image: 'media-2' }] },
      reviewed,
      '2026-07-13T12:00:00.000Z'
    )

    expect(changed).toMatchObject({
      builderEligible: false,
      builderMappingStatus: 'stale',
    })
    expect(changed.builderMappingInputHash).not.toBe(original.builderMappingInputHash)
    expect(changed.builderMappingSourceImageHash).not.toBe(original.builderMappingSourceImageHash)
  })

  test('does not expose pending or stale mappings', () => {
    expect(isBuilderMappingApproved('pending')).toBe(false)
    expect(isBuilderMappingApproved('stale')).toBe(false)
    expect(isBuilderMappingApproved('reviewed')).toBe(true)
    expect(isBuilderMappingApproved('manual')).toBe(true)
    expect(isBuilderMappingApproved(undefined)).toBe(true)
  })

  test('disables builder visibility if an image is missing', () => {
    const result = applyBuilderMappingLifecycle(
      {
        builderEligible: true,
        builderMappingStatus: 'reviewed',
        category: 'raw-opals',
        dimensions: { depth: 2, length: 8, width: 6 },
        name: 'White opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      undefined,
      now
    )

    expect(result.builderEligible).toBe(false)
    expect(result.builderMappingSourceImageHash).toBeNull()
  })

  test('emits review work only for new or changed pending mappings', () => {
    const doc = {
      builderMappingInputHash: 'new',
      builderMappingStatus: 'stale',
      builderMappingVersion: 1,
      category: 'raw-opals',
    }
    expect(builderMappingNeedsReview(doc, undefined)).toBe(true)
    expect(builderMappingNeedsReview(doc, { ...doc })).toBe(false)
    expect(builderMappingNeedsReview(doc, { ...doc, builderMappingInputHash: 'old' })).toBe(true)
    expect(builderMappingNeedsReview({ ...doc, builderMappingStatus: 'reviewed' }, doc)).toBe(false)
  })
})

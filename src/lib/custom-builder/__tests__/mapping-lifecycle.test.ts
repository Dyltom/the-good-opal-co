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
      builderPhotoZoom: 3.2,
      builderRecommendedStyle: 'gemini',
      builderSilhouette: 'elongated',
      builderTransmission: 0.04,
    })
    expect(inferBuilderMapping(product)).toEqual(inferBuilderMapping(product))
  })

  test('uses shape and dimensions embedded in legacy description text', () => {
    expect(
      inferBuilderMapping({
        description: 'Natural carved opal measuring 7.5 x 7.5 x 2 mm',
        name: 'Coober Pedy heart opal',
      })
    ).toMatchObject({
      builderRecommendedStyle: 'coral',
      builderSilhouette: 'heart',
    })

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
    expect(
      createBuilderSourceImageHash([
        { image: { id: 7, filename: 'opal.jpg', updatedAt: '2026-07-12' } },
        { image: 'unrelated-new-gallery-image' },
      ])
    ).toBe(first)
  })

  test('uses the same source identity for an id and its populated Payload relationship', () => {
    const relationship = createBuilderSourceImageHash([{ image: 7 }])
    const populated = createBuilderSourceImageHash([
      {
        image: {
          id: 7,
          filename: 'opal.jpg',
          focalX: 62,
          focalY: 44,
          updatedAt: '2026-07-12',
          url: '/api/media/file/opal.jpg',
        },
      },
    ])

    expect(populated).toBe(relationship)
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

  test('maps the explicitly selected gallery image instead of always using the hero image', () => {
    expect(
      inferBuilderMapping({
        builderMappedImageIndex: 1,
        images: [{ image: { focalX: 20, focalY: 30 } }, { image: { focalX: 64, focalY: 47 } }],
        name: 'Oval opal',
      })
    ).toMatchObject({
      builderPhotoFocalX: 0.64,
      builderPhotoFocalY: 0.47,
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

  test('derives builder eligibility from approval and a mapped source image', () => {
    const approved = applyBuilderMappingLifecycle(
      { builderEligible: false, builderMappingStatus: 'reviewed' },
      {
        builderMappingStatus: 'pending',
        category: 'raw-opals',
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )
    const pending = applyBuilderMappingLifecycle(
      { builderEligible: true, builderMappingStatus: 'pending' },
      {
        category: 'raw-opals',
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(approved.builderEligible).toBe(true)
    expect(pending.builderEligible).toBe(false)
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
      builderContourCandidate: null,
      builderEligible: false,
      builderMappingStatus: 'stale',
    })
    expect(changed.builderMappingInputHash).not.toBe(original.builderMappingInputHash)
    expect(changed.builderMappingSourceImageHash).not.toBe(original.builderMappingSourceImageHash)
  })

  test('requeues gallery analysis without invalidating a reviewed active source', () => {
    const original = applyBuilderMappingLifecycle(
      {
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'active-media' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      undefined,
      now
    )
    const reviewed = {
      ...original,
      builderContourCandidate: { radii: Array.from({ length: 72 }, () => 1), version: 1 },
      builderEligible: true,
      builderMappingAnalyzedImageHash: 'analysed-source',
      builderMappingStatus: 'reviewed',
      builderPhotoAnalysisConfidence: 0.91,
      builderPhotoAnalysisVersion: 3,
      builderPhotoCandidateImageIndex: 0,
    }

    const changed = applyBuilderMappingLifecycle(
      { images: [{ image: 'active-media' }, { image: 'new-gallery-media' }] },
      reviewed,
      '2026-07-13T12:00:00.000Z'
    )

    expect(changed).toMatchObject({
      builderContourCandidate: null,
      builderEligible: true,
      builderMappingAnalyzedImageHash: null,
      builderMappingStatus: 'reviewed',
      builderPhotoAnalysisConfidence: null,
      builderPhotoAnalysisVersion: null,
      builderPhotoCandidateImageIndex: null,
    })
    expect(changed.builderMappingInputHash).toBe(original.builderMappingInputHash)
    expect(changed.builderMappingSourceImageHash).toBe(original.builderMappingSourceImageHash)
  })

  test('refreshes inferred crop suggestions when the source image changes', () => {
    const changed = applyBuilderMappingLifecycle(
      { images: [{ image: { filename: 'replacement.jpg', focalX: 72, focalY: 31 } }] },
      {
        builderMappingInputHash: 'old-input',
        builderMappingMode: 'inferred',
        builderMappingStatus: 'reviewed',
        builderMappingVersion: BUILDER_MAPPING_VERSION,
        builderPhotoFocalX: 0.5,
        builderPhotoFocalY: 0.5,
        builderPhotoZoom: 3.2,
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'old-media' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(changed).toMatchObject({
      builderContourCandidate: null,
      builderMappingAnalyzedImageHash: null,
      builderMappingMode: 'inferred',
      builderMappingStatus: 'stale',
      builderPhotoAnalysisVersion: null,
      builderPhotoAnalysisConfidence: null,
      builderPhotoCandidateImageIndex: null,
      builderPhotoFocalX: 0.72,
      builderPhotoFocalY: 0.31,
    })
  })

  test('preserves manual crop values when their source image changes', () => {
    const original = {
      builderMappingInputHash: 'old-input',
      builderMappingMode: 'manual',
      builderMappingStatus: 'manual',
      builderMappingVersion: BUILDER_MAPPING_VERSION,
      builderPhotoFocalX: 0.41,
      builderPhotoFocalY: 0.62,
      builderPhotoZoom: 4.7,
      category: 'raw-opals',
      dimensions: { depth: 2, length: 9, width: 6 },
      images: [{ image: 'old-media' }],
      name: 'Oval white opal',
      slug: 'white-opal',
      stoneType: 'white-opal',
    }
    const changed = applyBuilderMappingLifecycle(
      { images: [{ image: { filename: 'replacement.jpg', focalX: 72, focalY: 31 } }] },
      original,
      now
    )

    expect({ ...original, ...changed }).toMatchObject({
      builderMappingMode: 'manual',
      builderMappingStatus: 'stale',
      builderPhotoFocalX: 0.41,
      builderPhotoFocalY: 0.62,
      builderPhotoZoom: 4.7,
    })
  })

  test('establishes a v5 hash baseline without invalidating a preserved reviewed mapping', () => {
    const result = applyBuilderMappingLifecycle(
      { stock: 1 },
      {
        builderMappingInputHash: null,
        builderMappingMode: 'manual',
        builderMappingStatus: 'reviewed',
        builderMappingVersion: BUILDER_MAPPING_VERSION,
        builderPhotoFocalX: 0.41,
        builderPhotoFocalY: 0.62,
        builderPhotoZoom: 4.7,
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(result).toMatchObject({
      builderMappingMode: 'manual',
      builderMappingStatus: 'reviewed',
      builderMappingVersion: BUILDER_MAPPING_VERSION,
    })
    expect(result.builderMappingInputHash).toMatch(/^[0-9a-f]{16}$/)
    expect(result).not.toHaveProperty('builderPhotoFocalX')
  })

  test('records analyzed-image provenance when an admin adopts a contour', () => {
    const contour = { version: 1, radii: Array.from({ length: 96 }, () => 1) }
    const result = applyBuilderMappingLifecycle(
      { builderContour: contour, builderMappingStatus: 'manual' },
      {
        builderMappingAnalyzedImageHash: 'source-sha-256',
        builderMappingMode: 'inferred',
        builderMappingStatus: 'pending',
        builderMappingVersion: BUILDER_MAPPING_VERSION,
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(result.builderContour).toBe(contour)
    expect(result.builderContourSourceImageHash).toBe('source-sha-256')
    expect(result.builderMappingMode).toBe('manual')
  })

  test('preserves explicit contour provenance from the automatic analyzer', () => {
    const contour = { version: 1, radii: Array.from({ length: 96 }, () => 1) }
    const result = applyBuilderMappingLifecycle(
      {
        builderContour: contour,
        builderContourSourceImageHash: 'new-source-sha-256',
        builderMappingAnalyzedImageHash: 'new-source-sha-256',
      },
      {
        builderMappingAnalyzedImageHash: 'old-source-sha-256',
        builderMappingMode: 'inferred',
        builderMappingStatus: 'pending',
        builderMappingVersion: BUILDER_MAPPING_VERSION,
        category: 'raw-opals',
        dimensions: { depth: 2, length: 9, width: 6 },
        images: [{ image: 'media-1' }],
        name: 'Oval white opal',
        slug: 'white-opal',
        stoneType: 'white-opal',
      },
      now
    )

    expect(result.builderContourSourceImageHash).toBe('new-source-sha-256')
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

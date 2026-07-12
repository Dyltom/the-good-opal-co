import { describe, expect, test } from 'vitest'
import {
  applyBuilderMappingLifecycle,
  builderMappingNeedsReview,
  BUILDER_MAPPING_VERSION,
  createBuilderSourceImageHash,
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

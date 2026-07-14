import { describe, expect, test } from 'vitest'
import { validateRingDesignReference } from '../ring-design-reference'

const completeReferences = ['top', 'three-quarter', 'profile', 'underside'].map((view) => ({
  assetPath: `/references/gemini-${view}.jpg`,
  sourceType: 'calibrated-capture',
  view,
}))

const completeMeasurements = {
  headDepthMm: 4.2,
  headLengthMm: 10.8,
  headWidthMm: 8.8,
  measurementMethod: 'calipers',
  shankDepthMm: 1.4,
  shankWidthMm: 1.8,
  stoneLengthMm: 10,
  stoneWidthMm: 8,
}

describe('ring design reference governance', () => {
  test('allows incomplete evidence to remain a draft', () => {
    expect(
      validateRingDesignReference({
        sourceReferences: [
          {
            assetPath: '/images/products/20210819_101941.jpg',
            sourceType: 'product-gallery',
            view: 'three-quarter',
          },
        ],
        status: 'draft',
      })
    ).toBe(true)

    expect(validateRingDesignReference({ status: 'draft' })).toBe(true)
  })

  test('rejects a published design without explicit maker approval', () => {
    expect(
      validateRingDesignReference({
        sourceReferences: completeReferences,
        status: 'published',
      })
    ).toBe('A maker must approve this design before it can be published')
  })

  test('rejects product photography presented as calibrated model evidence', () => {
    expect(
      validateRingDesignReference({
        approvalNotes: 'Checked against the physical master ring.',
        approvedAt: '2026-07-14T00:00:00.000Z',
        makerApproved: true,
        measurements: completeMeasurements,
        modelDefinition: { source: 'hybrid', version: 'gemini-v2' },
        sourceReferences: completeReferences.map((reference, index) =>
          index === 0 ? { ...reference, sourceType: 'product-gallery' } : reference
        ),
        status: 'published',
      })
    ).toBe('Published designs may only claim fidelity from calibrated reference captures')
  })

  test('accepts a measured, versioned, fully photographed maker-approved design', () => {
    expect(
      validateRingDesignReference({
        approvalNotes: 'Checked against the physical master ring.',
        approvedAt: '2026-07-14T00:00:00.000Z',
        makerApproved: true,
        measurements: completeMeasurements,
        modelDefinition: { source: 'hybrid', version: 'gemini-v2' },
        sourceReferences: completeReferences,
        status: 'published',
      })
    ).toBe(true)
  })
})

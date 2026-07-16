import { describe, expect, test } from 'vitest'
import { CANONICAL_FACE_TEXTURE_VERSION } from '../canonical-face-texture'
import { BUILDER_PHOTO_PIPELINE_VERSION } from '../mapping-version'
import { resolveCanonicalFaceMapping } from '../canonical-face-mapping'

const contour = {
  radii: Array.from({ length: 96 }, () => 1),
  version: 1,
}
const hash = 'a'.repeat(64)
const approved = {
  builderContour: contour,
  builderContourSourceImageHash: hash,
  builderMappingAnalyzedImageHash: hash,
  builderMappingStatus: 'reviewed',
  builderPhotoAnalysisConfidence: 0.96,
  builderPhotoAnalysisVersion: BUILDER_PHOTO_PIPELINE_VERSION,
  builderPhotoFocalX: 0.48,
  builderPhotoFocalY: 0.52,
  builderPhotoRotation: 3,
  builderPhotoZoom: 4.2,
}

describe('canonical face mapping', () => {
  test('creates a stable URL from the complete approved mapping tuple', () => {
    const resolved = resolveCanonicalFaceMapping(52, approved, 0.75)
    expect(resolved).toMatchObject({
      analysis: {
        confidence: 0.96,
        focalX: 0.48,
        focalY: 0.52,
        rotation: 3,
        source: 'image',
        stoneAspect: 0.75,
        zoom: 4.2,
      },
      identity: { generatorVersion: CANONICAL_FACE_TEXTURE_VERSION },
      sourceImageHash: hash,
      url: expect.stringMatching(/^\/api\/builder\/opal-face\/v1\/52\/[a-f0-9]{64}$/),
    })
  })

  test.each([
    { builderMappingStatus: 'pending' },
    { builderPhotoAnalysisConfidence: 0.89 },
    { builderPhotoAnalysisVersion: BUILDER_PHOTO_PIPELINE_VERSION - 1 },
    { builderContourSourceImageHash: 'b'.repeat(64) },
    { builderContour: null },
    { builderPhotoZoom: null },
  ])('rejects incomplete, stale, or unreviewed fields: %o', (change) => {
    expect(resolveCanonicalFaceMapping(52, { ...approved, ...change }, 0.75)).toBeUndefined()
  })
})

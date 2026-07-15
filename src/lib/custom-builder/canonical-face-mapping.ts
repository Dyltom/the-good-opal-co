import { parseBuilderPhotoCrop } from '@/lib/product-validation'
import {
  CANONICAL_FACE_TEXTURE_VERSION,
  createCanonicalFaceTextureIdentity,
  type CanonicalFaceTextureIdentity,
} from './canonical-face-texture'
import { OPAL_PHOTO_ANALYSIS_VERSION, type OpalPhotoAnalysis } from './photo-analysis'
import { parseBuilderStoneContour } from './stone-contour'

export interface CanonicalFaceMappingFields {
  builderContour?: unknown
  builderContourSourceImageHash?: string | null
  builderMappingAnalyzedImageHash?: string | null
  builderMappingStatus?: string | null
  builderPhotoAnalysisConfidence?: number | null
  builderPhotoAnalysisVersion?: number | null
  builderPhotoFocalX?: number | null
  builderPhotoFocalY?: number | null
  builderPhotoRotation?: number | null
  builderPhotoZoom?: number | null
}

export interface ResolvedCanonicalFaceMapping {
  analysis: OpalPhotoAnalysis
  identity: CanonicalFaceTextureIdentity
  sourceImageHash: string
  url: string
}

const sha256Pattern = /^[a-f0-9]{64}$/i

/**
 * Resolves only a current, approved image/contour/crop tuple. A fallback shape,
 * stale source hash, or unreviewed candidate never receives a canonical URL.
 */
export function resolveCanonicalFaceMapping(
  productId: string | number,
  fields: CanonicalFaceMappingFields,
  stoneAspect: number
): ResolvedCanonicalFaceMapping | undefined {
  const approved =
    fields.builderMappingStatus === 'reviewed' || fields.builderMappingStatus === 'manual'
  const contour = parseBuilderStoneContour(fields.builderContour)
  const crop = parseBuilderPhotoCrop(
    fields.builderPhotoFocalX,
    fields.builderPhotoFocalY,
    fields.builderPhotoZoom,
    fields.builderPhotoRotation
  )
  const confidence = fields.builderPhotoAnalysisConfidence
  const analyzedHash = fields.builderMappingAnalyzedImageHash?.toLowerCase()
  const contourHash = fields.builderContourSourceImageHash?.toLowerCase()

  if (
    !approved ||
    !contour ||
    !crop ||
    fields.builderPhotoAnalysisVersion !== OPAL_PHOTO_ANALYSIS_VERSION ||
    typeof confidence !== 'number' ||
    !Number.isFinite(confidence) ||
    confidence < 0.9 ||
    confidence > 1 ||
    !analyzedHash ||
    !sha256Pattern.test(analyzedHash) ||
    contourHash !== analyzedHash ||
    !Number.isFinite(stoneAspect) ||
    stoneAspect <= 0
  ) {
    return undefined
  }

  const analysis: OpalPhotoAnalysis = {
    confidence,
    contour,
    focalX: crop.focalX,
    focalY: crop.focalY,
    rotation: crop.rotation ?? 0,
    source: 'image',
    stoneAspect,
    zoom: crop.zoom,
  }
  const identity = createCanonicalFaceTextureIdentity({
    analysis,
    generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
    sourceImageHash: analyzedHash,
  })
  if (!identity) return undefined

  return {
    analysis,
    identity,
    sourceImageHash: analyzedHash,
    url: `/api/builder/opal-face/v${CANONICAL_FACE_TEXTURE_VERSION}/${encodeURIComponent(String(productId))}/${identity.inputHash}`,
  }
}

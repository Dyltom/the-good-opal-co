import { CANONICAL_FACE_TEXTURE_VERSION } from './canonical-face-texture'
import { OPAL_PHOTO_ANALYSIS_VERSION } from './photo-analysis'

/**
 * Stored analysis readiness covers both contour analysis and the durable face
 * generator. Either implementation version changing must re-run the worker,
 * without invalidating a human-approved jewellery mapping.
 */
export const BUILDER_PHOTO_PIPELINE_VERSION =
  OPAL_PHOTO_ANALYSIS_VERSION * 100 + CANONICAL_FACE_TEXTURE_VERSION

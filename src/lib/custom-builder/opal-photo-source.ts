import type { BuilderOpal } from '@/components/custom-builder/config'

export interface BuilderOpalPhotoSource {
  crop?: {
    focalX: number
    focalY: number
    rotation?: number
    zoom: number
  }
  kind: 'canonical-face' | 'listing-photo'
  url: string
}

export interface BuilderOpalPhotoSamplingDimensions {
  height: number
  width: number
}

const canonicalCrop = {
  focalX: 0.5,
  focalY: 0.5,
  rotation: 0,
  zoom: 1,
} as const

/**
 * One image/crop contract shared by the CSS workbench and WebGL renderer.
 * Canonical faces are already rectified into stone coordinates; applying the
 * original listing crop a second time would shift the colour off the stone.
 */
export function getBuilderOpalPhotoSource(opal: BuilderOpal): BuilderOpalPhotoSource {
  if (opal.visual.canonicalFace) {
    return {
      crop: canonicalCrop,
      kind: 'canonical-face',
      url: opal.visual.canonicalFace.url,
    }
  }

  return {
    crop: opal.visual.textureCrop,
    kind: 'listing-photo',
    url: opal.imageUrl,
  }
}

/**
 * Canonical textures use square pixels for storage but their coordinates are
 * already the stone's normalized X/Y space. Presenting their raw 1:1 pixel
 * aspect to the crop math would letterbox elongated stones and move the face.
 */
export function getBuilderOpalPhotoSamplingDimensions(
  source: BuilderOpalPhotoSource,
  actual: BuilderOpalPhotoSamplingDimensions,
  stoneAspect: number
): BuilderOpalPhotoSamplingDimensions {
  if (source.kind !== 'canonical-face') return actual
  return {
    height: 1,
    width: Number.isFinite(stoneAspect) && stoneAspect > 0 ? stoneAspect : 1,
  }
}

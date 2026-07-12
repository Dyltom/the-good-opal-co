export interface PhotoCropFocus {
  focalX: number
  focalY: number
  zoom: number
}

export interface PhotoPlacementAdjustment {
  opalPositionX: number
  opalPositionY: number
  opalScale: number
  opalRotation: number
}

export interface NormalizedPhotoCrop {
  height: number
  left: number
  top: number
  width: number
}

export interface PhotoTextureTransform {
  offsetX: number
  offsetY: number
  repeatX: number
  repeatY: number
}

/**
 * Rotating a rectangular photo inside a fixed stone aperture exposes its
 * corners unless the source is enlarged. This returns the minimum scale that
 * keeps the aperture covered for the given rotation and aspect ratio.
 */
export function rotationCoverScale(stoneAspect: number, rotationDegrees: number): number {
  if (stoneAspect <= 0) return 1

  const radians = (Math.abs(rotationDegrees % 180) * Math.PI) / 180
  const sine = Math.abs(Math.sin(radians))
  const cosine = Math.abs(Math.cos(radians))

  return Math.max(cosine + sine / stoneAspect, cosine + sine * stoneAspect)
}

/**
 * Converts a top-left image crop into Three.js texture coordinates. Three
 * rotates around texture centre, so offsets are expressed relative to 0.5.
 */
export function computePhotoTextureTransform(
  crop: NormalizedPhotoCrop,
  stoneAspect: number,
  rotationDegrees: number
): PhotoTextureTransform {
  const coverScale = rotationCoverScale(stoneAspect, rotationDegrees)

  return {
    offsetX: crop.left + crop.width / 2 - 0.5,
    offsetY: 0.5 - crop.top - crop.height / 2,
    repeatX: crop.width / coverScale,
    repeatY: crop.height / coverScale,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function applyPhotoPlacement(
  crop: PhotoCropFocus,
  placement?: PhotoPlacementAdjustment
): PhotoCropFocus {
  if (!placement) return crop

  return {
    focalX: clamp(crop.focalX + placement.opalPositionX, 0, 1),
    focalY: clamp(crop.focalY + placement.opalPositionY, 0, 1),
    zoom: clamp(crop.zoom * placement.opalScale, 1, 12),
  }
}

/**
 * Returns one normalized source-image rectangle for both CSS and Three.js.
 * The rectangle keeps the photographed face centred without stretching it.
 */
export function computePhotoCrop(
  imageWidth: number,
  imageHeight: number,
  stoneAspect: number,
  crop: PhotoCropFocus
): NormalizedPhotoCrop {
  if (imageWidth <= 0 || imageHeight <= 0 || stoneAspect <= 0 || crop.zoom < 1) {
    return { left: 0, top: 0, width: 1, height: 1 }
  }

  const imageAspect = imageWidth / imageHeight
  let width = Math.min(1, 1 / crop.zoom)
  let height = width * (imageAspect / stoneAspect)

  if (height > 1) {
    height = 1
    width = Math.min(1, height * (stoneAspect / imageAspect))
  }

  return {
    left: clamp(crop.focalX - width / 2, 0, 1 - width),
    top: clamp(crop.focalY - height / 2, 0, 1 - height),
    width,
    height,
  }
}

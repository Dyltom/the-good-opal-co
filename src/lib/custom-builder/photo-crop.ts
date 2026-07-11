export interface PhotoCropFocus {
  focalX: number
  focalY: number
  zoom: number
}

export interface NormalizedPhotoCrop {
  height: number
  left: number
  top: number
  width: number
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
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

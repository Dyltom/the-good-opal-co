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
  matrix: readonly [number, number, number, number, number, number]
  offsetX: number
  offsetY: number
  repeatX: number
  repeatY: number
}

const placementPositionLimit = 0.45
const placementScaleLimit = 2.25
const maximumCustomerRotation = 45
const maximumTextureZoom = 12

export function getPhotoPlacementScaleMax(baseZoom: number): number {
  return Math.max(1, Math.min(placementScaleLimit, 12 / Math.max(1, baseZoom)))
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
 * Limits customer rotation before an elongated photo would need more source
 * magnification than the builder's audited 12x ceiling. The source's reviewed
 * orientation remains intact; this governs only the optional colour adjustment.
 */
export function getPhotoPlacementRotationLimit(
  stoneAspect: number,
  baseZoom: number,
  placementScale: number
): number {
  if (stoneAspect <= 0 || baseZoom < 1 || placementScale < 1) return 0
  const availableCoverScale = maximumTextureZoom / (baseZoom * placementScale)
  if (availableCoverScale <= 1) return 0
  if (rotationCoverScale(stoneAspect, maximumCustomerRotation) <= availableCoverScale) {
    return maximumCustomerRotation
  }

  let lower = 0
  let upper = maximumCustomerRotation
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const middle = (lower + upper) / 2
    if (rotationCoverScale(stoneAspect, middle) <= availableCoverScale) lower = middle
    else upper = middle
  }
  return Math.floor(lower * 10) / 10
}

export function constrainPhotoPlacementRotation(
  stoneAspect: number,
  baseZoom: number,
  placementScale: number,
  rotationDegrees: number
): number {
  const limit = getPhotoPlacementRotationLimit(stoneAspect, baseZoom, placementScale)
  return clamp(rotationDegrees, -limit, limit)
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
  const normalizedAspect = stoneAspect > 0 ? stoneAspect : 1
  const coverScale = rotationCoverScale(normalizedAspect, rotationDegrees)
  const repeatX = crop.width / coverScale
  const repeatY = crop.height / coverScale
  const offsetX = crop.left + crop.width / 2 - 0.5
  const offsetY = 0.5 - crop.top - crop.height / 2
  // CSS rotates the source photograph in physical pixels. A plain Three.js
  // texture rotation instead turns normalized UVs, which distorts the angle on
  // non-square stones. These aspect-corrected cross terms keep editor and 3D
  // sampling identical.
  const radians = (-rotationDegrees * Math.PI) / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const m00 = repeatX * cosine
  const m01 = (repeatX * sine) / normalizedAspect
  const m10 = -repeatY * sine * normalizedAspect
  const m11 = repeatY * cosine
  const sourceCentreX = 0.5 + offsetX
  const sourceCentreY = 0.5 + offsetY

  return {
    matrix: [m00, m01, sourceCentreX - (m00 + m01) / 2, m10, m11, sourceCentreY - (m10 + m11) / 2],
    offsetX,
    offsetY,
    repeatX,
    repeatY,
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
    // Placement describes the photographed colour moving inside the stone,
    // while a crop focal point moves in the opposite direction.
    focalX: clamp(crop.focalX - placement.opalPositionX, 0, 1),
    focalY: clamp(crop.focalY - placement.opalPositionY, 0, 1),
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

/**
 * Moves the photographed stone across every available source pixel without
 * dead zones at either end of the UI range. A positive placement moves the
 * visible photographed detail right/down, so the sampled source centre moves
 * left/up by the corresponding fraction of its remaining travel.
 */
export function computePlacedPhotoCrop(
  imageWidth: number,
  imageHeight: number,
  stoneAspect: number,
  crop: PhotoCropFocus,
  placement?: PhotoPlacementAdjustment
): NormalizedPhotoCrop {
  const positionX = clamp((placement?.opalPositionX ?? 0) / placementPositionLimit, -1, 1)
  const positionY = clamp((placement?.opalPositionY ?? 0) / placementPositionLimit, -1, 1)
  const scaledFocus = {
    ...crop,
    // Panning must never change magnification behind the customer's back.
    // At 1× the reviewed crop is locked; explicit zoom creates safe travel
    // inside that same approved face region.
    zoom: clamp(crop.zoom * (placement?.opalScale ?? 1), 1, 12),
  }
  const base = computePhotoCrop(imageWidth, imageHeight, stoneAspect, scaledFocus)
  if (!placement) return base

  const safe = computePhotoCrop(imageWidth, imageHeight, stoneAspect, crop)
  const minimumX = safe.left + base.width / 2
  const maximumX = safe.left + safe.width - base.width / 2
  const minimumY = safe.top + base.height / 2
  const maximumY = safe.top + safe.height - base.height / 2
  const baseX = clamp(crop.focalX, minimumX, maximumX)
  const baseY = clamp(crop.focalY, minimumY, maximumY)
  const centreX =
    positionX >= 0
      ? baseX - positionX * (baseX - minimumX)
      : baseX + -positionX * (maximumX - baseX)
  const centreY =
    positionY >= 0
      ? baseY - positionY * (baseY - minimumY)
      : baseY + -positionY * (maximumY - baseY)

  return {
    left: centreX - base.width / 2,
    top: centreY - base.height / 2,
    width: base.width,
    height: base.height,
  }
}

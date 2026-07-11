import type { BuilderOpal, RingConfig } from './config'

export type StoneDimensions = readonly [width: number, height: number]
export type CameraVector = readonly [x: number, y: number, z: number]

export interface CabochonDepthProfile {
  baseZ: number
  domeHeight: number
  girdleZ: number
}

export interface RingMeasurements {
  centreRadius: number
  outerRadius: number
}

export interface RingModelBounds {
  bottom: number
  top: number
}

export const settingRotationX = -Math.PI / 2

export const stoneDimensions: Record<RingConfig['shape'], StoneDimensions> = {
  round: [0.42, 0.42],
  oval: [0.4, 0.5],
  elongated: [0.35, 0.62],
  cushion: [0.5, 0.5],
  pear: [0.4, 0.5],
}

export const cameraPositions: Record<'three-quarter' | 'front' | 'profile', CameraVector> = {
  'three-quarter': [4.2, 4.4, 2.4],
  front: [0, 5.8, 0],
  profile: [0, 0.8, 5.8],
}

export const cameraUpVectors: Record<'three-quarter' | 'front' | 'profile', CameraVector> = {
  'three-quarter': [0, 0, -1],
  // The setting rotation maps its local long axis to world -Z. Keeping -Z as
  // screen-up avoids the near-parallel Y-up singularity in the face-on view.
  front: [0, 0, -1],
  profile: [0, 1, 0],
}

export function getPortraitFramingScale(width: number, height: number): number {
  const aspectRatio = width / Math.max(1, height)
  return Math.min(1.7, Math.max(1, 0.92 / aspectRatio))
}

export function getCameraPosition(
  view: keyof typeof cameraPositions,
  viewportWidth: number,
  viewportHeight: number
): CameraVector {
  const scale = getPortraitFramingScale(viewportWidth, viewportHeight)
  const [x, y, z] = cameraPositions[view]
  return [x * scale, y * scale, z * scale]
}

export function rotateSettingVectorToWorld(vector: CameraVector): CameraVector {
  const [x, y, z] = vector
  const cosine = Math.cos(settingRotationX)
  const sine = Math.sin(settingRotationX)
  return [x, y * cosine - z * sine, y * sine + z * cosine]
}

function subtract(left: CameraVector, right: CameraVector): CameraVector {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

function dot(left: CameraVector, right: CameraVector): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
}

function cross(left: CameraVector, right: CameraVector): CameraVector {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ]
}

function normalise(vector: CameraVector): CameraVector {
  const length = Math.hypot(...vector)
  if (length === 0) throw new Error('Cannot normalise a zero-length vector')
  return [vector[0] / length, vector[1] / length, vector[2] / length]
}

export function projectWorldAxisToView(
  axis: CameraVector,
  cameraPosition: CameraVector,
  target: CameraVector,
  cameraUp: CameraVector
): { horizontal: number; vertical: number; depth: number } {
  const forward = normalise(subtract(target, cameraPosition))
  const horizontal = normalise(cross(forward, cameraUp))
  const vertical = normalise(cross(horizontal, forward))

  return {
    horizontal: dot(axis, horizontal),
    vertical: dot(axis, vertical),
    depth: dot(axis, forward),
  }
}

export function getRingMeasurements(config: RingConfig): RingMeasurements {
  const insideDiameterMm = 11.63 + 0.8128 * config.size
  const innerRadius = insideDiameterMm / 20
  const radialThickness = 0.085
  const centreRadius = innerRadius + radialThickness
  const outerRadius = centreRadius + radialThickness
  return { centreRadius, outerRadius }
}

export function getStoneDimensions(
  config: RingConfig,
  selectedOpal?: BuilderOpal
): StoneDimensions {
  const [width, defaultHeight] = stoneDimensions[config.shape]
  if (!selectedOpal || selectedOpal.visual.evidence !== 'catalogue') {
    return [width, defaultHeight]
  }
  const compatibleShape =
    selectedOpal.visual.silhouette === config.shape ||
    (selectedOpal.visual.silhouette === 'elongated' && config.shape === 'oval')
  if (!compatibleShape) return [width, defaultHeight]
  if (selectedOpal.visual.dimensionsMm) {
    return [
      selectedOpal.visual.dimensionsMm.width * 0.05,
      selectedOpal.visual.dimensionsMm.length * 0.05,
    ]
  }
  return [width, Math.min(0.72, Math.max(width, width * selectedOpal.visual.aspectRatio))]
}

export function outlinePoint(
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  offset = 0
): readonly [number, number] {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const adjustedWidth = width + offset
  const adjustedHeight = height + offset

  if (shape === 'cushion') {
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.5) * adjustedWidth,
      Math.sign(sine) * Math.pow(Math.abs(sine), 0.5) * adjustedHeight,
    ]
  }
  if (shape === 'elongated') {
    // Queensland pipe opals read as rounded capsules with straighter sides,
    // not stretched ellipses.
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.62) * adjustedWidth,
      Math.sign(sine) * Math.pow(Math.abs(sine), 0.62) * adjustedHeight,
    ]
  }
  if (shape === 'pear') {
    const taper = 0.15 + 0.85 * Math.pow((sine + 1) / 2, 0.65)
    // Normalise the taper so documented width remains the true rendered width.
    const pearWidthCorrection = 1.321
    return [cosine * adjustedWidth * taper * pearWidthCorrection, sine * adjustedHeight]
  }
  return [cosine * adjustedWidth, sine * adjustedHeight]
}

export function evenlySpacedOutlinePoints(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  count: number
): readonly { key: number; x: number; y: number }[] {
  const samples = Array.from({ length: 361 }, (_, index) => {
    const angle = (index / 360) * Math.PI * 2
    const [x, y] = outlinePoint(shape, angle, width, height, offset)
    return { x, y }
  })
  const distances = [0]
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1]!
    const current = samples[index]!
    distances.push(
      (distances[index - 1] ?? 0) + Math.hypot(current.x - previous.x, current.y - previous.y)
    )
  }
  const perimeter = distances.at(-1) ?? 0
  return Array.from({ length: count }, (_, index) => {
    const target = (index / count) * perimeter
    const sampleIndex = distances.findIndex((distance) => distance >= target)
    const point = samples[Math.max(0, sampleIndex)] ?? samples[0]!
    return { key: index, ...point }
  })
}

export function getCabochonDepthProfile(
  width: number,
  height: number,
  depthMm?: number
): CabochonDepthProfile {
  const girdleZ = 0.028
  const totalDepth = depthMm ? depthMm * 0.1 : Math.min(width, height) * 0.38
  const domeHeight = totalDepth * 0.58
  // Most loose-stone depth is hidden inside the handmade cup once set.
  const visibleSeatDepth = Math.min(totalDepth - domeHeight, 0.07)

  return {
    baseZ: girdleZ - visibleSeatDepth,
    domeHeight,
    girdleZ,
  }
}

export function getSettingPlacement(config: RingConfig, selectedOpal?: BuilderOpal) {
  const [stoneWidth, stoneHeight] = getStoneDimensions(config, selectedOpal)
  const measurements = getRingMeasurements(config)
  const depthProfile = getCabochonDepthProfile(
    stoneWidth,
    stoneHeight,
    selectedOpal?.visual.dimensionsMm?.depth
  )
  const settingBottom = depthProfile.baseZ - 0.012
  const settingY = measurements.outerRadius - settingBottom

  return {
    depthProfile,
    measurements,
    settingBottom,
    settingY,
    stoneDimensions: [stoneWidth, stoneHeight] as StoneDimensions,
  }
}

export function getRingModelBounds(
  config: RingConfig,
  selectedOpal?: BuilderOpal
): RingModelBounds {
  const { depthProfile, measurements, settingY } = getSettingPlacement(config, selectedOpal)
  return {
    bottom: -measurements.outerRadius,
    top: settingY + depthProfile.girdleZ + depthProfile.domeHeight,
  }
}

export function getRingFramingTarget(config: RingConfig, selectedOpal?: BuilderOpal): CameraVector {
  const bounds = getRingModelBounds(config, selectedOpal)
  return [0, (bounds.top + bounds.bottom) / 2, 0]
}

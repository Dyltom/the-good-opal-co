import { CatmullRomCurve3, CurvePath, LineCurve3, Vector3 } from 'three'
import {
  ringStyleGeometryProfiles,
  type BezelLipProfileKnot,
  type BuilderOpal,
  type RingConfig,
} from './config'
import { contourRadiusAt, type BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'

export type StoneDimensions = readonly [width: number, height: number]
export type CameraVector = readonly [x: number, y: number, z: number]

export interface CabochonDepthProfile {
  baseZ: number
  domeHeight: number
  girdleZ: number
}

// Two hundredths of a millimetre: enough overlap to avoid a visible light gap
// without making the bezel appear to cut materially into the opal.
export const bezelLipCompression = 0.002

export const opalSettleDurationSeconds = 0.32
// One scene unit is 10 mm. Keep the approach inside the formed bezel instead
// of lifting the entire stone above its rim. The previous clear-the-crown drop
// exposed a dark air band and read as a floating sticker in top and profile
// views. Two tenths of a millimetre still communicates the final seating move.
export const opalSettleApproachLift = 0.02

export interface OpalSettleTransform {
  offsetZ: number
  settled: boolean
}

/**
 * Settles a newly selected opal along the setting normal. Its face footprint
 * stays identical to the fitted bezel throughout, preventing a temporary gap
 * between the selected contour and its setting.
 */
export function getOpalSettleTransform(
  elapsedSeconds: number,
  startOffset: number,
  reduceMotion = false
): OpalSettleTransform {
  if (reduceMotion) return { offsetZ: 0, settled: true }

  const progress = Math.min(1, Math.max(0, elapsedSeconds / opalSettleDurationSeconds))
  // Smootherstep preserves the physical read of a stone being guided into its
  // seat. The previous ease-out completed 87.5% of the travel by halfway, which
  // looked like a snap followed by a nearly static tail.
  const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10)

  return {
    offsetZ: Math.max(0, startOffset) * (1 - eased),
    settled: progress >= 1,
  }
}

export function getOpalSettleStartOffset(
  depthProfile: CabochonDepthProfile,
  bezelTop: number
): number {
  const availableSeatDepth = Math.max(0, bezelTop - depthProfile.baseZ)
  return Math.min(opalSettleApproachLift, availableSeatDepth)
}

export interface RingMeasurements {
  centreRadius: number
  outerRadius: number
}

export interface RingModelBounds {
  bottom: number
  top: number
}

export interface RingShankLandmarks {
  arcEnd: CameraVector
  arcStart: CameraVector
  endAngle: number
  joinLeft: CameraVector
  joinRight: CameraVector
  landingLeft: CameraVector
  landingRight: CameraVector
  startAngle: number
  transitionLeft: CameraVector
  transitionRight: CameraVector
}

export interface ProfiledBezelLipRing {
  finish: BezelLipProfileKnot['finish']
  point: StoneDimensions
  z: number
}

export interface HaloSupportContourPoint {
  inner: StoneDimensions
  outer: StoneDimensions
}

/**
 * Granulation follows a stone's broad silhouette, not image-mask noise below
 * grain scale. This preserves large lobes and points while keeping the halo
 * physically placeable around approved photographed contours.
 */
export function getHaloStoneContour(
  contour?: BuilderStoneContourV1
): BuilderStoneContourV1 | undefined {
  if (!contour) return undefined

  // Nineteen weighted samples is the smallest window that keeps every
  // parser-valid compound contour physically granular in deterministic fuzz
  // coverage; the exact bezel still follows all 96 source samples.
  const smoothingRadius = 9
  return {
    version: contour.version,
    radii: contour.radii.map((_, index) => {
      let weightedRadius = 0
      let totalWeight = 0
      for (let offset = -smoothingRadius; offset <= smoothingRadius; offset += 1) {
        const weight = smoothingRadius + 1 - Math.abs(offset)
        const sourceIndex = (index + offset + contour.radii.length) % contour.radii.length
        weightedRadius += contour.radii[sourceIndex]! * weight
        totalWeight += weight
      }
      return weightedRadius / totalWeight
    }),
  }
}

export const settingRotationX = -Math.PI / 2

export const stoneDimensions: Record<RingConfig['shape'], StoneDimensions> = {
  round: [0.42, 0.42],
  oval: [0.4, 0.5],
  elongated: [0.35, 0.62],
  cushion: [0.5, 0.5],
  pear: [0.4, 0.5],
  heart: [0.5, 0.5],
}

export const cameraPositions: Record<'three-quarter' | 'front' | 'profile', CameraVector> = {
  'three-quarter': [3.2, 5.8, 3],
  // Sold face-on photographs show one slim shoulder on each side of the head.
  // Keep only enough elevation to retain a soft edge highlight; the previous
  // 0.45 elevation exposed both shank faces as two horizontal rails.
  front: [0, 5.8, 0.2],
  // The old end-on profile collapsed the ring into a vertical stick and turned
  // the opal sideways. This oblique side elevation keeps the stone upright,
  // reveals cup depth, and shows enough of the shank loop to read as a ring.
  profile: [5.8, 2.6, 1.8],
}

export const cameraUpVectors: Record<'three-quarter' | 'front' | 'profile', CameraVector> = {
  'three-quarter': [0, 0, -1],
  // The setting rotation maps its local long axis to world -Z. Keeping -Z as
  // screen-up avoids the near-parallel Y-up singularity in the face-on view.
  front: [0, 0, -1],
  profile: [0, 0, -1],
}

interface ContourBounds {
  bottom: number
  left: number
  right: number
  top: number
}

const contourBoundsCache = new WeakMap<BuilderStoneContourV1, ContourBounds>()

function contourBounds(contour: BuilderStoneContourV1): ContourBounds {
  const cached = contourBoundsCache.get(contour)
  if (cached) return cached

  const bounds = contour.radii.reduce<ContourBounds>(
    (current, radius, index) => {
      const angle = (index / contour.radii.length) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      return {
        bottom: Math.min(current.bottom, y),
        left: Math.min(current.left, x),
        right: Math.max(current.right, x),
        top: Math.max(current.top, y),
      }
    },
    { bottom: Number.POSITIVE_INFINITY, left: Number.POSITIVE_INFINITY, right: 0, top: 0 }
  )
  contourBoundsCache.set(contour, bounds)
  return bounds
}

function normalizedContourPoint(
  contour: BuilderStoneContourV1,
  angle: number
): readonly [number, number] {
  const radius = contourRadiusAt(contour, angle)
  const rawX = Math.cos(angle) * radius
  const rawY = Math.sin(angle) * radius
  const bounds = contourBounds(contour)
  const width = bounds.right - bounds.left || 1
  const height = bounds.top - bounds.bottom || 1
  return [((rawX - bounds.left) / width) * 2 - 1, ((rawY - bounds.bottom) / height) * 2 - 1]
}

export function getPortraitFramingScale(width: number, height: number): number {
  const aspectRatio = width / Math.max(1, height)
  // Portrait canvases still need extra distance for the full shank, but the
  // old 1.7 cap reduced the jewellery to a thumbnail on phones. A 1.32 cap
  // keeps the three-quarter loop clear while making the stone inspectable.
  return Math.min(1.32, Math.max(1, 0.72 / aspectRatio))
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
  // RingScene uses one scene unit per 10 mm and shankDepth as the radial
  // half-thickness. Deriving the centreline from the selected sold style keeps
  // the requested inside diameter exact instead of silently adding 0.5-0.7 mm.
  const radialThickness = ringStyleGeometryProfiles[config.style].shankDepth
  const centreRadius = innerRadius + radialThickness
  const outerRadius = centreRadius + radialThickness
  return { centreRadius, outerRadius }
}

export function getStoneDimensions(
  config: RingConfig,
  selectedOpal?: BuilderOpal
): StoneDimensions {
  const [width, defaultHeight] = stoneDimensions[config.shape]
  if (
    !selectedOpal ||
    selectedOpal.selectionKind !== 'individual' ||
    selectedOpal.visual.evidence !== 'catalogue'
  ) {
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
  const desiredHeight = Math.max(width, width * selectedOpal.visual.aspectRatio)
  const scale = Math.min(1, 0.72 / desiredHeight)
  return [width * scale, desiredHeight * scale]
}

export function getRenderableOpalDepthMm(selectedOpal?: BuilderOpal): number | undefined {
  const dimensions = selectedOpal?.visual.dimensionsMm
  if (
    !selectedOpal ||
    selectedOpal.selectionKind !== 'individual' ||
    selectedOpal.visual.evidence !== 'catalogue' ||
    !dimensions
  ) {
    return undefined
  }

  // Catalogue dimensions sometimes describe parcels or rough depth. A set
  // cabochon cannot plausibly stand taller than three quarters of its narrow
  // face, so cap bad legacy data before it produces a tower-like preview.
  return Math.min(dimensions.depth, Math.min(dimensions.width, dimensions.length) * 0.75)
}

function baseOutlinePoint(
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  contour?: BuilderStoneContourV1
): readonly [number, number] {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)

  if (contour) {
    const [x, y] = normalizedContourPoint(contour, angle)
    return [x * width, y * height]
  }

  if (shape === 'cushion') {
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.34) * width,
      Math.sign(sine) * Math.pow(Math.abs(sine), 0.34) * height,
    ]
  }
  if (shape === 'elongated') {
    // Queensland pipe opals read as rounded capsules with straighter sides,
    // not stretched ellipses.
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.62) * width,
      Math.sign(sine) * Math.pow(Math.abs(sine), 0.62) * height,
    ]
  }
  if (shape === 'pear') {
    // Sold Aurora and catalogue teardrops keep a broad lower body until the
    // final point. A conventional exponential pear pinches the lower diagonal
    // to 37% of half-width; the photographed pieces sit around 53–61%.
    const taper = 0.925 + 0.2 * sine + 0.045 * sine * sine
    // Normalise the quadratic so documented width remains the true extent.
    const pearWidthCorrection = 1.055_526_961_712_104_8
    const finalTipProgress = Math.min(1, Math.max(0, (-sine - 0.72) / 0.28))
    const smoothTipProgress = finalTipProgress * finalTipProgress * (3 - 2 * finalTipProgress)
    const tipTaper = 1 - smoothTipProgress * 0.4
    return [cosine * width * taper * pearWidthCorrection * tipTaper, sine * height]
  }
  if (shape === 'heart') {
    // The catalogue hearts are hand-carved with a broad body, shallow notch,
    // and softly tapering point. A classic mathematical heart is too pinched
    // and leaves photographed background visible around the real stone face.
    const upperHalf = Math.max(0, sine)
    const lowerHalf = Math.max(0, -sine)
    const notch = 0.22 * Math.exp(-Math.pow(cosine / 0.2, 2)) * upperHalf
    const positiveYScale = sine > 0 ? 1 / 0.932 : 1
    const taper = 1 - 0.42 * Math.pow(lowerHalf, 1.35)
    return [cosine * width * taper, (sine - notch) * positiveYScale * height]
  }
  return [cosine * width, sine * height]
}

export function outlinePoint(
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  offset = 0,
  contour?: BuilderStoneContourV1
): readonly [number, number] {
  const point = baseOutlinePoint(shape, angle, width, height, contour)
  if (offset === 0) return point

  // Expand along the local surface normal. Scaling both axes by `offset`
  // makes superellipse corners visibly thicker than their sides, especially
  // on Coral's squared cushion. A sampled tangent keeps every setting wall a
  // physically consistent width across all supported silhouettes.
  const epsilon = 0.0001
  const before = baseOutlinePoint(shape, angle - epsilon, width, height, contour)
  const after = baseOutlinePoint(shape, angle + epsilon, width, height, contour)
  const tangentX = after[0] - before[0]
  const tangentY = after[1] - before[1]
  const length = Math.hypot(tangentX, tangentY) || 1
  let normalX = tangentY / length
  let normalY = -tangentX / length
  if (normalX * point[0] + normalY * point[1] < 0) {
    normalX *= -1
    normalY *= -1
  }

  return [point[0] + normalX * offset, point[1] + normalY * offset]
}

const soldStyleOuterVariation: Record<RingConfig['style'], number> = {
  gemini: 0.003,
  coral: 0.005,
  'sun-moon': 0.003,
  aurora: 0.001,
}

export function getSoldStyleOuterVariation(style: RingConfig['style'], angle: number): number {
  const amplitude = soldStyleOuterVariation[style]
  if (style === 'gemini') {
    return amplitude * (Math.sin(angle * 3 + 0.35) * 0.68 + Math.sin(angle * 5 - 0.2) * 0.32)
  }
  if (style === 'coral') {
    return amplitude * (Math.cos(angle * 4 + 0.18) * 0.56 + Math.sin(angle * 3 - 0.4) * 0.44)
  }
  if (style === 'sun-moon') {
    return amplitude * (Math.sin(angle * 5 + 0.2) * 0.72 + Math.sin(angle * 3) * 0.28)
  }
  return amplitude * (Math.sin(angle * 3 + 0.5) * 0.64 + Math.sin(angle * 7 - 0.2) * 0.36)
}

/**
 * Adds the bounded handmade signature visible in each sold setting to metal
 * outside the stone. Variation travels only along the opal's local normal, so
 * it cannot twist or displace the selected stone boundary.
 */
export function soldStyleOutlinePoint(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  offset = 0,
  contour?: BuilderStoneContourV1
): readonly [number, number] {
  return outlinePoint(
    shape,
    angle,
    width,
    height,
    offset + getSoldStyleOuterVariation(style, angle),
    contour
  )
}

export function getBezelWallContourPoints(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  offset: number,
  thickness: number,
  contour?: BuilderStoneContourV1
): { inner: StoneDimensions; outer: StoneDimensions } {
  return {
    inner: outlinePoint(shape, angle, width, height, offset - thickness / 2, contour),
    outer: soldStyleOutlinePoint(
      style,
      shape,
      angle,
      width,
      height,
      offset + thickness / 2,
      contour
    ),
  }
}

/**
 * Samples a style-specific bezel crown without changing the exact stone seat
 * or the already reviewed outer head envelope. The first ring follows the
 * cabochon contact surface; every later knot describes the filed crown.
 */
export function getProfiledBezelLipRings({
  angle,
  contour,
  depthProfile,
  height,
  innerOffset,
  outerOffset,
  profile,
  shape,
  style,
  topZ,
  width,
}: {
  angle: number
  contour?: BuilderStoneContourV1
  depthProfile: CabochonDepthProfile
  height: number
  innerOffset: number
  outerOffset: number
  profile: readonly BezelLipProfileKnot[]
  shape: RingConfig['shape']
  style: RingConfig['style']
  topZ: number
  width: number
}): readonly ProfiledBezelLipRing[] {
  const inner = outlinePoint(shape, angle, width, height, innerOffset, contour)
  const outer = soldStyleOutlinePoint(style, shape, angle, width, height, outerOffset, contour)
  const contactZ = getBezelLipContactZ(shape, angle, width, height, inner, depthProfile, contour)

  return profile.map((knot, index) => ({
    finish: knot.finish,
    point: [
      inner[0] + (outer[0] - inner[0]) * knot.radialProgress,
      inner[1] + (outer[1] - inner[1]) * knot.radialProgress,
    ],
    z: index === 0 ? contactZ : topZ + knot.heightOffset,
  }))
}

function ellipseRadiusAtAngle(
  bead: HandmadeBeadPoint,
  beadRadius: number,
  worldAngle: number
): number {
  const localAngle = worldAngle - bead.rotation
  const semiX = Math.max(0.0001, beadRadius * bead.size * bead.stretchX)
  const semiY = Math.max(0.0001, beadRadius * bead.size * bead.stretchY)
  const cosine = Math.cos(localAngle)
  const sine = Math.sin(localAngle)
  return (semiX * semiY) / Math.hypot(semiY * cosine, semiX * sine)
}

/** Distance between neighbouring varied grain surfaces in scene units. */
export function getHaloBeadSurfaceGap(
  left: HandmadeBeadPoint,
  right: HandmadeBeadPoint,
  beadRadius: number
): number {
  const deltaX = right.x - left.x
  const deltaY = right.y - left.y
  const distance = Math.hypot(deltaX, deltaY)
  if (distance === 0) return -beadRadius * (left.size + right.size)

  const direction = Math.atan2(deltaY, deltaX)
  return (
    distance -
    ellipseRadiusAtAngle(left, beadRadius, direction) -
    ellipseRadiusAtAngle(right, beadRadius, direction + Math.PI)
  )
}

/**
 * Builds the scalloped solder web visible between individual halo grains.
 * Crests sit beneath each varied grain; valleys pull inward between grains.
 */
export function getGrainDerivedHaloSupportOutline({
  beadRadius,
  beads,
  bezelOuterOffset,
  contour,
  haloContour,
  coverage,
  haloOffset,
  valleyCoverage,
  height,
  shape,
  style,
  width,
}: {
  beadRadius: number
  beads: readonly HandmadeBeadPoint[]
  bezelOuterOffset: number
  contour?: BuilderStoneContourV1
  haloContour?: BuilderStoneContourV1
  coverage: number
  haloOffset: number
  valleyCoverage: number
  height: number
  shape: RingConfig['shape']
  style: RingConfig['style']
  width: number
}): readonly HaloSupportContourPoint[] {
  if (beads.length === 0 || coverage <= 0) return []

  const result: HaloSupportContourPoint[] = []
  const keepOutsideBezel = (
    inner: StoneDimensions,
    candidate: StoneDimensions
  ): StoneDimensions => {
    const innerRadius = Math.hypot(inner[0], inner[1])
    const candidateRadius = Math.hypot(candidate[0], candidate[1])
    if (candidateRadius > innerRadius) return candidate

    const angle = Math.atan2(candidate[1], candidate[0])
    const radius = innerRadius + 0.001
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  }
  beads.forEach((bead, index) => {
    const next = beads[(index + 1) % beads.length]!
    const crestAngle = Math.atan2(bead.y, bead.x)
    const crestDirection: StoneDimensions = [Math.cos(crestAngle), Math.sin(crestAngle)]
    const crestReach = ellipseRadiusAtAngle(bead, beadRadius, crestAngle) * coverage
    const crestOuter: StoneDimensions = [
      bead.x + crestDirection[0] * crestReach,
      bead.y + crestDirection[1] * crestReach,
    ]
    const crestInner = soldStyleOutlinePoint(
      style,
      shape,
      crestAngle,
      width,
      height,
      bezelOuterOffset,
      contour
    )
    result.push({ inner: crestInner, outer: keepOutsideBezel(crestInner, crestOuter) })

    const midpointX = bead.x + next.x
    const midpointY = bead.y + next.y
    const valleyAngle = Math.atan2(midpointY, midpointX)
    // The sold Sun & Moon and Aurora settings show a continuous solder web
    // between neighbouring grains. Carry the support through each valley far
    // enough to join the flattened bead backs without filling the visible
    // scallop between their outer faces.
    const valleyOuter = soldStyleOutlinePoint(
      style,
      shape,
      valleyAngle,
      width,
      height,
      haloOffset + beadRadius * coverage * valleyCoverage,
      haloContour ?? contour
    )
    const valleyInner = soldStyleOutlinePoint(
      style,
      shape,
      valleyAngle,
      width,
      height,
      bezelOuterOffset,
      contour
    )
    result.push({ inner: valleyInner, outer: keepOutsideBezel(valleyInner, valleyOuter) })
  })
  return result
}

/** D-shaped forged band: softened flat finger-side, curved exterior. */
export function getDShankCrossSection(
  angle: number,
  outerPower: number,
  innerFacePower: number
): { axial: number; radial: number } {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const radialPower = cosine >= 0 ? innerFacePower : outerPower
  return {
    radial: Math.sign(cosine) * Math.pow(Math.abs(cosine), radialPower),
    axial: Math.sign(sine) * Math.pow(Math.abs(sine), outerPower),
  }
}

export interface RingShankCapTopology {
  endCenterIndex: number
  indices: readonly number[]
  startCenterIndex: number
}

/**
 * Closes the two ends of the custom shank mesh. The first fan faces opposite
 * the curve tangent and the second faces with it, keeping both solder landings
 * solid when a setting does not completely occlude their end faces.
 */
export function getRingShankCapTopology(
  tubularSegments: number,
  radialSegments: number
): RingShankCapTopology {
  const ringVertexCount = (tubularSegments + 1) * radialSegments
  const startCenterIndex = ringVertexCount
  const endCenterIndex = ringVertexCount + 1
  const endRingStart = tubularSegments * radialSegments
  const indices: number[] = []

  for (let side = 0; side < radialSegments; side += 1) {
    const nextSide = (side + 1) % radialSegments
    indices.push(
      startCenterIndex,
      nextSide,
      side,
      endCenterIndex,
      endRingStart + side,
      endRingStart + nextSide
    )
  }

  return { endCenterIndex, indices, startCenterIndex }
}

/**
 * Samples the same radial cabochon surface used by RingScene at the bezel's
 * inner edge. This lets the lip follow every supported silhouette instead of
 * floating at one fixed height or intersecting low crowns.
 */
export function getBezelLipContactZ(
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  innerPoint: StoneDimensions,
  depthProfile: CabochonDepthProfile,
  contour?: BuilderStoneContourV1
): number {
  const targetAngle = Math.atan2(innerPoint[1], innerPoint[0])
  const sampleCount = 192
  const sampleStep = (Math.PI * 2) / sampleCount
  let bestAngle = angle
  let bestError = Number.POSITIVE_INFINITY

  const alignmentError = (candidateAngle: number) => {
    const boundary = outlinePoint(shape, candidateAngle, width, height, 0, contour)
    const boundaryAngle = Math.atan2(boundary[1], boundary[0])
    return Math.abs(
      Math.atan2(Math.sin(boundaryAngle - targetAngle), Math.cos(boundaryAngle - targetAngle))
    )
  }

  // Normal offsets are not radial for ellipses, asymmetric contours, pears,
  // or hearts. Find the cabochon parameter whose radial mesh line passes
  // through the lip point, then refine it to sub-segment accuracy.
  for (let index = 0; index < sampleCount; index += 1) {
    const candidateAngle = (index / sampleCount) * Math.PI * 2
    const error = alignmentError(candidateAngle)
    if (error < bestError) {
      bestAngle = candidateAngle
      bestError = error
    }
  }

  let lower = bestAngle - sampleStep
  let upper = bestAngle + sampleStep
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const first = lower + (upper - lower) / 3
    const second = upper - (upper - lower) / 3
    if (alignmentError(first) <= alignmentError(second)) upper = second
    else lower = first
  }

  const boundary = outlinePoint(shape, (lower + upper) / 2, width, height, 0, contour)
  const boundaryRadius = Math.hypot(boundary[0], boundary[1])
  const radialProgress = Math.min(
    1,
    Math.max(0, boundaryRadius > 0 ? Math.hypot(innerPoint[0], innerPoint[1]) / boundaryRadius : 1)
  )
  const surfaceZ =
    depthProfile.girdleZ +
    depthProfile.domeHeight * Math.pow(Math.max(0, 1 - radialProgress ** 2), 0.72)

  return surfaceZ - bezelLipCompression
}

export function getSettingOuterHalfWidth(
  config: Pick<RingConfig, 'setting' | 'shape' | 'style'>,
  dimensions: StoneDimensions,
  contour?: BuilderStoneContourV1
): number {
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  if (config.setting === 'beaded') {
    const haloContour = getHaloStoneContour(contour)
    const beadCount = getStyleBeadCount(
      config.style,
      config.shape,
      width,
      height,
      haloContour
    )
    const variedBeads = applyHandmadeBeadVariation(
      evenlySpacedOutlinePoints(
        config.shape,
        width,
        height,
        profile.haloOffset,
        beadCount,
        profile.haloPhase,
        config.style,
        haloContour
      ),
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )
    const beads = fuseContactingHaloBeads(
      coalesceOverlappingHaloBeads(variedBeads, profile.beadRadius),
      profile.beadRadius
    )
    return beads.reduce(
      (maximum, bead) =>
        Math.max(
          maximum,
          Math.abs(bead.x) + profile.beadRadius * bead.size * Math.max(bead.stretchX, bead.stretchY)
        ),
      0
    )
  }

  const outerOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
  return Array.from({ length: 720 }, (_, index) => {
    const angle = (index / 720) * Math.PI * 2
    return Math.abs(
      soldStyleOutlinePoint(
        config.style,
        config.shape,
        angle,
        width,
        height,
        outerOffset,
        contour
      )[0]
    )
  }).reduce((maximum, value) => Math.max(maximum, value), 0)
}

/**
 * Returns the structural cup width used to bury the shank shoulders beneath
 * the setting. Halo beads are decorative and sit outside this footprint;
 * anchoring shoulders to their tips makes the head appear detached in profile.
 */
export function getSettingShoulderHalfWidth(
  config: Pick<RingConfig, 'shape' | 'style'>,
  dimensions: StoneDimensions,
  contour?: BuilderStoneContourV1
): number {
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  const structuralOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2

  return Array.from({ length: 720 }, (_, index) => {
    const angle = (index / 720) * Math.PI * 2
    return Math.abs(
      soldStyleOutlinePoint(
        config.style,
        config.shape,
        angle,
        width,
        height,
        structuralOffset,
        contour
      )[0]
    )
  }).reduce((maximum, value) => Math.max(maximum, value), 0)
}

export function getRingShankLandmarks({
  radius,
  settingBaseY,
  settingHalfWidth,
  shoulderJoinDrop,
  shoulderLandingLengthMm,
  shoulderTransition,
  shoulderUnderlap,
}: {
  radius: number
  settingBaseY: number
  settingHalfWidth: number
  shoulderJoinDrop: number
  shoulderLandingLengthMm: number
  shoulderTransition: number
  shoulderUnderlap: number
}): RingShankLandmarks {
  const requestedJoinX = Math.max(0.05, settingHalfWidth - shoulderUnderlap)
  const joinX = Math.min(radius * 0.82, requestedJoinX)
  const requestedLandingX = joinX + shoulderLandingLengthMm / 10
  // Keep the short horizontal landing beneath the structural cup. This gives
  // the soldered join a flush face without exposing the shank's end cap.
  const landingX = Math.min(
    radius * 0.84,
    Math.max(joinX, Math.min(requestedLandingX, settingHalfWidth - 0.01))
  )
  const arcX = Math.min(radius * 0.88, landingX + shoulderTransition)
  const upperArcAngle = Math.acos(Math.min(0.92, Math.max(-0.92, arcX / radius)))
  const startAngle = Math.PI - upperArcAngle
  const endAngle = Math.PI * 2 + upperArcAngle
  const joinY = settingBaseY - shoulderJoinDrop
  const arcY = Math.sqrt(Math.max(0, radius * radius - arcX * arcX))
  const joinLeft: CameraVector = [-joinX, joinY, 0]
  const joinRight: CameraVector = [joinX, joinY, 0]
  const landingLeft: CameraVector = [-landingX, joinY, 0]
  const landingRight: CameraVector = [landingX, joinY, 0]
  const arcStart: CameraVector = [-arcX, arcY, 0]
  const arcEnd: CameraVector = [arcX, arcY, 0]
  const transitionProgress = 0.48
  const transitionLeft: CameraVector = [
    landingLeft[0] + (arcStart[0] - landingLeft[0]) * transitionProgress,
    landingLeft[1] + (arcStart[1] - landingLeft[1]) * transitionProgress,
    0,
  ]
  const transitionRight: CameraVector = [-transitionLeft[0], transitionLeft[1], 0]

  return {
    arcEnd,
    arcStart,
    endAngle,
    joinLeft,
    joinRight,
    landingLeft,
    landingRight,
    startAngle,
    transitionLeft,
    transitionRight,
  }
}

export function getRingShankPathPoints(
  options: Parameters<typeof getRingShankLandmarks>[0],
  arcSegments = 96
): readonly CameraVector[] {
  const landmarks = getRingShankLandmarks(options)
  const ringPoints = Array.from({ length: arcSegments + 1 }, (_, index) => {
    const angle =
      landmarks.startAngle + ((landmarks.endAngle - landmarks.startAngle) * index) / arcSegments
    return [options.radius * Math.cos(angle), options.radius * Math.sin(angle), 0] as CameraVector
  })

  return [
    landmarks.joinLeft,
    landmarks.landingLeft,
    landmarks.transitionLeft,
    ...ringPoints,
    landmarks.transitionRight,
    landmarks.landingRight,
    landmarks.joinRight,
  ]
}

/**
 * Keeps both solder landings truly flat, then blends them into one smooth
 * centripetal shoulder and circular shank. A single Catmull curve pulls flat
 * endpoint segments upward by a few hundredths of a millimetre.
 */
export function getRingShankCurve(
  options: Parameters<typeof getRingShankLandmarks>[0],
  arcSegments = 96
): CurvePath<Vector3> {
  const points = getRingShankPathPoints(options, arcSegments).map((point) => new Vector3(...point))
  const curve = new CurvePath<Vector3>()
  curve.add(new LineCurve3(points[0]!, points[1]!))
  curve.add(new CatmullRomCurve3(points.slice(1, -1), false, 'centripetal'))
  curve.add(new LineCurve3(points.at(-2)!, points.at(-1)!))
  return curve
}

/**
 * Converts an arc-length position on the shank to its shoulder taper progress.
 * Three.js `getPointAt` uses arc-length progress, so this remains a physical
 * millimetre measurement across ring sizes and stone-head proportions.
 */
export function getShoulderBlendProgress(
  curveProgress: number,
  curveLength: number,
  shoulderBlendLengthMm: number
): number {
  if (shoulderBlendLengthMm <= 0) return 1
  const clampedProgress = Math.min(1, Math.max(0, curveProgress))
  const endpointDistanceMm = Math.min(clampedProgress, 1 - clampedProgress) * curveLength * 10
  return Math.min(1, endpointDistanceMm / shoulderBlendLengthMm)
}

/**
 * Deterministic low-contrast tone variation for the forged shank surface.
 * Values stay close to one so tarnish breaks the perfect PBR highlight without
 * changing the selected metal colour or obscuring the ring silhouette.
 */
export function getForgedMetalTone(curveProgress: number, crossSectionProgress: number): number {
  const along = Math.min(1, Math.max(0, curveProgress))
  const around = Math.min(1, Math.max(0, crossSectionProgress))
  return (
    0.96 +
    Math.sin(along * Math.PI * 10 + 0.35) * 0.02 +
    Math.sin(around * Math.PI * 6 + along * Math.PI * 2 - 0.4) * 0.01
  )
}

/** Tarnish variation observed across individually soldered halo grains. */
export function getSolderGrainTone(key: number, organic: boolean): number {
  return organic ? 0.82 + ((key * 11) % 7) * 0.045 : 0.84 + ((key * 7) % 5) * 0.03
}

export function cssSilhouetteClipPath(
  shape: RingConfig['shape'],
  contour?: BuilderStoneContourV1
): string | undefined {
  if (!contour && shape !== 'heart' && shape !== 'pear') return undefined

  const pointCount = contour?.radii.length ?? 72
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2
    const [x, y] = outlinePoint(shape, angle, 1, 1, 0, contour)
    const cssX = Math.round((x + 1) * 50_000) / 1000
    const cssY = Math.round((1 - y) * 50_000) / 1000
    return `${cssX}% ${cssY}%`
  })
  return `polygon(${points.join(',')})`
}

export function evenlySpacedOutlinePoints(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  count: number,
  startAngle = 0,
  style?: RingConfig['style'],
  contour?: BuilderStoneContourV1
): readonly { key: number; x: number; y: number }[] {
  const samples = Array.from({ length: 361 }, (_, index) => {
    const angle = startAngle + (index / 360) * Math.PI * 2
    const [x, y] = style
      ? soldStyleOutlinePoint(style, shape, angle, width, height, offset, contour)
      : outlinePoint(shape, angle, width, height, offset, contour)
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
    const upperIndex = Math.max(1, sampleIndex)
    const lowerIndex = upperIndex - 1
    const lower = samples[lowerIndex] ?? samples[0]!
    const upper = samples[upperIndex] ?? samples.at(-1)!
    const lowerDistance = distances[lowerIndex] ?? 0
    const upperDistance = distances[upperIndex] ?? lowerDistance
    const span = upperDistance - lowerDistance
    const progress = span > 0 ? (target - lowerDistance) / span : 0
    return {
      key: index,
      x: lower.x + (upper.x - lower.x) * progress,
      y: lower.y + (upper.y - lower.y) * progress,
    }
  })
}

export function adaptiveOutlinePointCount(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  pitchMm: number,
  style?: RingConfig['style'],
  contour?: BuilderStoneContourV1
): number {
  if (pitchMm <= 0) return 0
  const samples = 720
  let perimeter = 0
  const pointAt = (angle: number) =>
    style
      ? soldStyleOutlinePoint(style, shape, angle, width, height, offset, contour)
      : outlinePoint(shape, angle, width, height, offset, contour)
  let previous = pointAt(0)
  for (let index = 1; index <= samples; index += 1) {
    const point = pointAt((index / samples) * Math.PI * 2)
    perimeter += Math.hypot(point[0] - previous[0], point[1] - previous[1])
    previous = point
  }
  // Ring geometry uses 1 scene unit = 10 physical millimetres.
  return Math.max(12, Math.round((perimeter * 10) / pitchMm))
}

/**
 * Scales a photographed reference grain layout to a different natural-stone
 * perimeter without discarding the sold design's defining grain count.
 */
export function getStyleBeadCount(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  width: number,
  height: number,
  contour?: BuilderStoneContourV1
): number {
  const profile = ringStyleGeometryProfiles[style]
  if (profile.beadCount <= 0) return 0

  const referenceShape = style === 'aurora' ? 'pear' : 'oval'
  const [referenceWidth, referenceHeight] = stoneDimensions[referenceShape]
  const referenceAdaptiveCount = adaptiveOutlinePointCount(
    referenceShape,
    referenceWidth,
    referenceHeight,
    profile.haloOffset,
    profile.beadPitchMm,
    style
  )
  const adaptiveCount = adaptiveOutlinePointCount(
    shape,
    width,
    height,
    profile.haloOffset,
    profile.beadPitchMm,
    style,
    contour
  )

  return Math.max(12, Math.round((profile.beadCount * adaptiveCount) / referenceAdaptiveCount))
}

export interface HandmadeBeadPoint {
  flattening: number
  heightVariation: number
  key: number
  rotation: number
  size: number
  stretchX: number
  stretchY: number
  x: number
  y: number
}

/**
 * Concave silhouettes can fold two arc-length samples onto the same physical
 * spot. Keep one outward grain for that solder cluster instead of rendering a
 * stack of intersecting spheres in heart clefts or other tight indentations.
 * Ordinary handmade contact and slight solder overlap remain unchanged.
 */
export function coalesceOverlappingHaloBeads(
  beads: readonly HandmadeBeadPoint[],
  beadRadius: number,
  minimumGap = -0.012
): readonly HandmadeBeadPoint[] {
  if (beads.length < 2 || beadRadius <= 0) return beads

  return beads.filter((bead, index) => {
    const previous = beads[(index - 1 + beads.length) % beads.length]!
    const next = beads[(index + 1) % beads.length]!
    const duplicateThreshold = beadRadius * 0.5
    const beadRadiusFromOrigin = Math.hypot(bead.x, bead.y)
    const shouldKeepNearDuplicate = (other: HandmadeBeadPoint) => {
      const otherRadiusFromOrigin = Math.hypot(other.x, other.y)
      return (
        beadRadiusFromOrigin > otherRadiusFromOrigin ||
        (beadRadiusFromOrigin === otherRadiusFromOrigin && bead.key < other.key)
      )
    }
    if (
      Math.hypot(bead.x - previous.x, bead.y - previous.y) < duplicateThreshold &&
      !shouldKeepNearDuplicate(previous)
    ) {
      return false
    }
    if (
      Math.hypot(bead.x - next.x, bead.y - next.y) < duplicateThreshold &&
      !shouldKeepNearDuplicate(next)
    ) {
      return false
    }

    const incomingX = bead.x - previous.x
    const incomingY = bead.y - previous.y
    const outgoingX = next.x - bead.x
    const outgoingY = next.y - bead.y
    const pathReverses = incomingX * outgoingX + incomingY * outgoingY < 0
    if (!pathReverses) return true

    // Remove only a folded-back sample such as a heart cleft. Ordinary close
    // contact on a valid irregular opal contour must remain a grain, otherwise
    // a chain of removals can open a visible unsupported gap.
    return (
      getHaloBeadSurfaceGap(previous, bead, beadRadius) >= minimumGap &&
      getHaloBeadSurfaceGap(bead, next, beadRadius) >= minimumGap
    )
  })
}

/**
 * Files neighbouring halo grains into a continuous soldered crown. Width is
 * added along the local perimeter tangent, so the documented radial head
 * envelope and stone clearance remain unchanged.
 */
export function fuseContactingHaloBeads(
  beads: readonly HandmadeBeadPoint[],
  beadRadius: number,
  minimumOverlap = 0.006
): readonly HandmadeBeadPoint[] {
  if (beads.length < 2 || beadRadius <= 0) return beads

  let fused = beads.map((bead, index) => {
    const previous = beads[(index - 1 + beads.length) % beads.length]!
    const next = beads[(index + 1) % beads.length]!
    const previousDistance = Math.hypot(bead.x - previous.x, bead.y - previous.y)
    const nextDistance = Math.hypot(next.x - bead.x, next.y - bead.y)
    const requiredTangentialRadius =
      Math.max(previousDistance, nextDistance) / 2 + Math.max(0, minimumOverlap) / 2
    const requiredStretch = requiredTangentialRadius / (beadRadius * bead.size)
    const tangentAngle = Math.atan2(next.y - previous.y, next.x - previous.x)

    return {
      ...bead,
      rotation: tangentAngle,
      stretchX: Math.min(1.55, Math.max(bead.stretchX, requiredStretch)),
      stretchY: Math.min(1.04, bead.stretchY),
    }
  })

  // Equal arc spacing can still yield uneven straight-line pitch around an
  // accepted wavy contour. Relax tangential grain widths toward one soldered
  // seam. Locally reduce grain size only when a tight compound curve cannot
  // physically fit the sold grain diameter; this avoids one fused metal blob
  // without changing the opal seat or bezel.
  const targetGap = -Math.max(0, minimumOverlap)
  const minimumAllowedGap = -0.018
  for (let pass = 0; pass < 28; pass += 1) {
    const adjustments = Array.from({ length: fused.length }, () => 0)
    const adjustmentCounts = Array.from({ length: fused.length }, () => 0)
    const sizeScales = Array.from({ length: fused.length }, () => 1)

    fused.forEach((bead, index) => {
      const nextIndex = (index + 1) % fused.length
      const next = fused[nextIndex]!
      const gap = getHaloBeadSurfaceGap(bead, next, beadRadius)
      if (gap < minimumAllowedGap) {
        const distance = Math.hypot(next.x - bead.x, next.y - bead.y)
        const occupiedDistance = distance - gap
        const targetOccupiedDistance = distance - minimumAllowedGap
        const scale = Math.max(0.72, Math.min(1, targetOccupiedDistance / occupiedDistance))
        sizeScales[index] = Math.min(sizeScales[index]!, scale)
        sizeScales[nextIndex] = Math.min(sizeScales[nextIndex]!, scale)
        return
      }

      const error = gap - targetGap
      if (Math.abs(error) <= 0.0005) return

      const boundedError = Math.max(-0.025, Math.min(0.025, error))
      adjustments[index]! += (boundedError / (beadRadius * bead.size * 2)) * 0.42
      adjustments[nextIndex]! += (boundedError / (beadRadius * next.size * 2)) * 0.42
      adjustmentCounts[index]! += 1
      adjustmentCounts[nextIndex]! += 1
    })

    fused = fused.map((bead, index) => ({
      ...bead,
      size: Math.max(0.45, bead.size * sizeScales[index]!),
      stretchX: Math.min(
        1.55,
        Math.max(
          0.62,
          bead.stretchX + adjustments[index]! / Math.max(1, adjustmentCounts[index]!)
        )
      ),
    }))
  }

  return fused
}

export function applyHandmadeBeadVariation(
  points: readonly { key: number; x: number; y: number }[],
  variation = 1,
  baseFlattening = 0.72,
  asymmetry = 0
): readonly HandmadeBeadPoint[] {
  return points.map(({ key, x, y }) => {
    const size = 1 + (-0.06 + ((key * 5) % 7) * 0.022) * variation
    const flattening = baseFlattening + (((key * 3) % 5) - 2) * 0.0125 * variation
    const heightVariation = (((key * 11) % 5) - 2) * 0.0015 * variation
    const radialLength = Math.hypot(x, y) || 1
    const radialJitter = (((key * 11) % 9) - 4) * 0.0012 * variation
    const tangentJitter = (((key * 13) % 7) - 3) * 0.0008 * variation
    const baseStretchX = 1 + (((key * 7) % 5) - 2) * 0.022 * variation
    const baseStretchY = 1 + (((key * 9) % 7) - 3) * 0.016 * variation
    const maximumStretch = Math.max(baseStretchX, baseStretchY)
    const asymmetryPattern = 0.58 + (((key * 19) % 8) / 7) * 0.42
    const minorStretch = maximumStretch * Math.max(0.65, 1 - asymmetry * asymmetryPattern)
    const majorAlongX = (key * 7) % 5 < 2
    const stretchX = asymmetry > 0 ? (majorAlongX ? maximumStretch : minorStretch) : baseStretchX
    const stretchY = asymmetry > 0 ? (majorAlongX ? minorStretch : maximumStretch) : baseStretchY

    return {
      key,
      x: x + (x / radialLength) * radialJitter - (y / radialLength) * tangentJitter,
      y: y + (y / radialLength) * radialJitter + (x / radialLength) * tangentJitter,
      size,
      flattening,
      heightVariation,
      rotation: (((key * 17) % 29) / 29) * Math.PI * 2,
      stretchX,
      stretchY,
    }
  })
}

export function getCabochonDepthProfile(
  width: number,
  height: number,
  depthMm?: number,
  style?: RingConfig['style']
): CabochonDepthProfile {
  const girdleZ = 0.028
  const totalDepth = depthMm ? depthMm * 0.1 : Math.min(width, height) * 0.38
  const profile = style ? ringStyleGeometryProfiles[style] : undefined
  const styleDomeCap = profile
    ? Math.min(width, height) * 2 * profile.domeHeightRatio
    : Number.POSITIVE_INFINITY
  // A loose listing's total depth includes material hidden inside the cup.
  // Treating 58% of raw depth as exposed dome made deep opals tower above the
  // sold low-bezel designs. Cap both measured and reference stones to the
  // crown ratio observed for the selected sold collection design.
  const domeHeight = depthMm
    ? Math.min(totalDepth * 0.42, styleDomeCap, 0.18)
    : profile
      ? styleDomeCap
      : Math.min(width, height) * 0.22
  // Most loose-stone depth is hidden inside the handmade cup once set.
  const visibleSeatCap = profile?.visibleSeatCap ?? 0.08
  const visibleSeatDepth = Math.min(Math.max(totalDepth - domeHeight, 0), visibleSeatCap)

  return {
    baseZ: girdleZ - visibleSeatDepth,
    domeHeight,
    girdleZ,
  }
}

export function getPatinaGrooveProfile(
  girdleZ: number,
  seamRadius: number
): { bottomZ: number; thickness: number; topZ: number } {
  return {
    bottomZ: girdleZ - 0.008,
    thickness: Math.max(0.012, seamRadius * 1.5),
    topZ: girdleZ + 0.0005,
  }
}

export function getSettingPlacement(config: RingConfig, selectedOpal?: BuilderOpal) {
  const [stoneWidth, stoneHeight] = getStoneDimensions(config, selectedOpal)
  const measurements = getRingMeasurements(config)
  const depthProfile = getCabochonDepthProfile(
    stoneWidth,
    stoneHeight,
    getRenderableOpalDepthMm(selectedOpal),
    config.style
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

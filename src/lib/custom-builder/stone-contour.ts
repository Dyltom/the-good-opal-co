export const BUILDER_STONE_CONTOUR_VERSION = 1 as const
export const BUILDER_STONE_CONTOUR_SAMPLE_COUNT = 96

const minimumRadius = 0.35
const maximumRadius = 1.5
const maximumAdjacentDelta = 0.22
const maximumSecondDifference = 0.18
const minimumDirectionalExtent = 0.65
const maximumDirectionalExtent = 1.08

export interface BuilderStoneContourV1 {
  radii: number[]
  version: typeof BUILDER_STONE_CONTOUR_VERSION
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function circularAdjacentDelta(radii: readonly number[]): number {
  let maximum = 0
  for (let index = 0; index < radii.length; index += 1) {
    const next = radii[(index + 1) % radii.length]!
    maximum = Math.max(maximum, Math.abs(radii[index]! - next))
  }
  return maximum
}

function hasNormalizedDirectionalExtents(radii: readonly number[]): boolean {
  let left = 0
  let right = 0
  let bottom = 0
  let top = 0
  for (let index = 0; index < radii.length; index += 1) {
    const angle = (index / radii.length) * Math.PI * 2
    const x = Math.cos(angle) * radii[index]!
    const y = Math.sin(angle) * radii[index]!
    left = Math.min(left, x)
    right = Math.max(right, x)
    bottom = Math.min(bottom, y)
    top = Math.max(top, y)
  }
  return (
    left <= -minimumDirectionalExtent &&
    left >= -maximumDirectionalExtent &&
    right >= minimumDirectionalExtent &&
    right <= maximumDirectionalExtent &&
    bottom <= -minimumDirectionalExtent &&
    bottom >= -maximumDirectionalExtent &&
    top >= minimumDirectionalExtent &&
    top <= maximumDirectionalExtent
  )
}

function hasBoundedCurvature(radii: readonly number[]): boolean {
  return radii.every((radius, index) => {
    const previous = radii[(index - 1 + radii.length) % radii.length]!
    const next = radii[(index + 1) % radii.length]!
    return Math.abs(previous - radius * 2 + next) <= maximumSecondDifference
  })
}

/**
 * Parses the persisted contour boundary used by Payload and WebGL. Samples
 * start on the stone's positive X axis and continue counter-clockwise in a
 * normalized Y-up coordinate space. Physical width and length are applied by
 * the renderer, so the contour stores shape only.
 */
export function parseBuilderStoneContour(value: unknown): BuilderStoneContourV1 | undefined {
  if (!isRecord(value) || value.version !== BUILDER_STONE_CONTOUR_VERSION) return undefined
  if (!Array.isArray(value.radii) || value.radii.length !== BUILDER_STONE_CONTOUR_SAMPLE_COUNT) {
    return undefined
  }

  const radii: number[] = []
  for (const radius of value.radii) {
    if (
      typeof radius !== 'number' ||
      !Number.isFinite(radius) ||
      radius < minimumRadius ||
      radius > maximumRadius
    ) {
      return undefined
    }
    radii.push(radius)
  }
  if (circularAdjacentDelta(radii) > maximumAdjacentDelta) return undefined
  if (!hasBoundedCurvature(radii)) return undefined
  if (!hasNormalizedDirectionalExtents(radii)) return undefined

  return { version: BUILDER_STONE_CONTOUR_VERSION, radii }
}

export function validateBuilderStoneContour(value: unknown): true | string {
  if (value === null || value === undefined) return true
  return parseBuilderStoneContour(value)
    ? true
    : `Contour must use version ${BUILDER_STONE_CONTOUR_VERSION} with ${BUILDER_STONE_CONTOUR_SAMPLE_COUNT} finite radial samples`
}

export function contourRadiusAt(contour: BuilderStoneContourV1, angle: number): number {
  if (!Number.isFinite(angle)) return contour.radii[0] ?? 1

  const fullTurn = Math.PI * 2
  const normalized = ((angle % fullTurn) + fullTurn) % fullTurn
  const position = (normalized / fullTurn) * contour.radii.length
  const lowerIndex = Math.floor(position) % contour.radii.length
  const upperIndex = (lowerIndex + 1) % contour.radii.length
  const progress = position - Math.floor(position)
  const lower = contour.radii[lowerIndex] ?? 1
  const upper = contour.radii[upperIndex] ?? lower
  return lower + (upper - lower) * progress
}

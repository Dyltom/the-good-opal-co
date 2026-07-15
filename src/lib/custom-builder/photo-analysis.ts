import { rotationCoverScale } from './photo-crop'
import {
  BUILDER_STONE_CONTOUR_SAMPLE_COUNT,
  BUILDER_STONE_CONTOUR_VERSION,
  parseBuilderStoneContour,
  type BuilderStoneContourV1,
} from './stone-contour'

export const OPAL_PHOTO_ANALYSIS_VERSION = 4

export type OpalShapeHint = 'cushion' | 'elongated' | 'heart' | 'oval' | 'pear' | 'round'

export interface ReviewedOpalCropHint {
  focalX: number
  focalY: number
  rotation?: number
  zoom: number
}

export interface OpalRasterInput {
  channels?: 3 | 4
  data: ArrayLike<number>
  height: number
  reviewedCropHint?: ReviewedOpalCropHint
  shapeHint?: OpalShapeHint
  stoneAspect?: number
  width: number
}

export interface OpalPhotoAnalysis {
  confidence: number
  contour: BuilderStoneContourV1
  focalX: number
  focalY: number
  rotation: number
  source: 'canonical-fallback' | 'image'
  zoom: number
}

interface BorderColour {
  alpha: number
  blue: number
  green: number
  red: number
}

interface Component {
  indices: number[]
  maximumX: number
  maximumY: number
  minimumX: number
  minimumY: number
  touchesBorder: number
}

const maximumPixels = 16_000_000
const minimumContrast = 12 * 12
const fullTurn = Math.PI * 2

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function channelValue(data: ArrayLike<number>, index: number): number {
  return clamp(Number(data[index] ?? 0), 0, 255)
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  values.sort((left, right) => left - right)
  const middle = Math.floor(values.length / 2)
  const upper = values[middle] ?? 0
  if (values.length % 2 === 1) return upper
  return ((values[middle - 1] ?? upper) + upper) / 2
}

function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))] ?? 0
}

function inferChannels(input: OpalRasterInput, pixels: number): 3 | 4 | undefined {
  if (input.channels) {
    return input.data.length === pixels * input.channels ? input.channels : undefined
  }
  if (input.data.length === pixels * 4) return 4
  if (input.data.length === pixels * 3) return 3
  return undefined
}

function borderPixelIndices(width: number, height: number): number[] {
  const band = Math.max(1, Math.min(3, Math.floor(Math.min(width, height) / 24)))
  const indices: number[] = []
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < band || x >= width - band || y < band || y >= height - band) {
        indices.push(y * width + x)
      }
    }
  }
  return indices
}

function estimateBorderColour(
  data: ArrayLike<number>,
  channels: 3 | 4,
  indices: readonly number[]
): BorderColour {
  const red: number[] = []
  const green: number[] = []
  const blue: number[] = []
  const alpha: number[] = []
  for (const pixel of indices) {
    const offset = pixel * channels
    red.push(channelValue(data, offset))
    green.push(channelValue(data, offset + 1))
    blue.push(channelValue(data, offset + 2))
    alpha.push(channels === 4 ? channelValue(data, offset + 3) : 255)
  }
  return {
    red: median(red),
    green: median(green),
    blue: median(blue),
    alpha: median(alpha),
  }
}

function colourContrast(
  data: ArrayLike<number>,
  channels: 3 | 4,
  pixel: number,
  border: BorderColour
): number {
  const offset = pixel * channels
  const red = channelValue(data, offset) - border.red
  const green = channelValue(data, offset + 1) - border.green
  const blue = channelValue(data, offset + 2) - border.blue
  const alpha = (channels === 4 ? channelValue(data, offset + 3) : 255) - border.alpha
  return red * red + green * green + blue * blue + alpha * alpha
}

function findComponents(mask: Uint8Array, width: number, height: number): Component[] {
  const visited = new Uint8Array(mask.length)
  const queue = new Int32Array(mask.length)
  const components: Component[] = []

  for (let seed = 0; seed < mask.length; seed += 1) {
    if (mask[seed] === 0 || visited[seed] === 1) continue
    let read = 0
    let write = 0
    queue[write] = seed
    write += 1
    visited[seed] = 1
    const indices: number[] = []
    let minimumX = width
    let minimumY = height
    let maximumX = -1
    let maximumY = -1
    let touchesBorder = 0

    while (read < write) {
      const pixel = queue[read] ?? 0
      read += 1
      indices.push(pixel)
      const x = pixel % width
      const y = Math.floor(pixel / width)
      minimumX = Math.min(minimumX, x)
      maximumX = Math.max(maximumX, x)
      minimumY = Math.min(minimumY, y)
      maximumY = Math.max(maximumY, y)
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) touchesBorder += 1

      for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
        for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
          if (deltaX === 0 && deltaY === 0) continue
          const nextX = x + deltaX
          const nextY = y + deltaY
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue
          const next = nextY * width + nextX
          if (mask[next] === 0 || visited[next] === 1) continue
          visited[next] = 1
          queue[write] = next
          write += 1
        }
      }
    }

    components.push({
      indices,
      maximumX,
      maximumY,
      minimumX,
      minimumY,
      touchesBorder,
    })
  }

  return components
}

function componentCentroid(component: Component, width: number): readonly [number, number] {
  let totalX = 0
  let totalY = 0
  for (const pixel of component.indices) {
    totalX += (pixel % width) + 0.5
    totalY += Math.floor(pixel / width) + 0.5
  }
  return [totalX / component.indices.length, totalY / component.indices.length]
}

function selectComponent(
  components: readonly Component[],
  width: number,
  height: number
): Component | undefined {
  const minimumArea = Math.max(12, Math.ceil(width * height * 0.002))
  let selected: Component | undefined
  let selectedScore = -Infinity
  for (const component of components) {
    const area = component.indices.length
    if (area < minimumArea || component.touchesBorder / area > 0.18) continue
    const [centreX, centreY] = componentCentroid(component, width)
    const distance = Math.hypot((centreX / width - 0.5) * 2, (centreY / height - 0.5) * 2)
    const score = area / (1 + distance * distance * 3)
    if (score > selectedScore) {
      selected = component
      selectedScore = score
    }
  }
  return selected
}

function dilate(mask: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(mask.length)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x
      let foreground = 0
      for (let deltaY = -1; deltaY <= 1 && foreground === 0; deltaY += 1) {
        for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
          const sampleX = x + deltaX
          const sampleY = y + deltaY
          if (
            sampleX >= 0 &&
            sampleX < width &&
            sampleY >= 0 &&
            sampleY < height &&
            mask[sampleY * width + sampleX] === 1
          ) {
            foreground = 1
            break
          }
        }
      }
      result[index] = foreground
    }
  }
  return result
}

function erode(mask: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(mask.length)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let foreground = 1
      for (let deltaY = -1; deltaY <= 1 && foreground === 1; deltaY += 1) {
        for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
          if (mask[(y + deltaY) * width + x + deltaX] === 0) {
            foreground = 0
            break
          }
        }
      }
      result[y * width + x] = foreground
    }
  }
  return result
}

function cleanMask(mask: Uint8Array, width: number, height: number): Uint8Array {
  const closed = erode(dilate(mask, width, height), width, height)
  return dilate(erode(closed, width, height), width, height)
}

interface ContourExtraction {
  angularCoverage: number
  contour: BuilderStoneContourV1
  smoothness: number
}

function circularlyFill(values: readonly (number | undefined)[]): number[] | undefined {
  const known = values.flatMap((value, index) => (value === undefined ? [] : [index]))
  if (known.length === 0) return undefined

  return values.map((value, index) => {
    if (value !== undefined) return value

    let previousDistance = 1
    while (values[(index - previousDistance + values.length) % values.length] === undefined) {
      previousDistance += 1
    }
    let nextDistance = 1
    while (values[(index + nextDistance) % values.length] === undefined) nextDistance += 1
    const previous = values[(index - previousDistance + values.length) % values.length]!
    const next = values[(index + nextDistance) % values.length]!
    return previous + (next - previous) * (previousDistance / (previousDistance + nextDistance))
  })
}

function medianOfThree(first: number, second: number, third: number): number {
  return [first, second, third].sort((left, right) => left - right)[1]!
}

function extractContour(
  component: Component,
  width: number,
  height: number,
  rotationDegrees: number
): ContourExtraction | undefined {
  const selectedMask = new Uint8Array(width * height)
  for (const pixel of component.indices) selectedMask[pixel] = 1

  const centreX = (component.minimumX + component.maximumX + 1) / 2
  const centreY = (component.minimumY + component.maximumY + 1) / 2
  const halfWidth = Math.max(1, (component.maximumX - component.minimumX + 1) / 2)
  const halfHeight = Math.max(1, (component.maximumY - component.minimumY + 1) / 2)
  const radians = (-rotationDegrees * Math.PI) / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const boundary: Array<readonly [number, number]> = []

  for (const pixel of component.indices) {
    const x = pixel % width
    const y = Math.floor(pixel / width)
    const isBoundary =
      x === 0 ||
      x === width - 1 ||
      y === 0 ||
      y === height - 1 ||
      selectedMask[pixel - 1] === 0 ||
      selectedMask[pixel + 1] === 0 ||
      selectedMask[pixel - width] === 0 ||
      selectedMask[pixel + width] === 0
    if (!isBoundary) continue

    const normalizedX = (x + 0.5 - centreX) / halfWidth
    const normalizedY = (centreY - y - 0.5) / halfHeight
    boundary.push([
      normalizedX * cosine - normalizedY * sine,
      normalizedX * sine + normalizedY * cosine,
    ])
  }
  if (boundary.length < BUILDER_STONE_CONTOUR_SAMPLE_COUNT / 2) return undefined

  const minimumX = Math.min(...boundary.map(([x]) => x))
  const maximumX = Math.max(...boundary.map(([x]) => x))
  const minimumY = Math.min(...boundary.map(([, y]) => y))
  const maximumY = Math.max(...boundary.map(([, y]) => y))
  const normalizedCentreX = (minimumX + maximumX) / 2
  const normalizedCentreY = (minimumY + maximumY) / 2
  const normalizedHalfWidth = (maximumX - minimumX) / 2
  const normalizedHalfHeight = (maximumY - minimumY) / 2
  if (normalizedHalfWidth <= 0 || normalizedHalfHeight <= 0) return undefined

  const bins: Array<number | undefined> = Array.from({
    length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT,
  })
  for (const [rawX, rawY] of boundary) {
    const x = (rawX - normalizedCentreX) / normalizedHalfWidth
    const y = (rawY - normalizedCentreY) / normalizedHalfHeight
    const angle = (Math.atan2(y, x) + fullTurn) % fullTurn
    const index = Math.min(
      BUILDER_STONE_CONTOUR_SAMPLE_COUNT - 1,
      Math.floor((angle / fullTurn) * BUILDER_STONE_CONTOUR_SAMPLE_COUNT)
    )
    const radius = Math.hypot(x, y)
    bins[index] = Math.max(bins[index] ?? 0, radius)
  }

  const populatedBins = bins.filter((radius) => radius !== undefined).length
  const angularCoverage = populatedBins / BUILDER_STONE_CONTOUR_SAMPLE_COUNT
  if (angularCoverage < 0.45) return undefined
  const filled = circularlyFill(bins)
  if (!filled) return undefined
  const smoothed = filled.map((radius, index) =>
    medianOfThree(
      filled[(index - 1 + filled.length) % filled.length]!,
      radius,
      filled[(index + 1) % filled.length]!
    )
  )
  const radii = smoothed.map((radius) => Math.round(clamp(radius, 0.05, 1.75) * 10_000) / 10_000)
  const meanDelta =
    radii.reduce(
      (sum, radius, index) => sum + Math.abs(radius - radii[(index + 1) % radii.length]!),
      0
    ) / radii.length

  const parsedContour = parseBuilderStoneContour({
    version: BUILDER_STONE_CONTOUR_VERSION,
    radii,
  })
  if (!parsedContour) return undefined

  return {
    angularCoverage,
    contour: parsedContour,
    smoothness: 1 - clamp(meanDelta / 0.12, 0, 1),
  }
}

function normalizeHalfTurn(degrees: number): number {
  let normalized = degrees
  while (normalized > 90) normalized -= 180
  while (normalized < -90) normalized += 180
  return normalized
}

function normalizeFullTurn(degrees: number): number {
  let normalized = degrees
  while (normalized > 180) normalized -= 360
  while (normalized <= -180) normalized += 360
  return normalized
}

function halfTurnContour(contour: BuilderStoneContourV1): BuilderStoneContourV1 {
  const half = contour.radii.length / 2
  return {
    version: BUILDER_STONE_CONTOUR_VERSION,
    radii: contour.radii.map((_, index) => contour.radii[(index + half) % contour.radii.length]!),
  }
}

function contourDifference(left: BuilderStoneContourV1, right: BuilderStoneContourV1): number {
  return (
    left.radii.reduce((total, radius, index) => total + Math.abs(radius - right.radii[index]!), 0) /
    left.radii.length
  )
}

/**
 * PCA resolves a long axis but cannot distinguish its two directions. Hearts
 * and pears have semantic polarity, so compare the traced boundary with the
 * named-shape template and rotate both contour and source photo by 180° when
 * the opposite direction is materially closer. Ambiguous outlines stay as
 * photographed for review instead of receiving a speculative flip.
 */
function resolveSemanticHalfTurn(
  contour: BuilderStoneContourV1,
  shapeHint: OpalShapeHint | undefined
): { contour: BuilderStoneContourV1; rotationOffset: 0 | 180 } {
  if (shapeHint !== 'heart' && shapeHint !== 'pear') {
    return { contour, rotationOffset: 0 }
  }
  const canonical = canonicalShapeContour(shapeHint)
  if (!canonical) return { contour, rotationOffset: 0 }

  const flipped = halfTurnContour(contour)
  const uprightDifference = contourDifference(contour, canonical)
  const flippedDifference = contourDifference(flipped, canonical)
  return flippedDifference + 0.015 < uprightDifference
    ? { contour: flipped, rotationOffset: 180 }
    : { contour, rotationOffset: 0 }
}

/**
 * Estimates one conservative crop from border contrast without image codecs or
 * network access. The result is deterministic for identical raster bytes.
 */
function analyzeOpalRasterPixels(input: OpalRasterInput): OpalPhotoAnalysis | undefined {
  if (
    !Number.isInteger(input.width) ||
    !Number.isInteger(input.height) ||
    input.width < 8 ||
    input.height < 8
  ) {
    return undefined
  }
  const pixels = input.width * input.height
  if (!Number.isSafeInteger(pixels) || pixels > maximumPixels) return undefined
  const channels = inferChannels(input, pixels)
  if (!channels) return undefined

  const borderIndices = borderPixelIndices(input.width, input.height)
  const border = estimateBorderColour(input.data, channels, borderIndices)
  const contrasts = new Float64Array(pixels)
  let maximumContrast = 0
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    const contrast = colourContrast(input.data, channels, pixel, border)
    contrasts[pixel] = contrast
    maximumContrast = Math.max(maximumContrast, contrast)
  }
  if (maximumContrast < minimumContrast) return undefined

  const borderContrasts = borderIndices.map((pixel) => contrasts[pixel] ?? 0)
  const borderNoise = percentile(borderContrasts, 0.95)
  const threshold = Math.max(minimumContrast, borderNoise * 3 + 64, maximumContrast * 0.08)
  const mask = new Uint8Array(pixels)
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    if ((contrasts[pixel] ?? 0) >= threshold) mask[pixel] = 1
  }

  const cleanedMask = cleanMask(mask, input.width, input.height)
  const component = selectComponent(
    findComponents(cleanedMask, input.width, input.height),
    input.width,
    input.height
  )
  if (!component) return undefined
  const [centreX, centreY] = componentCentroid(component, input.width)

  let covarianceXX = 0
  let covarianceYY = 0
  let covarianceXY = 0
  let contrastTotal = 0
  for (const pixel of component.indices) {
    const x = (pixel % input.width) + 0.5 - centreX
    const y = Math.floor(pixel / input.width) + 0.5 - centreY
    covarianceXX += x * x
    covarianceYY += y * y
    covarianceXY += x * y
    contrastTotal += contrasts[pixel] ?? 0
  }
  covarianceXX /= component.indices.length
  covarianceYY /= component.indices.length
  covarianceXY /= component.indices.length

  const trace = covarianceXX + covarianceYY
  const discriminant = Math.sqrt(
    Math.max(0, (covarianceXX - covarianceYY) ** 2 + 4 * covarianceXY * covarianceXY)
  )
  const anisotropy = trace > 0 ? discriminant / trace : 0
  const majorAxisAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceXX - covarianceYY)
  const targetAngle = input.stoneAspect !== undefined && input.stoneAspect > 1.08 ? 0 : Math.PI / 2
  const measuredRotation =
    anisotropy < 0.12 ? 0 : normalizeHalfTurn(((targetAngle - majorAxisAngle) * 180) / Math.PI)
  // Colour patches can pull PCA a few dozen degrees inside an otherwise
  // upright opal. Auto-correct only unmistakable sideways photography; finer
  // artistic alignment remains reviewable in Payload and the builder editor.
  const measuredStoneAspect =
    input.stoneAspect !== undefined && Number.isFinite(input.stoneAspect)
      ? input.stoneAspect
      : undefined
  // Near-square cushions and hearts have ambiguous PCA axes: a broad heart can
  // be fractionally wider than tall while already photographed upright. Only
  // auto-rotate when measured dimensions establish a clear long axis.
  const hasUnambiguousLongAxis =
    measuredStoneAspect === undefined || measuredStoneAspect < 0.8 || measuredStoneAspect > 1.25
  const rotation = hasUnambiguousLongAxis && Math.abs(measuredRotation) >= 60 ? measuredRotation : 0
  const extractedContour = extractContour(component, input.width, input.height, rotation)
  if (!extractedContour) return undefined
  const orientedContour = resolveSemanticHalfTurn(extractedContour.contour, input.shapeHint)

  const objectWidth = component.maximumX - component.minimumX + 1
  const objectHeight = component.maximumY - component.minimumY + 1
  const detectedMinorMajor =
    Math.min(objectWidth, objectHeight) / Math.max(objectWidth, objectHeight)
  const stoneAspect =
    input.stoneAspect !== undefined && Number.isFinite(input.stoneAspect) && input.stoneAspect > 0
      ? clamp(input.stoneAspect, 0.2, 5)
      : detectedMinorMajor
  // Sample inside the detected face. Including a padded bounding box projects
  // bench, fingers, and shadows onto the 3D cabochon. Rotation adds its own
  // cover scale later, so persist the base zoom that produces the desired
  // effective 3.2x-or-tighter stone-only crop.
  const usableMinorFraction =
    Math.min(objectWidth / input.width, objectHeight / input.height) * 0.84
  const desiredEffectiveZoom = Math.max(3.2, 1 / Math.max(usableMinorFraction, 1 / 12))
  const zoom = clamp(desiredEffectiveZoom / rotationCoverScale(stoneAspect, rotation), 1, 12)

  const areaFraction = component.indices.length / pixels
  const boundingArea = objectWidth * objectHeight
  const solidity = boundingArea > 0 ? component.indices.length / boundingArea : 0
  const centreDistance = Math.hypot(
    (centreX / input.width - 0.5) * 2,
    (centreY / input.height - 0.5) * 2
  )
  const centrality = 1 - clamp(centreDistance / 1.1, 0, 1)
  const areaStrength = Math.min(
    clamp(areaFraction / 0.035, 0, 1),
    clamp((0.9 - areaFraction) / 0.2, 0, 1)
  )
  const meanContrast = contrastTotal / component.indices.length
  const contrastStrength = clamp((meanContrast - threshold) / Math.max(threshold * 2.5, 1), 0, 1)
  const confidence = clamp(
    contrastStrength * 0.3 +
      areaStrength * 0.2 +
      centrality * 0.15 +
      clamp(solidity, 0, 1) * 0.1 +
      extractedContour.angularCoverage * 0.15 +
      extractedContour.smoothness * 0.1,
    0,
    1
  )

  if (confidence < 0.35) return undefined
  return {
    contour: orientedContour.contour,
    focalX: clamp((component.minimumX + component.maximumX + 1) / 2 / input.width, 0, 1),
    focalY: clamp((component.minimumY + component.maximumY + 1) / 2 / input.height, 0, 1),
    zoom,
    rotation: normalizeFullTurn(rotation + orientedContour.rotationOffset),
    source: 'image',
    confidence,
  }
}

function canonicalShapePoint(
  shape: OpalShapeHint,
  angle: number
): readonly [number, number] {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  if (shape === 'cushion' || shape === 'elongated') {
    const exponent = shape === 'cushion' ? 0.42 : 0.62
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), exponent),
      Math.sign(sine) * Math.pow(Math.abs(sine), exponent),
    ]
  }
  if (shape === 'pear') {
    const taper = 0.925 + 0.2 * sine + 0.045 * sine * sine
    const widthCorrection = 1.055_526_961_712_104_8
    const finalTipProgress = clamp((-sine - 0.72) / 0.28, 0, 1)
    const smoothTipProgress = finalTipProgress * finalTipProgress * (3 - 2 * finalTipProgress)
    return [cosine * taper * widthCorrection * (1 - smoothTipProgress * 0.4), sine]
  }
  if (shape === 'heart') {
    const upperHalf = Math.max(0, sine)
    const lowerHalf = Math.max(0, -sine)
    const notch = 0.22 * Math.exp(-Math.pow(cosine / 0.2, 2)) * upperHalf
    const positiveYScale = sine > 0 ? 1 / 0.932 : 1
    const taper = 1 - 0.42 * Math.pow(lowerHalf, 1.35)
    return [cosine * taper, (sine - notch) * positiveYScale]
  }
  return [cosine, sine]
}

function canonicalShapeContour(shape: OpalShapeHint): BuilderStoneContourV1 | undefined {
  const boundary = Array.from(
    { length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT * 8 },
    (_, index) => canonicalShapePoint(shape, (index / (BUILDER_STONE_CONTOUR_SAMPLE_COUNT * 8)) * fullTurn)
  )
  const minimumX = Math.min(...boundary.map(([x]) => x))
  const maximumX = Math.max(...boundary.map(([x]) => x))
  const minimumY = Math.min(...boundary.map(([, y]) => y))
  const maximumY = Math.max(...boundary.map(([, y]) => y))
  const centreX = (minimumX + maximumX) / 2
  const centreY = (minimumY + maximumY) / 2
  const halfWidth = (maximumX - minimumX) / 2
  const halfHeight = (maximumY - minimumY) / 2
  const bins: Array<number | undefined> = Array.from({
    length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT,
  })

  for (const [rawX, rawY] of boundary) {
    const x = (rawX - centreX) / halfWidth
    const y = (rawY - centreY) / halfHeight
    const angle = (Math.atan2(y, x) + fullTurn) % fullTurn
    const index = Math.min(
      BUILDER_STONE_CONTOUR_SAMPLE_COUNT - 1,
      Math.floor((angle / fullTurn) * BUILDER_STONE_CONTOUR_SAMPLE_COUNT)
    )
    bins[index] = Math.max(bins[index] ?? 0, Math.hypot(x, y))
  }

  const filled = circularlyFill(bins)
  if (!filled) return undefined
  const radii = filled.map((radius, index) =>
    Math.round(
      medianOfThree(
        filled[(index - 1 + filled.length) % filled.length]!,
        radius,
        filled[(index + 1) % filled.length]!
      ) * 10_000
    ) / 10_000
  )
  return parseBuilderStoneContour({ version: BUILDER_STONE_CONTOUR_VERSION, radii })
}

function reviewedCropFallback(input: OpalRasterInput): OpalPhotoAnalysis | undefined {
  const hint = input.reviewedCropHint
  if (
    !hint ||
    !input.shapeHint ||
    !Number.isFinite(hint.focalX) ||
    hint.focalX < 0 ||
    hint.focalX > 1 ||
    !Number.isFinite(hint.focalY) ||
    hint.focalY < 0 ||
    hint.focalY > 1 ||
    !Number.isFinite(hint.zoom) ||
    hint.zoom < 1 ||
    hint.zoom > 12
  ) {
    return undefined
  }
  const contour = canonicalShapeContour(input.shapeHint)
  if (!contour) return undefined

  return {
    // Human-reviewed framing is trustworthy, but a canonical named outline is
    // still a review candidate rather than image-derived evidence.
    confidence: 0.7,
    contour,
    focalX: hint.focalX,
    focalY: hint.focalY,
    rotation: clamp(hint.rotation ?? 0, -90, 90),
    source: 'canonical-fallback',
    zoom: hint.zoom,
  }
}

export function analyzeOpalRaster(input: OpalRasterInput): OpalPhotoAnalysis | undefined {
  return analyzeOpalRasterPixels(input) ?? reviewedCropFallback(input)
}

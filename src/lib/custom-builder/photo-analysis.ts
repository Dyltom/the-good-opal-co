import { rotationCoverScale } from './photo-crop'

export const OPAL_PHOTO_ANALYSIS_VERSION = 1

export interface OpalRasterInput {
  channels?: 3 | 4
  data: ArrayLike<number>
  height: number
  stoneAspect?: number
  width: number
}

export interface OpalPhotoAnalysis {
  confidence: number
  focalX: number
  focalY: number
  rotation: number
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
    totalX += pixel % width + 0.5
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

function normalizeHalfTurn(degrees: number): number {
  let normalized = degrees
  while (normalized > 90) normalized -= 180
  while (normalized < -90) normalized += 180
  return normalized
}

/**
 * Estimates one conservative crop from border contrast without image codecs or
 * network access. The result is deterministic for identical raster bytes.
 */
export function analyzeOpalRaster(input: OpalRasterInput): OpalPhotoAnalysis | undefined {
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

  const component = selectComponent(findComponents(mask, input.width, input.height), input.width, input.height)
  if (!component) return undefined
  const [centreX, centreY] = componentCentroid(component, input.width)

  let covarianceXX = 0
  let covarianceYY = 0
  let covarianceXY = 0
  let contrastTotal = 0
  for (const pixel of component.indices) {
    const x = pixel % input.width + 0.5 - centreX
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
    anisotropy < 0.12
      ? 0
      : normalizeHalfTurn(((targetAngle - majorAxisAngle) * 180) / Math.PI)
  // Colour patches can pull PCA a few dozen degrees inside an otherwise
  // upright opal. Auto-correct only unmistakable sideways photography; finer
  // artistic alignment remains reviewable in Payload and the builder editor.
  const rotation = Math.abs(measuredRotation) >= 60 ? measuredRotation : 0

  const objectWidth = component.maximumX - component.minimumX + 1
  const objectHeight = component.maximumY - component.minimumY + 1
  const detectedMinorMajor = Math.min(objectWidth, objectHeight) / Math.max(objectWidth, objectHeight)
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
  const zoom = clamp(
    desiredEffectiveZoom / rotationCoverScale(stoneAspect, rotation),
    1,
    12
  )

  const areaFraction = component.indices.length / pixels
  const boundingArea = objectWidth * objectHeight
  const solidity = boundingArea > 0 ? component.indices.length / boundingArea : 0
  const centreDistance = Math.hypot((centreX / input.width - 0.5) * 2, (centreY / input.height - 0.5) * 2)
  const centrality = 1 - clamp(centreDistance / 1.1, 0, 1)
  const areaStrength = Math.min(clamp(areaFraction / 0.035, 0, 1), clamp((0.9 - areaFraction) / 0.2, 0, 1))
  const meanContrast = contrastTotal / component.indices.length
  const contrastStrength = clamp((meanContrast - threshold) / Math.max(threshold * 2.5, 1), 0, 1)
  const confidence = clamp(
    contrastStrength * 0.4 + areaStrength * 0.25 + centrality * 0.2 + clamp(solidity, 0, 1) * 0.15,
    0,
    1
  )

  if (confidence < 0.35) return undefined
  return {
    focalX: clamp(centreX / input.width, 0, 1),
    focalY: clamp(centreY / input.height, 0, 1),
    zoom,
    rotation: clamp(rotation, -90, 90),
    confidence,
  }
}

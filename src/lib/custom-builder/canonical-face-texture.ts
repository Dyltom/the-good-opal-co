import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { computePhotoCrop, computePhotoTextureTransform, isPhotoCropRenderable } from './photo-crop'
import { OPAL_PHOTO_ANALYSIS_VERSION, type OpalPhotoAnalysis } from './photo-analysis'
import { normalizedBuilderStoneContourPoint, parseBuilderStoneContour } from './stone-contour'

export const CANONICAL_FACE_TEXTURE_VERSION = 3 as const
export const CANONICAL_FACE_TEXTURE_SIZE = 512

const MINIMUM_TEXTURE_SIZE = 32
const MAXIMUM_TEXTURE_SIZE = 1024
const MAXIMUM_SOURCE_PIXELS = 40_000_000
const PNG_MEDIA_TYPE = 'image/png' as const

interface CanonicalCropMetadata {
  focalX: number
  focalY: number
  rotation: number
  zoom: number
}

export interface CanonicalFaceTextureMetadata {
  analysisConfidence: number
  analysisVersion: typeof OPAL_PHOTO_ANALYSIS_VERSION
  byteLength: number
  colorSpace: 'srgb'
  contentHash: string
  contourHash: string
  coordinateExtent: number
  coordinateSpace: 'stone-normalized-y-up'
  crop: CanonicalCropMetadata
  generatorVersion: typeof CANONICAL_FACE_TEXTURE_VERSION
  height: number
  inputHash: string
  mediaType: typeof PNG_MEDIA_TYPE
  sourceImageHash: string
  storageKey: string
  stoneAspect: number
  transparentOutsideContour: false
  width: number
}

export interface CanonicalFaceTextureIdentity {
  generatorVersion: number
  inputHash: string
  key: string
  outputSize: number
}

export interface GeneratedCanonicalFaceTexture {
  bytes: Buffer
  metadata: CanonicalFaceTextureMetadata
  status: 'generated'
}

export interface SkippedCanonicalFaceTexture {
  reason: 'canonical-fallback'
  status: 'skipped'
}

export type CanonicalFaceTextureResult = GeneratedCanonicalFaceTexture | SkippedCanonicalFaceTexture

export interface GenerateCanonicalFaceTextureInput {
  analysis: OpalPhotoAnalysis
  outputSize?: number
  source: Buffer | Uint8Array
}

export interface CreateCanonicalFaceTextureIdentityInput {
  analysis: OpalPhotoAnalysis
  generatorVersion: number
  outputSize?: number
  sourceImageHash: string
}

function sha256(value: Buffer | Uint8Array | string): string {
  return createHash('sha256').update(value).digest('hex')
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function round(value: number, digits = 8): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function validateOutputSize(value: number): number {
  if (!Number.isInteger(value) || value < MINIMUM_TEXTURE_SIZE || value > MAXIMUM_TEXTURE_SIZE) {
    throw new Error(
      `Canonical face texture size must be an integer from ${MINIMUM_TEXTURE_SIZE} to ${MAXIMUM_TEXTURE_SIZE}`
    )
  }
  return value
}

function validateAnalysis(analysis: OpalPhotoAnalysis, stoneAspect: number): void {
  if (!Number.isFinite(stoneAspect) || stoneAspect <= 0) {
    throw new Error('Canonical face texture requires a positive stone aspect')
  }
  if (!Number.isFinite(analysis.confidence) || analysis.confidence < 0 || analysis.confidence > 1) {
    throw new Error('Canonical face texture requires analysis confidence from 0 to 1')
  }
  if (
    !Number.isFinite(analysis.focalX) ||
    analysis.focalX < 0 ||
    analysis.focalX > 1 ||
    !Number.isFinite(analysis.focalY) ||
    analysis.focalY < 0 ||
    analysis.focalY > 1 ||
    !Number.isFinite(analysis.zoom) ||
    !Number.isFinite(analysis.rotation) ||
    !isPhotoCropRenderable(analysis.zoom, stoneAspect, analysis.rotation)
  ) {
    throw new Error('Canonical face texture requires a renderable analyzed crop')
  }
}

const contourCoordinateExtent = 1

type ContourPoint = readonly [number, number]

function normalizedContourBoundary(
  contour: NonNullable<ReturnType<typeof parseBuilderStoneContour>>
): ContourPoint[] {
  return contour.radii.map((_, index) =>
    normalizedBuilderStoneContourPoint(contour, (index / contour.radii.length) * Math.PI * 2)
  )
}

function contourMaskSample(
  x: number,
  y: number,
  boundary: readonly ContourPoint[],
  pixelSpan: number
): { alpha: number; nearest: ContourPoint } {
  let inside = false
  let nearest: ContourPoint = boundary[0] ?? [0, 0]
  let minimumDistanceSquared = Number.POSITIVE_INFINITY

  for (let index = 0; index < boundary.length; index += 1) {
    const start = boundary[index]!
    const end = boundary[(index + 1) % boundary.length]!
    if (
      start[1] > y !== end[1] > y &&
      x < ((end[0] - start[0]) * (y - start[1])) / (end[1] - start[1]) + start[0]
    ) {
      inside = !inside
    }
    const segmentX = end[0] - start[0]
    const segmentY = end[1] - start[1]
    const lengthSquared = segmentX * segmentX + segmentY * segmentY
    const progress =
      lengthSquared > 0
        ? clamp(((x - start[0]) * segmentX + (y - start[1]) * segmentY) / lengthSquared, 0, 1)
        : 0
    const candidate: ContourPoint = [
      start[0] + segmentX * progress,
      start[1] + segmentY * progress,
    ]
    const deltaX = x - candidate[0]
    const deltaY = y - candidate[1]
    const distanceSquared = deltaX * deltaX + deltaY * deltaY
    if (distanceSquared < minimumDistanceSquared) {
      minimumDistanceSquared = distanceSquared
      nearest = candidate
    }
  }

  const signedDistance = Math.sqrt(minimumDistanceSquared) * (inside ? 1 : -1)
  return { alpha: clamp(signedDistance / pixelSpan + 0.5, 0, 1), nearest }
}

function bilinearChannel(
  pixels: Buffer,
  width: number,
  height: number,
  sourceU: number,
  sourceV: number,
  channel: number
): number {
  // CSS images and WebGL textures place texel centres at (index + 0.5) / size.
  // Using `u * (size - 1)` subtly shifts every tight crop because it treats
  // the first and final texel centres as the texture edges instead. Match the
  // browser/GPU contract here, then clamp like ClampToEdgeWrapping.
  const x = clamp(sourceU * width - 0.5, 0, width - 1)
  const y = clamp((1 - sourceV) * height - 0.5, 0, height - 1)
  const left = Math.floor(x)
  const top = Math.floor(y)
  const right = Math.min(width - 1, left + 1)
  const bottom = Math.min(height - 1, top + 1)
  const horizontal = x - left
  const vertical = y - top
  const at = (pixelX: number, pixelY: number) =>
    pixels[(pixelY * width + pixelX) * 4 + channel] ?? 0
  const upper = at(left, top) + (at(right, top) - at(left, top)) * horizontal
  const lower = at(left, bottom) + (at(right, bottom) - at(left, bottom)) * horizontal
  return Math.round(upper + (lower - upper) * vertical)
}

/**
 * Computes the cheap identity used by catalogue URLs and artifact caches. The
 * source bytes are represented by their verified SHA-256, so callers do not
 * need to decode or regenerate PNG pixels to know whether a URL is current.
 */
export function createCanonicalFaceTextureIdentity(
  input: CreateCanonicalFaceTextureIdentityInput
): CanonicalFaceTextureIdentity | undefined {
  if (input.analysis.source === 'canonical-fallback') return undefined
  const outputSize = validateOutputSize(input.outputSize ?? CANONICAL_FACE_TEXTURE_SIZE)
  validateAnalysis(input.analysis, input.analysis.stoneAspect)
  if (!Number.isInteger(input.generatorVersion) || input.generatorVersion < 1) {
    throw new Error('Canonical face texture generator version must be a positive integer')
  }
  const normalizedSourceHash = input.sourceImageHash.toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalizedSourceHash)) {
    throw new Error('Canonical face texture identity requires a SHA-256 source hash')
  }
  const contour = parseBuilderStoneContour(input.analysis.contour)
  if (!contour) throw new Error('Canonical face texture requires a valid analyzed contour')
  const contourHash = sha256(JSON.stringify(contour))
  const coordinateExtent = contourCoordinateExtent
  const inputHash = sha256(
    JSON.stringify({
      analysisVersion: OPAL_PHOTO_ANALYSIS_VERSION,
      confidence: round(input.analysis.confidence),
      contourHash,
      coordinateExtent,
      crop: {
        focalX: round(input.analysis.focalX),
        focalY: round(input.analysis.focalY),
        rotation: round(input.analysis.rotation),
        zoom: round(input.analysis.zoom),
      },
      generatorVersion: input.generatorVersion,
      outputSize,
      sourceImageHash: normalizedSourceHash,
      stoneAspect: round(input.analysis.stoneAspect),
    })
  )

  return {
    generatorVersion: input.generatorVersion,
    inputHash,
    key: `v${input.generatorVersion}/${inputHash}`,
    outputSize,
  }
}

/**
 * Rectifies one image-derived opal face into a stable square texture. Output
 * coordinates are normalized Y-up stone coordinates, not source-photo pixels.
 * The texture is an opaque colour plane. Pixels outside the analyzed contour
 * repeat the nearest inward edge colour so customer pan/rotation can never
 * expose transparent black wedges. The cabochon mesh and CSS clip remain the
 * authoritative stone boundary. Canonical named-shape fallbacks deliberately
 * produce no artifact because they are not evidence of a photographed edge.
 */
export async function generateCanonicalFaceTexture(
  input: GenerateCanonicalFaceTextureInput
): Promise<CanonicalFaceTextureResult> {
  if (input.analysis.source === 'canonical-fallback') {
    return { reason: 'canonical-fallback', status: 'skipped' }
  }

  const outputSize = validateOutputSize(input.outputSize ?? CANONICAL_FACE_TEXTURE_SIZE)
  validateAnalysis(input.analysis, input.analysis.stoneAspect)
  const contour = parseBuilderStoneContour(input.analysis.contour)
  if (!contour) throw new Error('Canonical face texture requires a valid analyzed contour')
  if (input.source.byteLength === 0) throw new Error('Canonical face texture source is empty')

  const source = Buffer.from(input.source)
  const decoded = await sharp(source, { limitInputPixels: MAXIMUM_SOURCE_PIXELS })
    .rotate()
    .toColourspace('srgb')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  if (decoded.info.channels !== 4 || decoded.info.width < 1 || decoded.info.height < 1) {
    throw new Error('Canonical face texture requires a decodable RGBA source')
  }

  const crop = computePhotoCrop(
    decoded.info.width,
    decoded.info.height,
    input.analysis.stoneAspect,
    input.analysis
  )
  const transform = computePhotoTextureTransform(
    crop,
    input.analysis.stoneAspect,
    input.analysis.rotation
  )
  const [m00, m01, m02, m10, m11, m12] = transform.matrix
  const coordinateExtent = contourCoordinateExtent
  const normalizedBoundary = normalizedContourBoundary(contour)
  const pixelSpan = (coordinateExtent * 2) / outputSize
  const output = Buffer.alloc(outputSize * outputSize * 4)

  for (let pixelY = 0; pixelY < outputSize; pixelY += 1) {
    const normalizedY = (0.5 - (pixelY + 0.5) / outputSize) * 2 * coordinateExtent
    for (let pixelX = 0; pixelX < outputSize; pixelX += 1) {
      const normalizedX = ((pixelX + 0.5) / outputSize - 0.5) * 2 * coordinateExtent
      const mask = contourMaskSample(normalizedX, normalizedY, normalizedBoundary, pixelSpan)
      const offset = (pixelY * outputSize + pixelX) * 4
      let sampledPoint: ContourPoint = [normalizedX, normalizedY]
      if (mask.alpha <= 0.5) {
        sampledPoint = [mask.nearest[0] * (1 - pixelSpan), mask.nearest[1] * (1 - pixelSpan)]
      }
      const canonicalU = sampledPoint[0] / 2 + 0.5
      const canonicalV = sampledPoint[1] / 2 + 0.5
      const sourceU = m00 * canonicalU + m01 * canonicalV + m02
      const sourceV = m10 * canonicalU + m11 * canonicalV + m12
      output[offset] = bilinearChannel(
        decoded.data,
        decoded.info.width,
        decoded.info.height,
        sourceU,
        sourceV,
        0
      )
      output[offset + 1] = bilinearChannel(
        decoded.data,
        decoded.info.width,
        decoded.info.height,
        sourceU,
        sourceV,
        1
      )
      output[offset + 2] = bilinearChannel(
        decoded.data,
        decoded.info.width,
        decoded.info.height,
        sourceU,
        sourceV,
        2
      )
      output[offset + 3] = 255
    }
  }

  const bytes = await sharp(output, {
    raw: { channels: 4, height: outputSize, width: outputSize },
  })
    .png({ adaptiveFiltering: false, compressionLevel: 9, palette: false })
    .toBuffer()
  const sourceImageHash = sha256(source)
  const contourHash = sha256(JSON.stringify(contour))
  const identity = createCanonicalFaceTextureIdentity({
    analysis: input.analysis,
    generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
    outputSize,
    sourceImageHash,
  })
  if (!identity) throw new Error('Canonical face texture identity is unavailable')
  const contentHash = sha256(bytes)
  const cropMetadata = {
    focalX: round(input.analysis.focalX),
    focalY: round(input.analysis.focalY),
    rotation: round(input.analysis.rotation),
    zoom: round(input.analysis.zoom),
  }

  return {
    bytes,
    metadata: {
      analysisConfidence: round(input.analysis.confidence),
      analysisVersion: OPAL_PHOTO_ANALYSIS_VERSION,
      byteLength: bytes.byteLength,
      colorSpace: 'srgb',
      contentHash,
      contourHash,
      coordinateExtent,
      coordinateSpace: 'stone-normalized-y-up',
      crop: cropMetadata,
      generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
      height: outputSize,
      inputHash: identity.inputHash,
      mediaType: PNG_MEDIA_TYPE,
      sourceImageHash,
      storageKey: `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${identity.inputHash}.png`,
      stoneAspect: round(input.analysis.stoneAspect),
      transparentOutsideContour: false,
      width: outputSize,
    },
    status: 'generated',
  }
}

import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { Product } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { parseBuilderPhotoCrop } from '@/lib/product-validation'
import {
  generateCanonicalFaceTexture,
  type GeneratedCanonicalFaceTexture,
} from './canonical-face-texture'
import {
  BUILDER_MAPPING_VERSION,
  BUILDER_MAPPING_WORKER_CONTEXT,
  BUILDER_PHOTO_ANALYSIS_VERSION,
} from './mapping-lifecycle'
import { classifyOpalListing, isAvailableOpalListing } from './opal-visual'
import {
  analyzeOpalRaster,
  type OpalPhotoAnalysis,
  type OpalShapeHint,
} from './photo-analysis'
import { parseBuilderStoneContour } from './stone-contour'

const MAX_SOURCE_BYTES = 25 * 1024 * 1024
const ANALYSIS_EDGE_PX = 640
const STABILITY_ANALYSIS_EDGE_PX = 480
const MINIMUM_ACTIVE_CONTOUR_CONFIDENCE = 0.9
const MAXIMUM_STABILITY_FOCAL_DELTA = 0.01
const MAXIMUM_STABILITY_ZOOM_DELTA = 0.03
const MAXIMUM_STABILITY_ROTATION_DELTA = 2
const MAXIMUM_STABILITY_CONTOUR_DELTA = 0.015
const UNSTABLE_ANALYSIS_ERROR =
  'Opal contour is not stable across analysis resolutions; visual review required before activation'
const RETRYABLE_ANALYSIS_ERROR_PREFIX = 'Retryable source error: '
const RETRYABLE_ARTIFACT_ERROR_PREFIX = 'Retryable artifact error: '

class RetryableSourceError extends Error {}

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type ProductRecord = Record<string, unknown>

interface MediaRecord extends ProductRecord {
  id?: number | string
  url?: string | null
}

interface GalleryMedia {
  index: number
  media: MediaRecord
}

interface GalleryAnalysis {
  analysis: NonNullable<ReturnType<typeof analyzeOpalRaster>>
  confidence: number
  contour: NonNullable<ReturnType<typeof parseBuilderStoneContour>>
  imageHash: string
  index: number
  source: Buffer
}

interface GalleryAnalysisSelection {
  ambiguousSource: boolean
  candidate: GalleryAnalysis
}

const opalShapeHints = new Set<OpalShapeHint>([
  'cushion',
  'elongated',
  'heart',
  'oval',
  'pear',
  'round',
])

export interface ProcessBuilderMappingsOptions {
  canonicalFaceArtifactSink?: CanonicalFaceArtifactSink
  limit?: number
  productId?: number | string
}

export interface CanonicalFaceArtifactEvent {
  artifact: GeneratedCanonicalFaceTexture
  productId: number | string
  productSlug?: string
  sourceImageIndex: number
}

export interface CanonicalFaceArtifactReceipt {
  contentHash: string
  pathname: string
  url: string
}

export type CanonicalFaceArtifactSink = (
  event: CanonicalFaceArtifactEvent
) => Promise<CanonicalFaceArtifactReceipt>

export interface BuilderMappingBatchResult {
  analyzed: number
  checked: number
  coverage: {
    activeContours: number
    availableIndividuals: number
    candidates: number
    currentAnalyses: number
    eligible: number
    failedCurrent: number
    individualFailures: Array<{ error: string; slug: string }>
    reviewCandidates: string[]
    skippedCurrent: number
    total: number
  }
  failed: number
  manual: number
  nonIndividual: number
  selectedState: {
    currentVersion: number
    withCandidate: number
    withError: number
    withHash: number
  }
  unchanged: number
}

function isRecord(value: unknown): value is ProductRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mappedImageIndex(product: ProductRecord): number {
  return typeof product.builderMappedImageIndex === 'number' &&
    Number.isInteger(product.builderMappedImageIndex) &&
    product.builderMappedImageIndex >= 0
    ? product.builderMappedImageIndex
    : 0
}

function stoneAspect(product: ProductRecord): number | undefined {
  const dimensions = isRecord(product.dimensions) ? product.dimensions : undefined
  const length = dimensions?.length
  const width = dimensions?.width
  return typeof length === 'number' &&
    Number.isFinite(length) &&
    length > 0 &&
    typeof width === 'number' &&
    Number.isFinite(width) &&
    width > 0
    ? width / length
    : undefined
}

function reviewedAnalysisHints(product: ProductRecord):
  | {
      reviewedCropHint: { focalX: number; focalY: number; rotation?: number; zoom: number }
      shapeHint: OpalShapeHint
    }
  | undefined {
  const focalX = product.builderPhotoFocalX
  const focalY = product.builderPhotoFocalY
  const zoom = product.builderPhotoZoom
  const rotation = product.builderPhotoRotation
  const shape = product.builderSilhouette
  if (
    typeof focalX !== 'number' ||
    !Number.isFinite(focalX) ||
    typeof focalY !== 'number' ||
    !Number.isFinite(focalY) ||
    typeof zoom !== 'number' ||
    !Number.isFinite(zoom) ||
    typeof shape !== 'string' ||
    !opalShapeHints.has(shape as OpalShapeHint)
  ) {
    return undefined
  }

  return {
    reviewedCropHint: {
      focalX,
      focalY,
      ...(typeof rotation === 'number' && Number.isFinite(rotation) ? { rotation } : {}),
      zoom,
    },
    shapeHint: shape as OpalShapeHint,
  }
}

function approvedCanonicalAnalysis(
  product: ProductRecord,
  selected: GalleryAnalysis,
  currentImageIndex: number
): OpalPhotoAnalysis | undefined {
  if (
    (product.builderMappingStatus !== 'reviewed' && product.builderMappingStatus !== 'manual') ||
    selected.index !== currentImageIndex ||
    product.builderContourSourceImageHash !== selected.imageHash ||
    selected.confidence < MINIMUM_ACTIVE_CONTOUR_CONFIDENCE
  ) {
    return undefined
  }

  const contour = parseBuilderStoneContour(product.builderContour)
  const crop = parseBuilderPhotoCrop(
    product.builderPhotoFocalX,
    product.builderPhotoFocalY,
    product.builderPhotoZoom,
    product.builderPhotoRotation
  )
  const aspect = stoneAspect(product)
  if (!contour || !crop || aspect === undefined) return undefined

  return {
    confidence: selected.confidence,
    contour,
    focalX: crop.focalX,
    focalY: crop.focalY,
    rotation: crop.rotation ?? 0,
    source: 'image',
    stoneAspect: aspect,
    zoom: crop.zoom,
  }
}

function mappingNeedsPhotoAnalysis(value: unknown): boolean {
  if (!isRecord(value)) return false
  const product = value
  const error =
    typeof product.builderMappingAnalysisError === 'string'
      ? product.builderMappingAnalysisError.trim()
      : ''
  const currentVersion =
    product.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION

  if (error) {
    return (
      !currentVersion ||
      error.startsWith(RETRYABLE_ANALYSIS_ERROR_PREFIX) ||
      error.startsWith(RETRYABLE_ARTIFACT_ERROR_PREFIX)
    )
  }

  const hasHash =
    typeof product.builderMappingAnalyzedImageHash === 'string' &&
    product.builderMappingAnalyzedImageHash.length > 0
  const hasCandidate = Boolean(parseBuilderStoneContour(product.builderContourCandidate))
  const hasCandidateImageIndex =
    typeof product.builderPhotoCandidateImageIndex === 'number' &&
    Number.isInteger(product.builderPhotoCandidateImageIndex) &&
    product.builderPhotoCandidateImageIndex >= 0 &&
    Array.isArray(product.images) &&
    product.builderPhotoCandidateImageIndex < product.images.length
  return !currentVersion || !hasHash || !hasCandidate || !hasCandidateImageIndex
}

function analysisPriority(value: unknown): number {
  if (!isRecord(value)) return 1
  const product = value
  const name = typeof product.name === 'string' ? product.name : ''
  return isAvailableOpalListing(name) && classifyOpalListing(name) === 'individual' ? 0 : 1
}

async function resolveGalleryMedia(
  payload: PayloadClient,
  product: ProductRecord
): Promise<GalleryMedia[]> {
  const images = Array.isArray(product.images) ? product.images : []
  const resolved = await Promise.all(
    images.map(async (selected, index): Promise<GalleryMedia | undefined> => {
      const relationship = isRecord(selected) && 'image' in selected ? selected.image : selected

      if (isRecord(relationship)) return { index, media: relationship }
      if (typeof relationship !== 'number' && typeof relationship !== 'string') return undefined

      try {
        const media = await payload.findByID({
          collection: 'media',
          id: relationship,
          depth: 0,
          overrideAccess: true,
        })
        return isRecord(media) ? { index, media } : undefined
      } catch {
        return undefined
      }
    })
  )
  return resolved.filter((item): item is GalleryMedia => Boolean(item))
}

function selectGalleryAnalysis(
  analyses: GalleryAnalysis[],
  currentImageIndex: number
): GalleryAnalysisSelection | undefined {
  const ranked = [...analyses].sort(
    (left, right) => right.confidence - left.confidence || left.index - right.index
  )
  const best = ranked[0]
  if (!best) return undefined

  const current = analyses.find((candidate) => candidate.index === currentImageIndex)
  if (current && best.index === current.index) {
    return { ambiguousSource: false, candidate: best }
  }

  // Segmentation confidence proves that pixels form a stable contour; it does
  // not prove an alternate gallery frame is a face-on loose-stone photograph.
  // Keep an analyzable mapped/primary frame even when an alternate scores
  // higher. If that frame fails, surface the best alternate for maker review.
  return current
    ? { ambiguousSource: false, candidate: current }
    : { ambiguousSource: true, candidate: best }
}

function absoluteMediaUrl(value: string | null | undefined): string | undefined {
  const resolved = resolveMediaUrl(value)
  if (!resolved) return undefined

  try {
    return new URL(resolved).toString()
  } catch {
    const origin = internalApplicationOrigin()
    if (!origin) return undefined
    return new URL(resolved, origin).toString()
  }
}

function normalizedOrigin(
  value: string | undefined,
  defaultProtocol?: 'https:'
): string | undefined {
  const configured = value?.trim()
  if (!configured) return undefined

  try {
    const url = new URL(
      defaultProtocol && !configured.includes('://')
        ? `${defaultProtocol}//${configured}`
        : configured
    )
    if (url.username || url.password) return undefined
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return url.origin
  } catch {
    return undefined
  }
}

/**
 * Payload file URLs are application-relative. During a Vercel deployment they
 * must resolve back to that deployment, not through the public canonical domain
 * which may still point at a previous platform during DNS migration.
 */
function internalApplicationOrigin(): string | undefined {
  return (
    normalizedOrigin(process.env.VERCEL_URL, 'https:') ??
    normalizedOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL, 'https:') ??
    normalizedOrigin(process.env.NEXT_PUBLIC_APP_URL)
  )
}

function isOwnedMediaSource(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.username || parsed.password) return false
    const applicationOrigin = internalApplicationOrigin()
    if (applicationOrigin && parsed.origin === applicationOrigin) return true
    return (
      parsed.protocol === 'https:' &&
      parsed.port === '' &&
      parsed.hostname.endsWith('.blob.vercel-storage.com')
    )
  } catch {
    return false
  }
}

async function fetchImage(url: string): Promise<Buffer> {
  if (!isOwnedMediaSource(url)) throw new Error('Source image is not in owned storage')

  let response: Response
  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: { accept: 'image/*' },
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    throw new RetryableSourceError('Source image request did not complete')
  }
  if (!response.ok) {
    const message = `Source image request failed (${response.status})`
    if (
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500 ||
      (response.status === 404 && isOwnedMediaSource(url))
    ) {
      throw new RetryableSourceError(message)
    }
    throw new Error(message)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Source media is not an image')
  }
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
    throw new Error('Source image exceeds 25 MB analysis limit')
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(await response.arrayBuffer())
  } catch {
    throw new RetryableSourceError('Source image download did not complete')
  }
  if (bytes.length === 0) throw new Error('Source image is empty')
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error('Source image exceeds 25 MB analysis limit')
  return bytes
}

function conciseError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown image analysis error'
  const concise = message.replace(/\s+/g, ' ').trim().slice(0, 500)
  return error instanceof RetryableSourceError
    ? `${RETRYABLE_ANALYSIS_ERROR_PREFIX}${concise}`
    : concise
}

function finiteBetween(value: unknown, minimum: number, maximum: number, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`Image analysis returned invalid ${field}`)
  }
  return value
}

async function analyzeSourceRaster(
  source: Buffer,
  edge: number,
  product: ProductRecord,
  reviewedHints?: ReturnType<typeof reviewedAnalysisHints>
): Promise<GalleryAnalysis['analysis']> {
  const raster = await sharp(source, { limitInputPixels: 40_000_000 })
    .rotate()
    .toColourspace('srgb')
    .removeAlpha()
    .resize({
      width: edge,
      height: edge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .raw()
    .toBuffer({ resolveWithObject: true })
  if (raster.info.channels !== 3 && raster.info.channels !== 4) {
    throw new Error('Image analysis requires an RGB raster')
  }

  const analysis = analyzeOpalRaster({
    channels: raster.info.channels,
    data: raster.data,
    height: raster.info.height,
    ...(typeof product.builderSilhouette === 'string' &&
    opalShapeHints.has(product.builderSilhouette as OpalShapeHint)
      ? { shapeHint: product.builderSilhouette as OpalShapeHint }
      : {}),
    ...reviewedHints,
    stoneAspect: stoneAspect(product),
    width: raster.info.width,
  })
  if (!analysis) throw new Error('Opal face could not be isolated from the source image')
  return analysis
}

function circularDegreeDelta(left: number, right: number): number {
  const difference = Math.abs(left - right) % 360
  return Math.min(difference, 360 - difference)
}

function meanContourRadiusDelta(
  left: GalleryAnalysis['contour'],
  right: GalleryAnalysis['contour']
): number {
  return (
    left.radii.reduce(
      (total, radius, index) => total + Math.abs(radius - (right.radii[index] ?? radius)),
      0
    ) / left.radii.length
  )
}

function analysesAreStable(
  primary: GalleryAnalysis,
  secondaryAnalysis: GalleryAnalysis['analysis']
): boolean {
  const secondaryConfidence = finiteBetween(secondaryAnalysis.confidence, 0, 1, 'confidence')
  const secondaryContour = parseBuilderStoneContour(secondaryAnalysis.contour)
  if (
    primary.analysis.source !== 'image' ||
    secondaryAnalysis.source !== 'image' ||
    primary.confidence < MINIMUM_ACTIVE_CONTOUR_CONFIDENCE ||
    secondaryConfidence < MINIMUM_ACTIVE_CONTOUR_CONFIDENCE ||
    !secondaryContour
  ) {
    return false
  }

  const primaryZoom = finiteBetween(primary.analysis.zoom, 1, 12, 'zoom')
  const secondaryZoom = finiteBetween(secondaryAnalysis.zoom, 1, 12, 'zoom')
  return (
    Math.abs(primary.analysis.focalX - secondaryAnalysis.focalX) <= MAXIMUM_STABILITY_FOCAL_DELTA &&
    Math.abs(primary.analysis.focalY - secondaryAnalysis.focalY) <= MAXIMUM_STABILITY_FOCAL_DELTA &&
    Math.abs(primaryZoom - secondaryZoom) / primaryZoom <= MAXIMUM_STABILITY_ZOOM_DELTA &&
    circularDegreeDelta(primary.analysis.rotation, secondaryAnalysis.rotation) <=
      MAXIMUM_STABILITY_ROTATION_DELTA &&
    meanContourRadiusDelta(primary.contour, secondaryContour) <= MAXIMUM_STABILITY_CONTOUR_DELTA
  )
}

async function updateProduct(
  payload: PayloadClient,
  id: number | string,
  data: ProductRecord,
  expectedUpdatedAt: string | undefined
): Promise<boolean> {
  if (expectedUpdatedAt) {
    const result = await payload.update({
      collection: 'products',
      where: {
        and: [{ id: { equals: id } }, { updatedAt: { equals: expectedUpdatedAt } }],
      },
      data: { ...data, builderMappingVersion: BUILDER_MAPPING_VERSION } as Partial<Product>,
      context: { [BUILDER_MAPPING_WORKER_CONTEXT]: true },
      overrideAccess: true,
    })
    return result.docs.length === 1
  }

  await payload.update({
    collection: 'products',
    id,
    data: { ...data, builderMappingVersion: BUILDER_MAPPING_VERSION } as Partial<Product>,
    context: { [BUILDER_MAPPING_WORKER_CONTEXT]: true },
    overrideAccess: true,
  })
  return true
}

async function findAllAvailableProducts(
  payload: PayloadClient,
  depth: 0 | 1
): Promise<Product[]> {
  const documents: Product[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'products',
      depth,
      limit: 1000,
      ...(page > 1 ? { page } : {}),
      ...(depth === 1 ? { sort: 'updatedAt' } : {}),
      overrideAccess: true,
      where: {
        and: [
          { category: { equals: 'raw-opals' } },
          { status: { equals: 'published' } },
          { stock: { greater_than: 0 } },
        ],
      },
    })
    documents.push(...result.docs)
    if (!result.hasNextPage) break
    page = result.nextPage ?? page + 1
  }

  return documents
}

export async function processBuilderMappings(
  options: ProcessBuilderMappingsOptions = {}
): Promise<BuilderMappingBatchResult> {
  const limit = Math.max(1, Math.min(25, Math.floor(options.limit ?? 10)))
  const payload = await getPayload()
  const availableProducts = await findAllAvailableProducts(payload, 1)
  const requestedProductId =
    typeof options.productId === 'number' || typeof options.productId === 'string'
      ? String(options.productId)
      : undefined
  const selectedDocuments = availableProducts
    .filter(
      (document) =>
        requestedProductId === undefined || String(document.id) === requestedProductId
    )
    .filter((document) => mappingNeedsPhotoAnalysis(document))
    .sort((left, right) => analysisPriority(left) - analysisPriority(right))
    .slice(0, limit)

  const summary: BuilderMappingBatchResult = {
    analyzed: 0,
    checked: selectedDocuments.length,
    coverage: {
      activeContours: 0,
      availableIndividuals: 0,
      candidates: 0,
      currentAnalyses: 0,
      eligible: 0,
      failedCurrent: 0,
      individualFailures: [],
      reviewCandidates: [],
      skippedCurrent: 0,
      total: 0,
    },
    failed: 0,
    manual: 0,
    nonIndividual: 0,
    selectedState: {
      currentVersion: selectedDocuments.filter(
        (document) => document.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION
      ).length,
      withCandidate: selectedDocuments.filter((document) =>
        Boolean(parseBuilderStoneContour(document.builderContourCandidate))
      ).length,
      withError: selectedDocuments.filter(
        (document) =>
          typeof document.builderMappingAnalysisError === 'string' &&
          document.builderMappingAnalysisError.length > 0
      ).length,
      withHash: selectedDocuments.filter(
        (document) =>
          typeof document.builderMappingAnalyzedImageHash === 'string' &&
          document.builderMappingAnalyzedImageHash.length > 0
      ).length,
    },
    unchanged: 0,
  }

  for (const document of selectedDocuments) {
    const product = isRecord(document) ? document : undefined
    const id = product?.id
    if (!product || (typeof id !== 'number' && typeof id !== 'string')) {
      summary.failed += 1
      continue
    }
    const expectedUpdatedAt = typeof product.updatedAt === 'string' ? product.updatedAt : undefined
    const protectsActiveMapping =
      product.builderMappingMode === 'manual' ||
      product.builderMappingStatus === 'manual' ||
      product.builderMappingStatus === 'reviewed'
    if (product.builderMappingMode === 'manual') summary.manual += 1

    let analysisConfidence: number | undefined
    let imageHash: string | undefined
    try {
      const gallery = await resolveGalleryMedia(payload, product)
      if (gallery.length === 0) throw new Error('Mapped product image is unavailable')
      const currentImageIndex = mappedImageIndex(product)
      const productName = typeof product.name === 'string' ? product.name : ''
      if (
        !isAvailableOpalListing(productName) ||
        classifyOpalListing(productName) !== 'individual'
      ) {
        const selected =
          gallery.find((candidate) => candidate.index === currentImageIndex) ?? gallery[0]
        const imageUrl = absoluteMediaUrl(selected?.media.url)
        if (!imageUrl) throw new Error('Mapped product image is unavailable')
        const source = await fetchImage(imageUrl)
        imageHash = createHash('sha256').update(source).digest('hex')
        const updated = await updateProduct(
          payload,
          id,
          {
            builderMappingAnalyzedImageHash: imageHash,
            builderContourCandidate: null,
            builderPhotoCandidateImageIndex: null,
            builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
            builderPhotoAnalysisConfidence: null,
            builderPhotoCandidateFocalX: null,
            builderPhotoCandidateFocalY: null,
            builderPhotoCandidateZoom: null,
            builderPhotoCandidateRotation: null,
            builderMappingAnalysisError:
              'Automatic crop mapping skipped for a non-individual or non-opal listing',
          },
          expectedUpdatedAt
        )
        if (!updated) {
          summary.unchanged += 1
          continue
        }
        summary.nonIndividual += 1
        continue
      }

      const analyses: GalleryAnalysis[] = []
      const failures: Array<{ error: unknown; index: number }> = []
      for (const sourceImage of gallery) {
        try {
          const imageUrl = absoluteMediaUrl(sourceImage.media.url)
          if (!imageUrl) throw new Error('Gallery image is unavailable')
          const source = await fetchImage(imageUrl)
          const sourceHash = createHash('sha256').update(source).digest('hex')
          if (!imageHash || sourceImage.index === currentImageIndex) imageHash = sourceHash
          const analysis = await analyzeSourceRaster(
            source,
            ANALYSIS_EDGE_PX,
            product,
            protectsActiveMapping && sourceImage.index === currentImageIndex
              ? reviewedAnalysisHints(product)
              : undefined
          )
          const confidence = finiteBetween(analysis.confidence, 0, 1, 'confidence')
          const candidate = parseBuilderStoneContour(analysis.contour)
          if (!candidate) throw new Error('Image analysis returned an invalid opal contour')
          analyses.push({
            analysis,
            confidence,
            contour: candidate,
            imageHash: sourceHash,
            index: sourceImage.index,
            source,
          })
        } catch (error: unknown) {
          failures.push({ error, index: sourceImage.index })
        }
      }

      const selection = selectGalleryAnalysis(analyses, currentImageIndex)
      if (!selection) {
        const preferredFailure =
          failures.find((failure) => failure.index === currentImageIndex) ?? failures[0]
        throw preferredFailure?.error ?? new Error('No gallery image could be analyzed')
      }
      const selected = selection.candidate
      const { analysis, contour: candidate } = selected
      analysisConfidence = selected.confidence
      imageHash = selected.imageHash
      const isActivationCandidate =
        !protectsActiveMapping &&
        !selection.ambiguousSource &&
        (product.builderMappingStatus === 'pending' || product.builderMappingStatus === 'stale') &&
        analysis.source === 'image' &&
        analysisConfidence >= MINIMUM_ACTIVE_CONTOUR_CONFIDENCE
      let stableAcrossResolutions = false
      if (isActivationCandidate) {
        try {
          const secondaryAnalysis = await analyzeSourceRaster(
            selected.source,
            STABILITY_ANALYSIS_EDGE_PX,
            product
          )
          stableAcrossResolutions = analysesAreStable(selected, secondaryAnalysis)
        } catch {
          // The primary candidate remains useful for visual review even when
          // the independent stability pass cannot reproduce it.
          stableAcrossResolutions = false
        }
      }
      let canonicalFaceReady = false
      let canonicalFaceError: string | undefined
      const currentAnalysis = analyses.find((candidate) => candidate.index === currentImageIndex)
      const approvedAnalysis = currentAnalysis
        ? approvedCanonicalAnalysis(product, currentAnalysis, currentImageIndex)
        : undefined
      const canonicalAnalysis = approvedAnalysis ?? analysis
      const canonicalSource = approvedAnalysis ? currentAnalysis?.source : selected.source
      if ((isActivationCandidate && stableAcrossResolutions) || approvedAnalysis) {
        try {
          if (!canonicalSource) throw new Error('Canonical face source is unavailable')
          const canonicalFace = await generateCanonicalFaceTexture({
            analysis: canonicalAnalysis,
            source: canonicalSource,
          })
          if (canonicalFace.status === 'generated') {
            try {
              if (!options.canonicalFaceArtifactSink) {
                throw new Error('Canonical face artifact sink is not configured')
              }
              const receipt = await options.canonicalFaceArtifactSink({
                artifact: canonicalFace,
                productId: id,
                ...(typeof product.slug === 'string' ? { productSlug: product.slug } : {}),
                sourceImageIndex: approvedAnalysis ? currentImageIndex : selected.index,
              })
              if (
                receipt.contentHash !== canonicalFace.metadata.contentHash ||
                receipt.pathname !== canonicalFace.metadata.storageKey ||
                !receipt.url
              ) {
                throw new Error('Canonical face artifact sink returned a mismatched receipt')
              }
              canonicalFaceReady = true
            } catch (error: unknown) {
              canonicalFaceError = `${RETRYABLE_ARTIFACT_ERROR_PREFIX}${conciseError(error)}`
            }
          } else {
            canonicalFaceError =
              'Canonical face texture was skipped because analysis did not isolate image pixels'
          }
        } catch (error: unknown) {
          canonicalFaceError = `Canonical face texture generation failed: ${conciseError(error)}`
        }
      }
      const mayActivateContour =
        isActivationCandidate && stableAcrossResolutions && canonicalFaceReady
      const recordedAnalysis = protectsActiveMapping && currentAnalysis ? currentAnalysis : selected
      const analysisError = selection.ambiguousSource
        ? 'A different gallery image may be suitable; choose the mapped source before activation'
        : analysis.source !== 'image'
          ? 'Named-shape fallback requires visual review before activation'
          : analysisConfidence < MINIMUM_ACTIVE_CONTOUR_CONFIDENCE
            ? 'Opal contour confidence is too low for automatic activation'
            : isActivationCandidate && !stableAcrossResolutions
              ? UNSTABLE_ANALYSIS_ERROR
              : canonicalFaceError
                ? canonicalFaceError
                : null

      const updated = await updateProduct(
        payload,
        id,
        {
          ...(mayActivateContour
            ? {
                builderMappedImageIndex: selected.index,
                builderContour: candidate,
                builderContourSourceImageHash: imageHash,
                builderPhotoFocalX: finiteBetween(analysis.focalX, 0, 1, 'focalX'),
                builderPhotoFocalY: finiteBetween(analysis.focalY, 0, 1, 'focalY'),
                builderPhotoZoom: finiteBetween(analysis.zoom, 1, 12, 'zoom'),
                builderPhotoRotation: finiteBetween(analysis.rotation, -180, 180, 'rotation'),
              }
            : {}),
          builderContourCandidate: candidate,
          builderMappingAnalyzedImageHash: recordedAnalysis.imageHash,
          builderMappingVersion: BUILDER_MAPPING_VERSION,
          builderPhotoCandidateImageIndex: selected.index,
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          builderPhotoAnalysisConfidence: recordedAnalysis.confidence,
          builderPhotoCandidateFocalX: finiteBetween(analysis.focalX, 0, 1, 'focalX'),
          builderPhotoCandidateFocalY: finiteBetween(analysis.focalY, 0, 1, 'focalY'),
          builderPhotoCandidateZoom: finiteBetween(analysis.zoom, 1, 12, 'zoom'),
          builderPhotoCandidateRotation: finiteBetween(analysis.rotation, -180, 180, 'rotation'),
          builderMappingAnalysisError: analysisError,
        },
        expectedUpdatedAt
      )
      if (!updated) {
        summary.unchanged += 1
        continue
      }
      summary.analyzed += 1
    } catch (error: unknown) {
      const updated = await updateProduct(
        payload,
        id,
        {
          ...(imageHash ? { builderMappingAnalyzedImageHash: imageHash } : {}),
          builderMappingVersion: BUILDER_MAPPING_VERSION,
          builderContourCandidate: null,
          builderPhotoCandidateImageIndex: null,
          builderPhotoAnalysisConfidence: analysisConfidence ?? null,
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          builderPhotoCandidateFocalX: null,
          builderPhotoCandidateFocalY: null,
          builderPhotoCandidateZoom: null,
          builderPhotoCandidateRotation: null,
          builderMappingAnalysisError: conciseError(error),
        },
        expectedUpdatedAt
      )
      if (!updated) {
        summary.unchanged += 1
        continue
      }
      summary.failed += 1
    }
  }

  const coverage = await findAllAvailableProducts(payload, 0)
  summary.coverage.total = coverage.length
  for (const document of coverage) {
    const name = typeof document.name === 'string' ? document.name : ''
    const isAvailableIndividual =
      isAvailableOpalListing(name) && classifyOpalListing(name) === 'individual'
    if (isAvailableIndividual) {
      summary.coverage.availableIndividuals += 1
    }
    if (parseBuilderStoneContour(document.builderContour)) summary.coverage.activeContours += 1
    if (parseBuilderStoneContour(document.builderContourCandidate)) {
      summary.coverage.candidates += 1
      if (isAvailableIndividual && typeof document.slug === 'string') {
        summary.coverage.reviewCandidates.push(document.slug)
      }
    }
    if (document.builderEligible === true) summary.coverage.eligible += 1
    if (
      document.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION &&
      typeof document.builderMappingAnalyzedImageHash === 'string' &&
      document.builderMappingAnalyzedImageHash.length > 0
    ) {
      summary.coverage.currentAnalyses += 1
    }
    const currentError =
      document.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION &&
      typeof document.builderMappingAnalysisError === 'string' &&
      document.builderMappingAnalysisError.length > 0
        ? document.builderMappingAnalysisError
        : undefined
    if (currentError) {
      if (isAvailableIndividual) {
        summary.coverage.failedCurrent += 1
        summary.coverage.individualFailures.push({
          error: currentError,
          slug: typeof document.slug === 'string' ? document.slug : String(document.id),
        })
      } else {
        summary.coverage.skippedCurrent += 1
      }
    }
  }

  return summary
}

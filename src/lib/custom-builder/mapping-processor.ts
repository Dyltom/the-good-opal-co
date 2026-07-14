import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { Product } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from './mapping-lifecycle'
import { classifyOpalListing, isAvailableOpalListing } from './opal-visual'
import { analyzeOpalRaster, type OpalShapeHint } from './photo-analysis'
import { parseBuilderStoneContour } from './stone-contour'

const MAX_SOURCE_BYTES = 25 * 1024 * 1024
const ANALYSIS_EDGE_PX = 640
const MINIMUM_ACTIVE_CONTOUR_CONFIDENCE = 0.75
const RETRYABLE_ANALYSIS_ERROR_PREFIX = 'Retryable source error: '

class RetryableSourceError extends Error {}

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type ProductRecord = Record<string, unknown>

interface MediaRecord extends ProductRecord {
  id?: number | string
  url?: string | null
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
  limit?: number
}

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
    return !currentVersion || error.startsWith(RETRYABLE_ANALYSIS_ERROR_PREFIX)
  }

  const hasHash =
    typeof product.builderMappingAnalyzedImageHash === 'string' &&
    product.builderMappingAnalyzedImageHash.length > 0
  const hasCandidate = Boolean(parseBuilderStoneContour(product.builderContourCandidate))
  return !currentVersion || !hasHash || !hasCandidate
}

function analysisPriority(value: unknown): number {
  if (!isRecord(value)) return 1
  const product = value
  const name = typeof product.name === 'string' ? product.name : ''
  return isAvailableOpalListing(name) && classifyOpalListing(name) === 'individual' ? 0 : 1
}

async function resolveMappedMedia(
  payload: PayloadClient,
  product: ProductRecord
): Promise<MediaRecord | undefined> {
  const images = Array.isArray(product.images) ? product.images : []
  const selected = images[mappedImageIndex(product)] ?? images[0]
  const relationship = isRecord(selected) && 'image' in selected ? selected.image : selected

  if (isRecord(relationship)) return relationship
  if (typeof relationship !== 'number' && typeof relationship !== 'string') return undefined

  const media = await payload.findByID({
    collection: 'media',
    id: relationship,
    depth: 0,
    overrideAccess: true,
  })
  return isRecord(media) ? media : undefined
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

function normalizedOrigin(value: string | undefined, defaultProtocol?: 'https:'): string | undefined {
  const configured = value?.trim()
  if (!configured) return undefined

  try {
    const url = new URL(
      defaultProtocol && !configured.includes('://') ? `${defaultProtocol}//${configured}` : configured
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

async function fetchImage(url: string): Promise<Buffer> {
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
    if (response.status === 408 || response.status === 429 || response.status >= 500) {
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
      data: data as Partial<Product>,
      overrideAccess: true,
    })
    return result.docs.length === 1
  }

  await payload.update({
    collection: 'products',
    id,
    data: data as Partial<Product>,
    overrideAccess: true,
  })
  return true
}

export async function processBuilderMappings(
  options: ProcessBuilderMappingsOptions = {}
): Promise<BuilderMappingBatchResult> {
  const limit = Math.max(1, Math.min(25, Math.floor(options.limit ?? 10)))
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 1000,
    sort: 'updatedAt',
    overrideAccess: true,
    where: {
      and: [
        { category: { equals: 'raw-opals' } },
        { status: { equals: 'published' } },
        { stock: { greater_than: 0 } },
      ],
    },
  })
  const selectedDocuments = result.docs
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
    const expectedUpdatedAt =
      typeof product.updatedAt === 'string' ? product.updatedAt : undefined
    const protectsActiveMapping =
      product.builderMappingMode === 'manual' ||
      product.builderMappingStatus === 'manual' ||
      product.builderMappingStatus === 'reviewed'
    if (product.builderMappingMode === 'manual') summary.manual += 1

    let analysisConfidence: number | undefined
    let imageHash: string | undefined
    try {
      const media = await resolveMappedMedia(payload, product)
      const imageUrl = absoluteMediaUrl(media?.url)
      if (!imageUrl) throw new Error('Mapped product image is unavailable')

      const source = await fetchImage(imageUrl)
      imageHash = createHash('sha256').update(source).digest('hex')
      const alreadyAnalyzed =
        product.builderMappingAnalyzedImageHash === imageHash &&
        product.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION &&
        Boolean(parseBuilderStoneContour(product.builderContourCandidate))
      if (alreadyAnalyzed) {
        summary.unchanged += 1
        continue
      }
      const productName = typeof product.name === 'string' ? product.name : ''
      if (
        !isAvailableOpalListing(productName) ||
        classifyOpalListing(productName) !== 'individual'
      ) {
        const updated = await updateProduct(
          payload,
          id,
          {
            builderMappingAnalyzedImageHash: imageHash,
            builderContourCandidate: null,
            builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
            builderPhotoAnalysisConfidence: null,
            builderPhotoCandidateFocalX: null,
            builderPhotoCandidateFocalY: null,
            builderPhotoCandidateZoom: null,
            builderPhotoCandidateRotation: null,
            builderMappingAnalysisError:
              'Automatic crop mapping skipped for a non-individual or non-opal listing',
          },
          undefined
        )
        if (!updated) {
          summary.unchanged += 1
          continue
        }
        summary.nonIndividual += 1
        continue
      }

      const raster = await sharp(source, { limitInputPixels: 40_000_000 })
        .rotate()
        .toColourspace('srgb')
        .removeAlpha()
        .resize({
          width: ANALYSIS_EDGE_PX,
          height: ANALYSIS_EDGE_PX,
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
        ...(protectsActiveMapping ? reviewedAnalysisHints(product) : {}),
        stoneAspect: stoneAspect(product),
        width: raster.info.width,
      })
      if (!analysis) throw new Error('Opal face could not be isolated from the source image')
      analysisConfidence = finiteBetween(analysis.confidence, 0, 1, 'confidence')
      const candidate = parseBuilderStoneContour(analysis.contour)
      if (!candidate) throw new Error('Image analysis returned an invalid opal contour')
      const mayActivateContour =
        !protectsActiveMapping &&
        (product.builderMappingStatus === 'pending' || product.builderMappingStatus === 'stale') &&
        analysisConfidence >= MINIMUM_ACTIVE_CONTOUR_CONFIDENCE
      const analysisError =
        analysisConfidence < MINIMUM_ACTIVE_CONTOUR_CONFIDENCE
          ? 'Opal contour confidence is too low for automatic activation'
          : null

      const updated = await updateProduct(
        payload,
        id,
        {
          ...(mayActivateContour
            ? {
                builderContour: candidate,
                builderContourSourceImageHash: imageHash,
                builderPhotoFocalX: finiteBetween(analysis.focalX, 0, 1, 'focalX'),
                builderPhotoFocalY: finiteBetween(analysis.focalY, 0, 1, 'focalY'),
                builderPhotoZoom: finiteBetween(analysis.zoom, 1, 12, 'zoom'),
                builderPhotoRotation: finiteBetween(analysis.rotation, -180, 180, 'rotation'),
              }
            : {}),
          builderContourCandidate: candidate,
          builderMappingAnalyzedImageHash: imageHash,
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          builderPhotoAnalysisConfidence: analysisConfidence,
          builderPhotoCandidateFocalX: finiteBetween(analysis.focalX, 0, 1, 'focalX'),
          builderPhotoCandidateFocalY: finiteBetween(analysis.focalY, 0, 1, 'focalY'),
          builderPhotoCandidateZoom: finiteBetween(analysis.zoom, 1, 12, 'zoom'),
          builderPhotoCandidateRotation: finiteBetween(
            analysis.rotation,
            -180,
            180,
            'rotation'
          ),
          builderMappingAnalysisError: analysisError,
        },
        mayActivateContour ? expectedUpdatedAt : undefined
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
          builderContourCandidate: null,
          builderPhotoAnalysisConfidence: analysisConfidence ?? null,
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          builderPhotoCandidateFocalX: null,
          builderPhotoCandidateFocalY: null,
          builderPhotoCandidateZoom: null,
          builderPhotoCandidateRotation: null,
          builderMappingAnalysisError: conciseError(error),
        },
        undefined
      )
      if (!updated) {
        summary.unchanged += 1
        continue
      }
      summary.failed += 1
    }
  }

  const coverage = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: {
      and: [
        { category: { equals: 'raw-opals' } },
        { status: { equals: 'published' } },
        { stock: { greater_than: 0 } },
      ],
    },
  })
  summary.coverage.total = coverage.docs.length
  for (const document of coverage.docs) {
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

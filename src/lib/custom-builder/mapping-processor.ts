import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { Product } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from './mapping-lifecycle'
import { classifyOpalListing, isAvailableOpalListing } from './opal-visual'
import { analyzeOpalRaster } from './photo-analysis'

const MAX_SOURCE_BYTES = 25 * 1024 * 1024
const ANALYSIS_EDGE_PX = 640
const MINIMUM_ANALYSIS_CONFIDENCE = 0.65

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type ProductRecord = Record<string, unknown>

interface MediaRecord extends ProductRecord {
  id?: number | string
  url?: string | null
}

export interface ProcessBuilderMappingsOptions {
  limit?: number
}

export interface BuilderMappingBatchResult {
  analyzed: number
  checked: number
  failed: number
  manual: number
  nonIndividual: number
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (!appUrl) return undefined
    return new URL(resolved, appUrl).toString()
  }
}

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { accept: 'image/*' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Source image request failed (${response.status})`)

  const contentType = response.headers.get('content-type')
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Source media is not an image')
  }
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
    throw new Error('Source image exceeds 25 MB analysis limit')
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length === 0) throw new Error('Source image is empty')
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error('Source image exceeds 25 MB analysis limit')
  return bytes
}

function conciseError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown image analysis error'
  return message.replace(/\s+/g, ' ').trim().slice(0, 500)
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
  data: ProductRecord
): Promise<void> {
  await payload.update({
    collection: 'products',
    id,
    data: data as Partial<Product>,
    overrideAccess: true,
  })
}

export async function processBuilderMappings(
  options: ProcessBuilderMappingsOptions = {}
): Promise<BuilderMappingBatchResult> {
  const limit = Math.max(1, Math.min(25, Math.floor(options.limit ?? 10)))
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit,
    sort: 'updatedAt',
    overrideAccess: true,
    where: {
      and: [
        { category: { equals: 'raw-opals' } },
        { builderMappingStatus: { in: ['pending', 'stale'] } },
        {
          or: [
            { builderMappingMode: { not_equals: 'manual' } },
            { builderMappingMode: { exists: false } },
          ],
        },
        {
          or: [
            { builderMappingAnalyzedImageHash: { exists: false } },
            { builderPhotoAnalysisVersion: { exists: false } },
            {
              builderPhotoAnalysisVersion: {
                not_equals: BUILDER_PHOTO_ANALYSIS_VERSION,
              },
            },
          ],
        },
      ],
    },
  })

  const summary: BuilderMappingBatchResult = {
    analyzed: 0,
    checked: result.docs.length,
    failed: 0,
    manual: 0,
    nonIndividual: 0,
    unchanged: 0,
  }

  for (const document of result.docs) {
    const product = isRecord(document) ? document : undefined
    const id = product?.id
    if (!product || (typeof id !== 'number' && typeof id !== 'string')) {
      summary.failed += 1
      continue
    }
    if (product.builderMappingMode === 'manual') {
      summary.manual += 1
      continue
    }

    let analyzedImageHash: string | undefined
    let analysisConfidence: number | undefined
    try {
      const media = await resolveMappedMedia(payload, product)
      const imageUrl = absoluteMediaUrl(media?.url)
      if (!imageUrl) throw new Error('Mapped product image is unavailable')

      const source = await fetchImage(imageUrl)
      const imageHash = createHash('sha256').update(source).digest('hex')
      analyzedImageHash = imageHash
      const alreadyAnalyzed =
        product.builderMappingAnalyzedImageHash === imageHash &&
        product.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION
      if (alreadyAnalyzed) {
        summary.unchanged += 1
        continue
      }
      const productName = typeof product.name === 'string' ? product.name : ''
      if (
        !isAvailableOpalListing(productName) ||
        classifyOpalListing(productName) !== 'individual'
      ) {
        await updateProduct(payload, id, {
          builderMappingAnalyzedImageHash: imageHash,
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          builderPhotoAnalysisConfidence: null,
          builderMappingAnalysisError:
            'Automatic crop mapping skipped for a non-individual or non-opal listing',
        })
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
        stoneAspect: stoneAspect(product),
        width: raster.info.width,
      })
      if (!analysis) throw new Error('Opal face could not be isolated from the source image')
      analysisConfidence = finiteBetween(analysis.confidence, 0, 1, 'confidence')
      if (analysisConfidence < MINIMUM_ANALYSIS_CONFIDENCE) {
        throw new Error('Opal photo analysis confidence is too low for automatic crop mapping')
      }

      await updateProduct(payload, id, {
        builderPhotoFocalX: finiteBetween(analysis.focalX, 0, 1, 'focalX'),
        builderPhotoFocalY: finiteBetween(analysis.focalY, 0, 1, 'focalY'),
        builderPhotoZoom: finiteBetween(analysis.zoom, 1, 12, 'zoom'),
        builderPhotoRotation: finiteBetween(analysis.rotation, -180, 180, 'rotation'),
        builderMappingAnalyzedImageHash: imageHash,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoAnalysisConfidence: analysisConfidence,
        builderMappingAnalysisError: null,
      })
      summary.analyzed += 1
    } catch (error: unknown) {
      summary.failed += 1
      await updateProduct(payload, id, {
        ...(analyzedImageHash
          ? {
              builderMappingAnalyzedImageHash: analyzedImageHash,
              builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
              builderPhotoAnalysisConfidence: analysisConfidence ?? null,
            }
          : {}),
        builderMappingAnalysisError: conciseError(error),
      })
    }
  }

  return summary
}

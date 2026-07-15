import type { Media } from '@/types/payload-types'
import { createHash } from 'node:crypto'
import { getPayload } from '@/lib/payload'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadWordPressMedia, type WordPressFeaturedMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'
import { retrySerializableTransaction } from '@/lib/postgres-retry'

const TENANT_ID = 'good-opal-co'
const MAX_OWNED_MEDIA_BYTES = 15 * 1024 * 1024

function mediaMatchesSource(media: Media, source: WordPressFeaturedMedia): boolean {
  return media.legacyWordPressId === source.id && media.legacySourceUrl === source.sourceUrl
}

function mediaMetadataMatches(media: Media, source: WordPressFeaturedMedia): boolean {
  return (
    media.alt === source.alt &&
    (media.caption ?? '') === source.title &&
    media.tenantId === TENANT_ID
  )
}

function mediaContentHash(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex')
}

function applicationOrigin(): string | undefined {
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl}`
  return process.env.NEXT_PUBLIC_APP_URL?.trim()
}

function ownedMediaDownloadUrl(media: Media): URL | undefined {
  if (!media.url) return undefined
  try {
    const parsed = new URL(media.url, applicationOrigin())
    if (parsed.pathname.startsWith('/api/media/file/')) {
      const origin = applicationOrigin()
      return origin ? new URL(`${parsed.pathname}${parsed.search}`, origin) : undefined
    }
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname.toLowerCase().endsWith('.blob.vercel-storage.com')
    ) {
      return parsed
    }
  } catch {
    return undefined
  }
  return undefined
}

async function downloadOwnedMediaBytes(media: Media): Promise<Buffer | undefined> {
  const url = ownedMediaDownloadUrl(media)
  if (!url) return undefined
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok) return undefined
    const declaredLength = Number(response.headers.get('content-length') ?? 0)
    if (declaredLength > MAX_OWNED_MEDIA_BYTES) return undefined
    const data = Buffer.from(await response.arrayBuffer())
    return data.byteLength > 0 && data.byteLength <= MAX_OWNED_MEDIA_BYTES ? data : undefined
  } catch {
    return undefined
  }
}

async function findExistingMedia(source: WordPressFeaturedMedia): Promise<Media | undefined> {
  const payload = await getPayload()
  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [
        { legacyWordPressId: { equals: source.id } },
        { legacySourceUrl: { equals: source.sourceUrl } },
      ],
    },
    limit: 2,
    overrideAccess: true,
  })
  const matchingIds = [...new Set(existing.docs.map((document) => document.id))]
  if (matchingIds.length > 1) {
    throw new Error(
      `Legacy media identity conflict for WordPress attachment ${source.id}; resolve duplicate ID/source URL records before importing`
    )
  }
  return existing.docs[0]
}

interface MediaReconciliation {
  changed: boolean
  contentHash: string
  id: number
}

async function findOrCreateMedia(source: WordPressFeaturedMedia): Promise<MediaReconciliation> {
  const payload = await getPayload()
  const existing = await findExistingMedia(source)
  if (existing && mediaMatchesSource(existing, source)) {
    const sourceFile = await downloadWordPressMedia(source)
    const sourceContentHash = mediaContentHash(sourceFile.data)
    const ownedBytes = await downloadOwnedMediaBytes(existing)
    const contentMatches =
      ownedBytes !== undefined && mediaContentHash(ownedBytes) === sourceContentHash
    const metadataMatches = mediaMetadataMatches(existing, source)
    if (contentMatches && metadataMatches) {
      return { changed: false, contentHash: sourceContentHash, id: existing.id }
    }

    const refreshed = await retrySerializableTransaction(() =>
      payload.update({
        collection: 'media',
        id: existing.id,
        data: {
          legacyWordPressId: source.id,
          legacySourceUrl: source.sourceUrl,
          alt: source.alt,
          caption: source.title,
          tenantId: TENANT_ID,
        },
        ...(!contentMatches ? { file: sourceFile } : {}),
        overrideAccess: true,
      })
    )
    return { changed: true, contentHash: sourceContentHash, id: refreshed.id }
  }

  const file = await downloadWordPressMedia(source)
  const sourceContentHash = mediaContentHash(file.data)
  if (existing) {
    const refreshed = await retrySerializableTransaction(() =>
      payload.update({
        collection: 'media',
        id: existing.id,
        data: {
          legacyWordPressId: source.id,
          legacySourceUrl: source.sourceUrl,
          alt: source.alt,
          caption: source.title,
          tenantId: TENANT_ID,
        },
        file,
        overrideAccess: true,
      })
    )
    return { changed: true, contentHash: sourceContentHash, id: refreshed.id }
  }

  try {
    return await retrySerializableTransaction(async () => {
      const afterConflict = await findExistingMedia(source)
      if (afterConflict !== undefined) {
        return { changed: false, contentHash: sourceContentHash, id: afterConflict.id }
      }

      const created = await payload.create({
        collection: 'media',
        data: {
          legacyWordPressId: source.id,
          legacySourceUrl: source.sourceUrl,
          alt: source.alt,
          caption: source.title,
          tenantId: TENANT_ID,
        },
        file,
        overrideAccess: true,
      })
      return { changed: true, contentHash: sourceContentHash, id: created.id }
    })
  } catch (error: unknown) {
    const persistedMedia = await findExistingMedia(source)
    if (!persistedMedia || !mediaMatchesSource(persistedMedia, source)) throw error
    return { changed: false, contentHash: sourceContentHash, id: persistedMedia.id }
  }
}

export interface ImportProductImagesOptions {
  expectedProductCount?: number
  expectedWooIds?: readonly number[]
  publishWooIds?: readonly number[]
  publishStockByWooId?: Readonly<Record<number, number>>
}

export interface ProductImageImportFailure {
  message: string
  productId: number
  productName: string
}

function failureMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim()
  return 'Unknown gallery reconciliation error'
}

function sourceIdentity(source: WordPressFeaturedMedia): string {
  return `${source.id}:${source.sourceUrl}`
}

export async function importProductImages(
  apply = false,
  options: ImportProductImagesOptions = {}
) {
  const payload = await getPayload()
  const sourceImages = await fetchWordPressProductImages({
    baseUrl: process.env.WOO_STORE_API_URL,
  })
  if (
    options.expectedProductCount !== undefined &&
    sourceImages.length !== options.expectedProductCount
  ) {
    throw new Error(
      `Refusing incomplete WordPress gallery snapshot: expected ${options.expectedProductCount} products, received ${sourceImages.length}`
    )
  }
  if (options.expectedWooIds) {
    const expectedWooIds = [...options.expectedWooIds].sort((left, right) => left - right)
    const sourceWooIds = sourceImages
      .map(({ productId }) => productId)
      .sort((left, right) => left - right)
    if (
      expectedWooIds.length !== sourceWooIds.length ||
      expectedWooIds.some((wooId, index) => wooId !== sourceWooIds[index])
    ) {
      throw new Error('Refusing mismatched WordPress gallery snapshot product identities')
    }
  }
  const publishWooIds = new Set(options.publishWooIds ?? [])
  for (const wooId of publishWooIds) {
    const stock = options.publishStockByWooId?.[wooId]
    if (!Number.isSafeInteger(stock) || (stock ?? -1) < 0) {
      throw new Error(
        `Refusing to publish WooCommerce product ${wooId} without exact authenticated stock`
      )
    }
  }
  let missing = 0
  let changed = 0
  let published = 0
  let quarantined = 0
  let mappingRequeued = 0
  let failed = 0
  const failures: ProductImageImportFailure[] = []

  // Quarantine removed galleries before any network download can fail. New
  // products are already staged draft/stock-zero by the catalogue phase.
  const orderedSourceImages = [...sourceImages].sort(
    (left, right) => Number(left.media.length > 0) - Number(right.media.length > 0)
  )
  for (const source of orderedSourceImages) {
    const result = await payload.find({
      collection: 'products',
      where: { legacyWooId: { equals: source.productId } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const product = result.docs[0]
    if (!product) {
      missing += 1
      continue
    }
    const existingIdentities = (product.images ?? []).map(({ image }) =>
      image && typeof image !== 'number'
        ? `${image.legacyWordPressId ?? ''}:${image.legacySourceUrl ?? ''}`
        : undefined
    )
    const sourceIdentities = source.media.map(sourceIdentity)
    const alreadyCurrent =
      existingIdentities.length === sourceIdentities.length &&
      existingIdentities.every((identity, index) => identity === sourceIdentities[index])
    const shouldQuarantine =
      source.media.length === 0 &&
      (!alreadyCurrent || product.status !== 'draft' || (product.stock ?? 0) !== 0)
    const publishStock = options.publishStockByWooId?.[source.productId]
    const hasExactPublishStock =
      Number.isSafeInteger(publishStock) && (publishStock ?? -1) >= 0
    const shouldPublish =
      source.media.length > 0 &&
      hasExactPublishStock &&
      (publishWooIds.has(source.productId) ||
        (product.status === 'draft' && (product.images?.length ?? 0) === 0))
    if (!apply) {
      if (alreadyCurrent && !shouldQuarantine && !shouldPublish) continue
      changed += 1
      continue
    }

    if (source.media.length === 0) {
      if (!shouldQuarantine) continue
      changed += 1
      await retrySerializableTransaction(() =>
        payload.update({
          collection: 'products',
          id: product.id,
          data: { images: [], status: 'draft', stock: 0 },
          overrideAccess: true,
        })
      )
      quarantined += 1
      continue
    }

    try {
      // Reconcile every source attachment before changing the product gallery.
      // If one download or upload fails, the existing verified product gallery
      // remains in place and later products still receive their updates.
      const reconciledMedia: MediaReconciliation[] = []
      for (const media of source.media) reconciledMedia.push(await findOrCreateMedia(media))
      const mediaIds = reconciledMedia.map(({ id }) => id)
      const existingMediaIds = (product.images ?? []).flatMap(({ image }) =>
        typeof image === 'number' ? [image] : image?.id ? [image.id] : []
      )
      const galleryCurrent =
        existingMediaIds.length === mediaIds.length &&
        existingMediaIds.every((id, index) => id === mediaIds[index])
      const mediaChanged = reconciledMedia.some(({ changed: didChange }) => didChange)
      const mappedImageIndex =
        typeof product.builderMappedImageIndex === 'number' &&
        Number.isInteger(product.builderMappedImageIndex) &&
        product.builderMappedImageIndex >= 0
          ? product.builderMappedImageIndex
          : 0
      const mappedSource = reconciledMedia[mappedImageIndex] ?? reconciledMedia[0]
      const builderMappingSourceChanged =
        product.category === 'raw-opals' &&
        typeof product.builderMappingAnalyzedImageHash === 'string' &&
        Boolean(mappedSource) &&
        product.builderMappingAnalyzedImageHash !== mappedSource?.contentHash
      if (!mediaChanged && galleryCurrent && !shouldPublish && !builderMappingSourceChanged) continue

      if (!galleryCurrent || shouldPublish || builderMappingSourceChanged) {
        await retrySerializableTransaction(() =>
          payload.update({
            collection: 'products',
            id: product.id,
            data: {
              ...(!galleryCurrent ? { images: mediaIds.map((image) => ({ image })) } : {}),
              ...(shouldPublish
                ? { status: 'published' as const, stock: publishStock! }
                : {}),
              ...(builderMappingSourceChanged
                ? {
                    builderEligible: false,
                    builderContourCandidate: null,
                    builderMappingAnalyzedImageHash: null,
                    builderMappingAnalysisError: null,
                    builderPhotoAnalysisConfidence: null,
                    builderPhotoAnalysisVersion: null,
                    builderPhotoCandidateFocalX: null,
                    builderPhotoCandidateFocalY: null,
                    builderPhotoCandidateZoom: null,
                    builderPhotoCandidateRotation: null,
                    ...(product.builderMappingStatus === 'reviewed' ||
                    product.builderMappingStatus === 'manual'
                      ? { builderMappingStatus: 'stale' as const }
                      : {}),
                  }
                : {}),
            },
            overrideAccess: true,
          })
        )
      }
      changed += 1
      if (builderMappingSourceChanged) mappingRequeued += 1
      if (shouldPublish) published += 1
    } catch (error: unknown) {
      failed += 1
      const failure = {
        message: failureMessage(error),
        productId: source.productId,
        productName: source.productName,
      }
      failures.push(failure)
      payload.logger.error({
        err: error,
        msg: 'WordPress product gallery reconciliation failed; continuing later products',
        productId: source.productId,
        productName: source.productName,
      })
    }
  }

  payload.logger.info(
    `WordPress product image import ${apply ? 'applied' : 'dry run'}: ${changed} changed, ${published} published, ${quarantined} quarantined, ${mappingRequeued} builder mapping requeued, ${failed} failed, ${missing} unmatched, ${sourceImages.length} source products.`
  )
  return {
    mode: apply ? 'applied' : 'dry run',
    changed,
    published,
    quarantined,
    mappingRequeued,
    failed,
    failures,
    missing,
    sourceProducts: sourceImages.length,
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedAsScript) {
  importProductImages(process.env.WORDPRESS_PRODUCT_IMAGES_APPLY === 'true')
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown import error'
      console.error(`WordPress product image import failed: ${message}`)
      process.exit(1)
    })
}

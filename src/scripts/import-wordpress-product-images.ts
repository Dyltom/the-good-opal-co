import type { Media } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadWordPressMedia, type WordPressFeaturedMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'
import { retrySerializableTransaction } from '@/lib/postgres-retry'

const TENANT_ID = 'good-opal-co'

function mediaMatchesSource(media: Media, source: WordPressFeaturedMedia): boolean {
  return media.legacyWordPressId === source.id && media.legacySourceUrl === source.sourceUrl
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

async function findOrCreateMedia(source: WordPressFeaturedMedia): Promise<number> {
  const payload = await getPayload()
  const existing = await findExistingMedia(source)
  if (existing && mediaMatchesSource(existing, source)) {
    return existing.id
  }

  const file = await downloadWordPressMedia(source)
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
    return refreshed.id
  }

  try {
    return await retrySerializableTransaction(async () => {
      const afterConflict = await findExistingMedia(source)
      if (afterConflict !== undefined) return afterConflict.id

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
      return created.id
    })
  } catch (error: unknown) {
    const persistedMedia = await findExistingMedia(source)
    if (!persistedMedia || !mediaMatchesSource(persistedMedia, source)) throw error
    return persistedMedia.id
  }
}

export interface ImportProductImagesOptions {
  expectedProductCount?: number
  expectedWooIds?: readonly number[]
  publishWooIds?: readonly number[]
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
  let missing = 0
  let changed = 0
  let published = 0
  let quarantined = 0

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
    const shouldPublish =
      source.media.length > 0 &&
      (publishWooIds.has(source.productId) ||
        (product.status === 'draft' && (product.images?.length ?? 0) === 0))
    if (alreadyCurrent && !shouldQuarantine && !shouldPublish) continue
    changed += 1
    if (!apply) continue

    if (source.media.length === 0) {
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

    const mediaIds: number[] = alreadyCurrent
      ? (product.images ?? []).flatMap(({ image }) =>
          typeof image === 'number' ? [image] : image?.id ? [image.id] : []
        )
      : []
    if (!alreadyCurrent) {
      for (const media of source.media) mediaIds.push(await findOrCreateMedia(media))
    }
    await retrySerializableTransaction(() =>
      payload.update({
        collection: 'products',
        id: product.id,
        data: {
          ...(!alreadyCurrent ? { images: mediaIds.map((image) => ({ image })) } : {}),
          ...(shouldPublish
            ? { status: 'published' as const, stock: source.inStock ? 1 : 0 }
            : {}),
        },
        overrideAccess: true,
      })
    )
    if (shouldPublish) published += 1
  }

  payload.logger.info(
    `WordPress product image import ${apply ? 'applied' : 'dry run'}: ${changed} changed, ${published} published, ${quarantined} quarantined, ${missing} unmatched, ${sourceImages.length} source products.`
  )
  return {
    mode: apply ? 'applied' : 'dry run',
    changed,
    published,
    quarantined,
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

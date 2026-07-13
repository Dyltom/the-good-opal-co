import { getPayload } from '@/lib/payload'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadWordPressMedia, type WordPressFeaturedMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'
import {
  isPostgresUniqueViolation,
  retrySerializableTransaction,
} from '@/lib/postgres-retry'

const TENANT_ID = 'good-opal-co'

async function findExistingMedia(source: WordPressFeaturedMedia): Promise<number | undefined> {
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
  return existing.docs[0]?.id
}

async function findOrCreateMedia(source: WordPressFeaturedMedia): Promise<number> {
  const payload = await getPayload()
  const existingId = await findExistingMedia(source)
  if (existingId !== undefined) return existingId

  const file = await downloadWordPressMedia(source)
  try {
    return await retrySerializableTransaction(async () => {
      const afterConflictId = await findExistingMedia(source)
      if (afterConflictId !== undefined) return afterConflictId

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
    if (!isPostgresUniqueViolation(error)) throw error
    const concurrentWinnerId = await findExistingMedia(source)
    if (concurrentWinnerId === undefined) throw error
    return concurrentWinnerId
  }
}

export async function importProductImages(apply = false) {
  const payload = await getPayload()
  const sourceImages = await fetchWordPressProductImages()
  let missing = 0
  let changed = 0

  for (const source of sourceImages) {
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
    const existingLegacyIds = (product.images ?? []).map(({ image }) =>
      image && typeof image !== 'number' ? image.legacyWordPressId : undefined
    )
    const sourceLegacyIds = source.media.map(({ id }) => id)
    const alreadyCurrent =
      existingLegacyIds.length === sourceLegacyIds.length &&
      existingLegacyIds.every((id, index) => id === sourceLegacyIds[index])
    if (alreadyCurrent) continue
    changed += 1
    if (!apply) continue

    const mediaIds: number[] = []
    for (const media of source.media) mediaIds.push(await findOrCreateMedia(media))
    await retrySerializableTransaction(() =>
      payload.update({
        collection: 'products',
        id: product.id,
        data: { images: mediaIds.map((image) => ({ image })) },
        overrideAccess: true,
      })
    )
  }

  payload.logger.info(
    `WordPress product image import ${apply ? 'applied' : 'dry run'}: ${changed} changed, ${missing} unmatched, ${sourceImages.length} source products.`
  )
  return {
    mode: apply ? 'applied' : 'dry run',
    changed,
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

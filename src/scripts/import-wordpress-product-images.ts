import { getPayload } from '@/lib/payload'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadWordPressMedia, type WordPressFeaturedMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'

const TENANT_ID = 'good-opal-co'

async function findOrCreateMedia(source: WordPressFeaturedMedia): Promise<number> {
  const payload = await getPayload()
  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [
        { legacyWordPressId: { equals: source.id } },
        { legacySourceUrl: { equals: source.sourceUrl } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    data: {
      legacyWordPressId: source.id,
      legacySourceUrl: source.sourceUrl,
      alt: source.alt,
      caption: source.title,
      tenantId: TENANT_ID,
    },
    file: await downloadWordPressMedia(source),
    overrideAccess: true,
  })
  return created.id
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

    const mediaIds = await Promise.all(source.media.map(findOrCreateMedia))
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: mediaIds.map((image) => ({ image })) },
      overrideAccess: true,
    })
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

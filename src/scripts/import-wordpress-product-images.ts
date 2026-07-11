import { getPayload } from '@/lib/payload'
import { downloadWordPressMedia } from '@/lib/wordpress/content-import'
import {
  fetchWordPressProductImages,
  type WordPressProductImage,
} from '@/lib/wordpress/product-images'

const TENANT_ID = 'good-opal-co'

async function findOrCreateMedia(source: WordPressProductImage): Promise<number> {
  const payload = await getPayload()
  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [
        { legacyWordPressId: { equals: source.media.id } },
        { legacySourceUrl: { equals: source.media.sourceUrl } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    data: {
      legacyWordPressId: source.media.id,
      legacySourceUrl: source.media.sourceUrl,
      alt: source.media.alt,
      caption: source.media.title,
      tenantId: TENANT_ID,
    },
    file: await downloadWordPressMedia(source.media),
    overrideAccess: true,
  })
  return created.id
}

async function importProductImages(): Promise<void> {
  const payload = await getPayload()
  const apply = process.env.WORDPRESS_PRODUCT_IMAGES_APPLY === 'true'
  const sourceImages = await fetchWordPressProductImages()
  let missing = 0
  let linked = 0

  for (const source of sourceImages) {
    const result = await payload.find({
      collection: 'products',
      where: { legacyWooId: { equals: source.productId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const product = result.docs[0]
    if (!product || (product.images?.length ?? 0) > 0) continue
    missing += 1
    if (!apply) continue

    const mediaId = await findOrCreateMedia(source)
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: [{ image: mediaId }] },
      overrideAccess: true,
    })
    linked += 1
  }

  payload.logger.info(
    `WordPress product image import ${apply ? 'applied' : 'dry run'}: ${missing} missing, ${linked} linked, ${sourceImages.length} source products.`
  )
}

importProductImages()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown import error'
    console.error(`WordPress product image import failed: ${message}`)
    process.exit(1)
  })

import { access } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from '@/lib/payload'
import { PRODUCTS, type Product as FallbackProduct } from '@/data/products'

type ProductCategory =
  | 'opal-rings'
  | 'opal-necklaces'
  | 'opal-earrings'
  | 'opal-bracelets'
  | 'raw-opals'

function categoryFor(product: FallbackProduct): ProductCategory {
  const name = product.name.toLowerCase()
  if (name.includes('earring') || name.includes('stud')) return 'opal-earrings'
  if (name.includes('necklace') || name.includes('pendant')) return 'opal-necklaces'
  if (name.includes('bracelet') || name.includes('bangle')) return 'opal-bracelets'
  if (name.includes('ring')) return 'opal-rings'
  return 'raw-opals'
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

async function mediaIdFor(image: string | undefined, name: string): Promise<number | null> {
  if (!image) return null
  const payload = await getPayload()
  const filename = path.basename(image)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const filePath = path.join(process.cwd(), 'public', image.replace(/^\//, ''))
  try {
    await access(filePath)
  } catch {
    return null
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt: name, tenantId: 'good-opal-co' },
    filePath,
  })
  return media.id
}

async function seed() {
  const payload = await getPayload()
  const publish = process.env.SEED_PUBLISH === 'true'
  const useSyntheticTestStock = process.env.SEED_TEST_STOCK === 'true'
  if (useSyntheticTestStock && process.env.CI !== 'true') {
    throw new Error('SEED_TEST_STOCK is allowed only in CI')
  }
  if (publish && !useSyntheticTestStock) {
    throw new Error(
      'SEED_PUBLISH requires authenticated exact inventory; SEED_TEST_STOCK is reserved for isolated test databases'
    )
  }
  let created = 0
  let published = 0
  let skipped = 0

  for (const product of PRODUCTS) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })
    const existingProduct = existing.docs[0]
    if (existingProduct) {
      if (publish && existingProduct.status === 'draft') {
        const testStock = product.available ? 1 : 0
        await payload.update({
          collection: 'products',
          id: existingProduct.id,
          data: {
            status: 'published',
            stock: testStock,
          },
        })
        published += 1
        continue
      }

      skipped += 1
      continue
    }

    const mediaId = await mediaIdFor(product.image, product.name)
    const category = categoryFor(product)
    const testStock = publish && product.available ? 1 : 0
    const trustedBuilderMapping =
      category === 'raw-opals' ? { builderMappingStatus: 'reviewed' as const } : {}
    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug: product.slug,
        description: richText(product.description),
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: testStock,
        status: publish ? 'published' : 'draft',
        featured: product.featured ?? false,
        category,
        ...trustedBuilderMapping,
        images: mediaId ? [{ image: mediaId }] : [],
        certified: false,
        sku: `WP-${product.id}`,
        tenantId: 'good-opal-co',
      },
    })
    created += 1
  }

  payload.logger.info(
    `Seed complete: ${created} created, ${published} existing drafts published, ${skipped} already present. ${publish ? 'Synthetic test catalogue is available.' : 'New products remain drafts with zero stock for authenticated import.'}`
  )
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })

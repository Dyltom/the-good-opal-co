import { access } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from '@/lib/payload'
import { PRODUCTS, type Product as LegacyProduct } from '@/data/products'

type ProductCategory =
  | 'opal-rings'
  | 'opal-necklaces'
  | 'opal-earrings'
  | 'opal-bracelets'
  | 'raw-opals'

function categoryFor(product: LegacyProduct): ProductCategory {
  const name = product.name.toLowerCase()
  if (name.includes('earring') || name.includes('stud')) return 'opal-earrings'
  if (name.includes('necklace') || name.includes('pendant')) return 'opal-necklaces'
  if (name.includes('bracelet') || name.includes('bangle')) return 'opal-bracelets'
  if (name.includes('ring')) return 'opal-rings'
  return 'raw-opals'
}

function stoneTypeFor(value?: string) {
  const values = {
    'Black Opal': 'black-opal',
    'Boulder Opal': 'boulder-opal',
    'Crystal Opal': 'crystal-opal',
    'White Opal': 'white-opal',
    Doublet: 'opal-doublet',
  } as const
  return value ? values[value as keyof typeof values] : undefined
}

function originFor(value?: string) {
  const values = {
    'Lightning Ridge, NSW': 'lightning-ridge',
    'Coober Pedy, SA': 'coober-pedy',
    'Mintabie, SA': 'mintabie',
    'Andamooka, SA': 'andamooka',
    Queensland: 'queensland',
    Australia: 'other-australian',
  } as const
  return value ? values[value as keyof typeof values] : undefined
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
        await payload.update({
          collection: 'products',
          id: existingProduct.id,
          data: {
            status: 'published',
            stock: product.stock,
          },
        })
        published += 1
        continue
      }

      skipped += 1
      continue
    }

    const mediaId = await mediaIdFor(product.image, product.name)
    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug: product.slug,
        description: richText(product.description),
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: publish ? product.stock : 0,
        status: publish ? 'published' : 'draft',
        featured: product.featured ?? false,
        category: categoryFor(product),
        images: mediaId ? [{ image: mediaId }] : [],
        stoneType: stoneTypeFor(product.stoneType),
        stoneOrigin: originFor(product.origin),
        weight: product.weight,
        certified: false,
        sku: `WP-${product.id}`,
        tenantId: 'good-opal-co',
      },
    })
    created += 1
  }

  payload.logger.info(
    `Seed complete: ${created} created, ${published} existing drafts published, ${skipped} already present. ${publish ? 'Imported catalog is available with source stock.' : 'New products remain drafts with zero stock for review.'}`
  )
}

seed().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

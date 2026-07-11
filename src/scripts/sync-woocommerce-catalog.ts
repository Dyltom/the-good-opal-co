import type { Product } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import {
  fetchWooCatalog,
  reconciledStock,
  type WooCatalogProduct,
} from '@/lib/woocommerce/catalog-sync'

const TENANT_ID = 'good-opal-co'

interface SyncOptions {
  apply: boolean
  archiveMissing: boolean
  restock: boolean
}

function enabled(name: string): boolean {
  return process.env[name] === 'true'
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
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
              text: text || 'Product details available on request.',
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

async function findAllProducts(): Promise<Product[]> {
  const payload = await getPayload()
  const products: Product[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection: 'products',
      limit: 100,
      page,
      overrideAccess: true,
    })
    products.push(...result.docs)
    hasNextPage = result.hasNextPage
    page += 1
  }

  return products
}

function createData(product: WooCatalogProduct) {
  return {
    name: product.name,
    slug: product.slug,
    description: richText(product.description),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    tags: product.tags.map((tag) => ({ tag })),
    status: 'published' as const,
    featured: false,
    stock: product.inStock ? 1 : 0,
    sku: product.sku,
    certified: false,
    tenantId: TENANT_ID,
  }
}

function updateData(existing: Product, product: WooCatalogProduct, options: SyncOptions) {
  return {
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    status: 'published' as const,
    stock: reconciledStock(existing.stock, product.inStock, options.restock),
  }
}

async function sync(options: SyncOptions): Promise<void> {
  const payload = await getPayload()
  const sourceProducts = await fetchWooCatalog({
    baseUrl: process.env.WOO_STORE_API_URL,
  })
  const allProducts = await findAllProducts()
  const existingBySku = new Map(
    allProducts
      .filter((product) => product.sku?.startsWith('WP-'))
      .map((product) => [product.sku, product])
  )
  const sourceSkus = new Set(sourceProducts.map((product) => product.sku))
  const slugOwners = new Map(allProducts.map((product) => [product.slug, product]))

  let created = 0
  let updated = 0
  let archived = 0

  for (const sourceProduct of sourceProducts) {
    const existing = existingBySku.get(sourceProduct.sku)
    const slugOwner = slugOwners.get(sourceProduct.slug)
    if (slugOwner && slugOwner.id !== existing?.id) {
      throw new Error(
        `Cannot sync ${sourceProduct.sku}: slug "${sourceProduct.slug}" belongs to product ${slugOwner.id}`
      )
    }

    if (!options.apply) {
      existing ? (updated += 1) : (created += 1)
      continue
    }

    if (existing) {
      await payload.update({
        collection: 'products',
        id: existing.id,
        data: updateData(existing, sourceProduct, options),
        overrideAccess: true,
      })
      updated += 1
    } else {
      await payload.create({
        collection: 'products',
        data: createData(sourceProduct),
        overrideAccess: true,
      })
      created += 1
    }
  }

  if (options.archiveMissing) {
    const missing = [...existingBySku.values()].filter(
      (product) => product.sku && !sourceSkus.has(product.sku)
    )
    archived = missing.length
    if (options.apply) {
      for (const product of missing) {
        await payload.update({
          collection: 'products',
          id: product.id,
          data: { status: 'archived', stock: 0 },
          overrideAccess: true,
        })
      }
    }
  }

  const mode = options.apply ? 'applied' : 'dry run'
  payload.logger.info(
    `WooCommerce catalog sync ${mode}: ${created} create, ${updated} update, ${archived} archive, ${sourceProducts.length} source products.`
  )
}

const options: SyncOptions = {
  apply: enabled('WOO_SYNC_APPLY'),
  archiveMissing: enabled('WOO_SYNC_ARCHIVE_MISSING'),
  restock: enabled('WOO_SYNC_RESTOCK'),
}

sync(options)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })

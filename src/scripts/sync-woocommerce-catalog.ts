import type { Product } from '@/types/payload-types'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from '@/lib/payload'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import {
  fetchWooCatalog,
  reconciledStock,
  type WooCatalogProduct,
} from '@/lib/woocommerce/catalog-sync'

const TENANT_ID = 'good-opal-co'

export interface SyncOptions {
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
    // A gallery reconciliation promotes this only after at least one source
    // image has been downloaded into owned storage successfully.
    status: 'draft' as const,
    featured: false,
    stock: 0,
    sku: product.sku,
    legacyWooId: product.wooId,
    certified: false,
    tenantId: TENANT_ID,
  }
}

function updateData(existing: Product, product: WooCatalogProduct, options: SyncOptions) {
  const hasOwnedImage = Boolean(existing.images?.some(({ image }) => image))
  return {
    name: product.name,
    slug: product.slug,
    description: richText(product.description),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    tags: product.tags.map((tag) => ({ tag })),
    status: hasOwnedImage ? ('published' as const) : ('draft' as const),
    stock: hasOwnedImage
      ? reconciledStock(existing.stock, product.inStock, options.restock, product.stockQuantity)
      : 0,
    legacyWooId: product.wooId,
  }
}

export async function syncWooCatalog(options: SyncOptions) {
  const payload = await getPayload()
  const sourceProducts = await fetchWooCatalog({
    baseUrl: process.env.WOO_STORE_API_URL,
    consumerKey: process.env.WOO_CONSUMER_KEY,
    consumerSecret: process.env.WOO_CONSUMER_SECRET,
  })
  const allProducts = await findAllProducts()
  const existingBySku = new Map(
    allProducts
      .filter((product) => product.sku?.startsWith('WP-'))
      .map((product) => [product.sku, product])
  )
  const existingByWooId = new Map(
    allProducts
      .filter(
        (product): product is Product & { legacyWooId: number } =>
          typeof product.legacyWooId === 'number'
      )
      .map((product) => [product.legacyWooId, product])
  )
  if (existingByWooId.size === 0 && existingBySku.size > 0) {
    throw new Error(
      'WooCommerce identity migration required before recurring catalogue sync can run'
    )
  }
  const sourceWooIds = new Set(sourceProducts.map((product) => product.wooId))
  if (options.archiveMissing && existingByWooId.size > 0) {
    const retainedProducts = [...existingByWooId.keys()].filter((wooId) =>
      sourceWooIds.has(wooId)
    ).length
    if (sourceProducts.length === 0) {
      throw new Error('Refusing to archive products from an empty WooCommerce catalogue snapshot')
    }
    if (existingByWooId.size >= 10 && retainedProducts < Math.ceil(existingByWooId.size / 2)) {
      throw new Error(
        `Refusing severe WooCommerce catalogue drop: only ${retainedProducts} of ${existingByWooId.size} managed products remain`
      )
    }
  }
  const slugOwners = new Map(allProducts.map((product) => [product.slug, product]))

  let created = 0
  const createdWooIds: number[] = []
  const sourceStockByWooId = Object.fromEntries(
    sourceProducts.map((product) => [
      product.wooId,
      reconciledStock(0, product.inStock, true, product.stockQuantity),
    ])
  )
  let updated = 0
  let archived = 0

  for (const sourceProduct of sourceProducts) {
    const byWooId = existingByWooId.get(sourceProduct.wooId)
    const bySku = existingBySku.get(sourceProduct.sku)
    if (byWooId && bySku && byWooId.id !== bySku.id) {
      throw new Error(`WooCommerce product ${sourceProduct.wooId} has conflicting identities`)
    }
    const existing = byWooId ?? bySku
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
      await retrySerializableTransaction(() =>
        payload.update({
          collection: 'products',
          id: existing.id,
          data: updateData(existing, sourceProduct, options),
          overrideAccess: true,
        })
      )
      updated += 1
    } else {
      await retrySerializableTransaction(() =>
        payload.create({
          collection: 'products',
          data: createData(sourceProduct),
          overrideAccess: true,
        })
      )
      created += 1
      createdWooIds.push(sourceProduct.wooId)
    }
  }

  if (options.archiveMissing) {
    const missing = [...existingByWooId.entries()]
      .filter(([wooId]) => !sourceWooIds.has(wooId))
      .map(([, product]) => product)
    archived = missing.length
    if (options.apply) {
      for (const product of missing) {
        await retrySerializableTransaction(() =>
          payload.update({
            collection: 'products',
            id: product.id,
            data: { status: 'archived', stock: 0 },
            overrideAccess: true,
          })
        )
      }
    }
  }

  const mode = options.apply ? 'applied' : 'dry run'
  payload.logger.info(
    `WooCommerce catalog sync ${mode}: ${created} create, ${updated} update, ${archived} archive, ${sourceProducts.length} source products.`
  )
  return {
    mode,
    created,
    createdWooIds,
    sourceStockByWooId,
    sourceWooIds: [...sourceWooIds].sort((left, right) => left - right),
    updated,
    archived,
    sourceProducts: sourceProducts.length,
  }
}

const options: SyncOptions = {
  apply: enabled('WOO_SYNC_APPLY'),
  archiveMissing: enabled('WOO_SYNC_ARCHIVE_MISSING'),
  restock: enabled('WOO_SYNC_RESTOCK'),
}

const invokedAsScript =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedAsScript) {
  syncWooCatalog(options)
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error)
      process.exit(1)
    })
}

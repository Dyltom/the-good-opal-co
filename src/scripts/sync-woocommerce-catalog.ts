import type { Product } from '@/types/payload-types'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from '@/lib/payload'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import {
  classifyOpalListing,
  inferBuilderStoneType,
  isAvailableOpalListing,
} from '@/lib/custom-builder/opal-visual'
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

export interface StockReconciliationMismatch {
  localStock: number
  reconciledStock: number
  sourceStock: number
  wooId: number
}

export interface StockReconciliationSummary {
  authenticatedSource: boolean
  managedProducts: number
  mismatchCount: number
  mismatches: StockReconciliationMismatch[]
  productsWithExactQuantity: number
  productsWithoutExactQuantity: Array<{ slug: string; wooId: number }>
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

function inferredProductFacts(product: WooCatalogProduct) {
  if (product.category !== 'raw-opals') return {}

  const stoneType = inferBuilderStoneType(undefined, product.name)
  const stoneOrigin = /lightning\s+ridge/i.test(product.name)
    ? ('lightning-ridge' as const)
    : /coober\s+pedy/i.test(product.name)
      ? ('coober-pedy' as const)
      : /mintabie/i.test(product.name)
        ? ('mintabie' as const)
        : /andamooka/i.test(product.name)
          ? ('andamooka' as const)
          : /queensland|koroit/i.test(product.name)
            ? ('queensland' as const)
            : undefined
  const weightMatch = product.name.match(/\b(\d+(?:\.\d+)?)\s*(?:ct|cts|carats?)\b/i)
  const weight = weightMatch?.[1] ? Number(weightMatch[1]) : undefined

  return {
    material: 'none' as const,
    ...(stoneType !== 'unknown-opal' ? { stoneType } : {}),
    ...(stoneOrigin ? { stoneOrigin } : {}),
    ...(weight !== undefined && Number.isFinite(weight)
      ? { weight, weightUnit: 'carats' as const }
      : {}),
  }
}

function statusManagedPublishStock(product: WooCatalogProduct): number | undefined {
  if (
    product.category !== 'raw-opals' ||
    !/\bopals?\b/i.test(product.name) ||
    !isAvailableOpalListing(product.name) ||
    classifyOpalListing(product.name) !== 'individual' ||
    product.stockQuantity !== null
  ) {
    return undefined
  }

  // A raw individual opal is a one-off inventory unit. Woo's authenticated
  // status is sufficient to make that single stone available, while parcels,
  // finished rings, services, and other non-quantity products remain draft
  // until an exact inventory model exists for them.
  return product.inStock ? 1 : 0
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
    ...inferredProductFacts(product),
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
    ...(!existing.stoneType ? inferredProductFacts(product) : {}),
  }
}

export async function syncWooCatalog(options: SyncOptions) {
  const payload = await getPayload()
  const consumerKey = process.env.WOO_CONSUMER_KEY?.trim()
  const consumerSecret = process.env.WOO_CONSUMER_SECRET?.trim()
  const sourceProducts = await fetchWooCatalog({
    baseUrl: process.env.WOO_STORE_API_URL,
    consumerKey,
    consumerSecret,
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
  // Only authenticated Woo inventory can unlock first publication. Quantity-
  // managed products use their exact count. A status-only signal maps to one
  // unit only for an individual raw opal, whose business model is inherently
  // one stone/one sale; every other null quantity stays unpublished.
  const sourceStockByWooId = Object.fromEntries(
    consumerKey && consumerSecret
      ? sourceProducts.flatMap((product) => {
          if (typeof product.stockQuantity === 'number') {
            return [
              [
                product.wooId,
                reconciledStock(0, product.inStock, true, product.stockQuantity),
              ] as const,
            ]
          }
          const statusStock = statusManagedPublishStock(product)
          return statusStock === undefined ? [] : ([[product.wooId, statusStock]] as const)
        })
      : []
  )
  let updated = 0
  let archived = 0
  const stockReconciliation: StockReconciliationSummary = {
    authenticatedSource: Boolean(consumerKey && consumerSecret),
    managedProducts: 0,
    mismatchCount: 0,
    mismatches: [],
    productsWithExactQuantity: 0,
    productsWithoutExactQuantity: [],
  }

  for (const sourceProduct of sourceProducts) {
    const byWooId = existingByWooId.get(sourceProduct.wooId)
    const bySku = existingBySku.get(sourceProduct.sku)
    if (byWooId && bySku && byWooId.id !== bySku.id) {
      throw new Error(`WooCommerce product ${sourceProduct.wooId} has conflicting identities`)
    }
    const existing = byWooId ?? bySku
    if (existing) {
      stockReconciliation.managedProducts += 1
      if (typeof sourceProduct.stockQuantity === 'number') {
        stockReconciliation.productsWithExactQuantity += 1
        const localStock = Math.max(0, existing.stock ?? 0)
        const sourceStock = reconciledStock(
          0,
          sourceProduct.inStock,
          true,
          sourceProduct.stockQuantity
        )
        if (localStock !== sourceStock) {
          stockReconciliation.mismatches.push({
            localStock,
            reconciledStock: Boolean(existing.images?.some(({ image }) => image))
              ? reconciledStock(
                  localStock,
                  sourceProduct.inStock,
                  options.restock,
                  sourceProduct.stockQuantity
                )
              : 0,
            sourceStock,
            wooId: sourceProduct.wooId,
          })
        }
      } else {
        stockReconciliation.productsWithoutExactQuantity.push({
          slug: sourceProduct.slug,
          wooId: sourceProduct.wooId,
        })
      }
    }
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

  stockReconciliation.mismatches.sort((left, right) => left.wooId - right.wooId)
  stockReconciliation.productsWithoutExactQuantity.sort((left, right) => left.wooId - right.wooId)
  stockReconciliation.mismatchCount = stockReconciliation.mismatches.length

  const mode = options.apply ? 'applied' : 'dry run'
  const mismatchSummary =
    stockReconciliation.mismatches
      .map(
        ({ localStock, reconciledStock: targetStock, sourceStock, wooId }) =>
          `${wooId}:${localStock}->${sourceStock}=>${targetStock}`
      )
      .join(',') || 'none'
  const quantityGapSummary =
    stockReconciliation.productsWithoutExactQuantity
      .map(({ slug, wooId }) => `${wooId}:${slug}`)
      .join(',') || 'none'
  payload.logger.info(
    `WooCommerce catalog sync ${mode}: ${created} create, ${updated} update, ${archived} archive, ${sourceProducts.length} source products; stock source ${stockReconciliation.authenticatedSource ? 'authenticated' : 'public fallback'}, exact quantities ${stockReconciliation.productsWithExactQuantity}/${stockReconciliation.managedProducts}, missing exact quantities ${stockReconciliation.productsWithoutExactQuantity.length} (${quantityGapSummary}), local/source mismatches ${stockReconciliation.mismatchCount} (${mismatchSummary}).`
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
    stockReconciliation,
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

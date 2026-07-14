import { z } from 'zod'

const wooPricesSchema = z.object({
  price: z.string().regex(/^\d+$/),
  regular_price: z.string().regex(/^\d+$/),
  sale_price: z.string().regex(/^\d+$/),
  currency_code: z.literal('AUD'),
  currency_minor_unit: z.number().int().min(0).max(6),
})

const wooTaxonomySchema = z.object({
  name: z.string(),
  slug: z.string(),
})

const wooProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  short_description: z.string(),
  prices: wooPricesSchema,
  categories: z.array(wooTaxonomySchema),
  tags: z.array(wooTaxonomySchema),
  is_in_stock: z.boolean(),
})

const wooProductPageSchema = z.array(wooProductSchema)

const wooStockProductSchema = z.object({
  id: z.number().int().positive(),
  stock_quantity: z.number().int().nonnegative().nullable(),
  stock_status: z.enum(['instock', 'outofstock', 'onbackorder']),
})

const wooStockProductPageSchema = z.array(wooStockProductSchema)

type WooProduct = z.infer<typeof wooProductSchema>

export type ProductCategory =
  | 'opal-rings'
  | 'opal-necklaces'
  | 'opal-earrings'
  | 'opal-bracelets'
  | 'raw-opals'

export interface WooCatalogProduct {
  wooId: number
  sku: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  category: ProductCategory
  tags: string[]
  inStock: boolean
  stockQuantity?: number | null
}

export interface CatalogFetchOptions {
  baseUrl?: string
  consumerKey?: string
  consumerSecret?: string
  fetcher?: typeof fetch
  perPage?: number
}

const namedEntities: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    }
    if (code.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    }
    return namedEntities[code.toLowerCase()] ?? entity
  })
}

export function plainTextFromHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<(form|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function categoryForWooProduct(
  product: Pick<WooProduct, 'name' | 'categories' | 'tags'>
): ProductCategory {
  const searchable = [
    product.name,
    ...product.categories.flatMap((category) => [category.name, category.slug]),
    ...product.tags.flatMap((tag) => [tag.name, tag.slug]),
  ]
    .join(' ')
    .toLowerCase()

  if (/earring|stud/.test(searchable)) return 'opal-earrings'
  if (/necklace|pendant/.test(searchable)) return 'opal-necklaces'
  if (/bracelet|bangle/.test(searchable)) return 'opal-bracelets'
  if (/ring/.test(searchable)) return 'opal-rings'
  return 'raw-opals'
}

function priceInMajorUnits(value: string, minorUnit: number): number {
  return Number(value) / 10 ** minorUnit
}

export function mapWooProduct(product: WooProduct): WooCatalogProduct {
  const price = priceInMajorUnits(product.prices.price, product.prices.currency_minor_unit)
  const regularPrice = priceInMajorUnits(
    product.prices.regular_price,
    product.prices.currency_minor_unit
  )

  return {
    wooId: product.id,
    sku: `WP-${product.id}`,
    name: decodeHtmlEntities(product.name),
    slug: product.slug,
    description: plainTextFromHtml(product.description || product.short_description),
    price,
    compareAtPrice: regularPrice > price ? regularPrice : null,
    category: categoryForWooProduct(product),
    tags: product.tags.map((tag) => decodeHtmlEntities(tag.name)),
    inStock: product.is_in_stock,
  }
}

export function parseWooProductPage(input: unknown): WooCatalogProduct[] {
  return wooProductPageSchema.parse(input).map(mapWooProduct)
}

/**
 * Never increases existing inventory by default. This prevents a later catalog
 * sync from putting a one-off opal back on sale after a local paid order reduced
 * its stock to zero. Enable restocking only for an intentional source-of-truth
 * import.
 */
export function reconciledStock(
  currentStock: number | null | undefined,
  sourceInStock: boolean,
  restock: boolean,
  sourceQuantity?: number | null
): number {
  if (!sourceInStock) return 0
  if (sourceQuantity !== undefined && sourceQuantity !== null) {
    return restock ? sourceQuantity : Math.min(Math.max(0, currentStock ?? 0), sourceQuantity)
  }
  if (restock) return 1
  return Math.max(0, currentStock ?? 0)
}

function authenticatedProductsUrl(storeApiUrl: string): URL {
  const url = new URL(storeApiUrl)
  url.pathname = '/wp-json/wc/v3/products'
  url.search = ''
  url.hash = ''
  return url
}

async function fetchAuthenticatedStock(
  productIds: readonly number[],
  options: Required<Pick<CatalogFetchOptions, 'consumerKey' | 'consumerSecret' | 'fetcher'>> & {
    baseUrl: string
    perPage: number
  }
): Promise<Map<number, { inStock: boolean; stockQuantity: number | null }>> {
  const stockByWooId = new Map<number, { inStock: boolean; stockQuantity: number | null }>()
  const authorization = `Basic ${Buffer.from(
    `${options.consumerKey}:${options.consumerSecret}`
  ).toString('base64')}`

  for (let start = 0; start < productIds.length; start += options.perPage) {
    const batch = productIds.slice(start, start + options.perPage)
    const url = authenticatedProductsUrl(options.baseUrl)
    url.searchParams.set('include', batch.join(','))
    url.searchParams.set('per_page', String(options.perPage))
    url.searchParams.set('status', 'any')

    const response = await options.fetcher(url, {
      headers: {
        accept: 'application/json',
        authorization,
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(`WooCommerce authenticated stock request failed (${response.status})`)
    }

    for (const product of wooStockProductPageSchema.parse(await response.json())) {
      if (stockByWooId.has(product.id)) {
        throw new Error('WooCommerce authenticated stock response returned duplicate product IDs')
      }
      stockByWooId.set(product.id, {
        inStock: product.stock_status !== 'outofstock',
        stockQuantity: product.stock_quantity,
      })
    }
  }

  if (stockByWooId.size !== productIds.length || productIds.some((id) => !stockByWooId.has(id))) {
    throw new Error('WooCommerce authenticated stock response omitted catalogue products')
  }
  return stockByWooId
}

export async function fetchWooCatalog(
  options: CatalogFetchOptions = {}
): Promise<WooCatalogProduct[]> {
  const fetcher = options.fetcher ?? fetch
  const baseUrl = options.baseUrl ?? 'https://goodopalco.com/wp-json/wc/store/v1/products'
  const perPage = options.perPage ?? 100
  const catalog: WooCatalogProduct[] = []
  let page = 1
  let totalPages: number | null = null

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('stock_status', 'instock,outofstock,onbackorder')

    const response = await fetcher(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(`WooCommerce catalog request failed (${response.status}) for page ${page}`)
    }

    const products = parseWooProductPage(await response.json())
    catalog.push(...products)

    const header = response.headers.get('x-wp-totalpages')
    if (header !== null) {
      const parsed = Number.parseInt(header, 10)
      if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`WooCommerce returned invalid X-WP-TotalPages: ${header}`)
      }
      totalPages = parsed
    }

    if (totalPages === null && products.length < perPage) break
    page += 1
  } while (totalPages === null || page <= totalPages)

  const unique = new Map(catalog.map((product) => [product.wooId, product]))
  if (unique.size !== catalog.length) {
    throw new Error('WooCommerce catalog returned duplicate product IDs')
  }

  const products = [...unique.values()]
  const consumerKey = options.consumerKey?.trim()
  const consumerSecret = options.consumerSecret?.trim()
  if (Boolean(consumerKey) !== Boolean(consumerSecret)) {
    throw new Error('WooCommerce stock credentials must include both key and secret')
  }
  if (!consumerKey || !consumerSecret || products.length === 0) return products

  const stockByWooId = await fetchAuthenticatedStock(
    products.map((product) => product.wooId),
    {
      baseUrl,
      consumerKey,
      consumerSecret,
      fetcher,
      perPage: Math.min(perPage, 100),
    }
  )
  return products.map((product) => ({
    ...product,
    ...stockByWooId.get(product.wooId),
  }))
}

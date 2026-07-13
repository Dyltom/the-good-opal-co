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
}

export interface CatalogFetchOptions {
  baseUrl?: string
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
  restock: boolean
): number {
  if (!sourceInStock) return 0
  if (restock) return 1
  return Math.max(0, currentStock ?? 0)
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

  return [...unique.values()]
}

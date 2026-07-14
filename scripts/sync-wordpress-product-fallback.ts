import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { parseWooProductPage } from '../src/lib/woocommerce/catalog-sync.ts'

const DEFAULT_STORE_API = 'https://goodopalco.com/wp-json/wc/store/v1/products'
const PAGE_SIZE = 100

const sourceImageSchema = z.object({
  id: z.number().int().positive(),
  src: z.url(),
})

const sourceProductSchema = z
  .object({
    id: z.number().int().positive(),
    images: z.array(sourceImageSchema).min(1),
    slug: z.string().min(1),
  })
  .passthrough()

interface FallbackProduct {
  available: boolean
  category: string
  compare_at_price: number | null
  description: string
  id: string
  images: Array<{
    id: string
    filename: string
    source_url: string
  }>
  price: number
  slug: string
  title: string
}

function contentHash(value: Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function imageFilename(sourceUrl: string): string {
  const encoded = new URL(sourceUrl).pathname.split('/').at(-1)
  if (!encoded) throw new Error(`WooCommerce image URL has no filename: ${sourceUrl}`)

  const filename = path.basename(decodeURIComponent(encoded))
  if (!/\.(?:avif|gif|jpe?g|png|webp)$/i.test(filename)) {
    throw new Error(`Unsupported WooCommerce fallback image: ${sourceUrl}`)
  }
  return filename
}

async function fetchSourceProducts(baseUrl: string): Promise<unknown[]> {
  const products: unknown[] = []
  let page = 1
  let totalPages = 1

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(PAGE_SIZE))
    url.searchParams.set('stock_status', 'instock,outofstock,onbackorder')

    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(`WooCommerce fallback request failed (${response.status}) for page ${page}`)
    }

    const body: unknown = await response.json()
    products.push(...z.array(z.unknown()).parse(body))

    const pageHeader = response.headers.get('x-wp-totalpages')
    if (pageHeader) {
      totalPages = Number.parseInt(pageHeader, 10)
      if (!Number.isInteger(totalPages) || totalPages < 1) {
        throw new Error(`WooCommerce returned invalid X-WP-TotalPages: ${pageHeader}`)
      }
    } else if (products.length === page * PAGE_SIZE) {
      totalPages += 1
    }
    page += 1
  } while (page <= totalPages)

  return products
}

async function stageImage(
  sourceUrl: string,
  filename: string,
  stagingDirectory: string
): Promise<boolean> {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) {
    throw new Error(`WooCommerce image request failed (${response.status}): ${sourceUrl}`)
  }
  const contentType = response.headers.get('content-type')?.toLowerCase()
  if (!contentType?.startsWith('image/')) {
    throw new Error(`WooCommerce image response is not an image: ${sourceUrl}`)
  }

  const incoming = Buffer.from(await response.arrayBuffer())
  if (incoming.length === 0) throw new Error(`WooCommerce image response is empty: ${sourceUrl}`)

  const destination = path.join(process.cwd(), 'public', 'images', 'products', filename)
  const existing = await readFile(destination).catch(() => undefined)
  if (existing && contentHash(existing) === contentHash(incoming)) return false

  await writeFile(path.join(stagingDirectory, filename), incoming)
  return true
}

function uniqueOrderedImages(
  images: z.infer<typeof sourceImageSchema>[]
): z.infer<typeof sourceImageSchema>[] {
  const ids = new Set<number>()
  const sourceUrls = new Set<string>()
  return images.filter((image) => {
    if (ids.has(image.id) || sourceUrls.has(image.src)) return false
    ids.add(image.id)
    sourceUrls.add(image.src)
    return true
  })
}

async function main(): Promise<void> {
  const baseUrl = process.env.WOO_STORE_API_URL?.trim() || DEFAULT_STORE_API
  const input = await fetchSourceProducts(baseUrl)
  const sourceProducts = z.array(sourceProductSchema).min(1).parse(input)
  const mappedProducts = parseWooProductPage(input)

  if (sourceProducts.length !== mappedProducts.length) {
    throw new Error('WooCommerce fallback mapping lost source products')
  }
  if (new Set(sourceProducts.map(({ id }) => id)).size !== sourceProducts.length) {
    throw new Error('WooCommerce fallback source returned duplicate product IDs')
  }
  if (new Set(sourceProducts.map(({ slug }) => slug)).size !== sourceProducts.length) {
    throw new Error('WooCommerce fallback source returned duplicate product slugs')
  }

  const products: FallbackProduct[] = []
  const sourceUrlByFilename = new Map<string, string>()
  const stagedFilenames = new Set<string>()
  let refreshedImages = 0
  let galleryImages = 0
  const stagingDirectory = await mkdtemp(path.join(process.cwd(), '.fallback-sync-'))

  try {
    for (const [index, source] of sourceProducts.entries()) {
      const mapped = mappedProducts[index]
      if (!mapped || mapped.wooId !== source.id || mapped.slug !== source.slug) {
        throw new Error(`WooCommerce fallback mapping changed product order at index ${index}`)
      }

      const images = []
      for (const image of uniqueOrderedImages(source.images)) {
        const filename = imageFilename(image.src)
        const previousSourceUrl = sourceUrlByFilename.get(filename)
        if (previousSourceUrl && previousSourceUrl !== image.src) {
          throw new Error(
            `WooCommerce fallback image filename collision: ${filename} belongs to multiple source URLs`
          )
        }
        sourceUrlByFilename.set(filename, image.src)

        if (!stagedFilenames.has(filename)) {
          if (await stageImage(image.src, filename, stagingDirectory)) {
            refreshedImages += 1
            stagedFilenames.add(filename)
          }
        }
        images.push({ id: String(image.id), filename, source_url: image.src })
      }
      galleryImages += images.length

      products.push({
        available: mapped.inStock,
        category: mapped.category,
        compare_at_price: mapped.compareAtPrice,
        description: mapped.description,
        id: String(mapped.wooId),
        images,
        price: mapped.price,
        slug: mapped.slug,
        title: mapped.name,
      })
    }

    const stagedJson = path.join(stagingDirectory, 'wordpress-products.json')
    await writeFile(stagedJson, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
    for (const filename of stagedFilenames) {
      await rename(
        path.join(stagingDirectory, filename),
        path.join(process.cwd(), 'public', 'images', 'products', filename)
      )
    }
    await rename(stagedJson, path.join(process.cwd(), 'data', 'wordpress-products.json'))

    console.info(
      `WooCommerce fallback refreshed: ${products.length} products, ${galleryImages} ordered gallery images, ${refreshedImages} image files changed.`
    )
  } finally {
    await rm(stagingDirectory, { force: true, recursive: true })
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown fallback sync error'
  console.error(`WooCommerce fallback refresh failed: ${message}`)
  process.exitCode = 1
})

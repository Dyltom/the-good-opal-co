import { z } from 'zod'
import { decodeWordPressHtml, type WordPressFeaturedMedia } from './content-import'

const sourceImageSchema = z.object({
  id: z.number().int().positive(),
  src: z.url(),
  alt: z.string(),
  name: z.string(),
})

const sourceProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  is_in_stock: z.boolean(),
  images: z.array(sourceImageSchema),
})

export interface WordPressProductImages {
  inStock: boolean
  productId: number
  productName: string
  media: WordPressFeaturedMedia[]
}

function imageMimeType(sourceUrl: string): string {
  const pathname = new URL(sourceUrl).pathname.toLowerCase()
  if (pathname.endsWith('.png')) return 'image/png'
  if (pathname.endsWith('.webp')) return 'image/webp'
  if (pathname.endsWith('.gif')) return 'image/gif'
  if (pathname.endsWith('.avif')) return 'image/avif'
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg'
  throw new Error(`Unsupported WordPress product image extension: ${sourceUrl}`)
}

export function parseWordPressProductImages(input: unknown): WordPressProductImages[] {
  return z
    .array(sourceProductSchema)
    .parse(input)
    .map((product) => {
      const productName = decodeWordPressHtml(product.name)
      return {
        inStock: product.is_in_stock,
        productId: product.id,
        productName,
        media: product.images.map((image) => ({
          id: image.id,
          alt: image.alt.trim() || productName,
          mimeType: imageMimeType(image.src),
          sourceUrl: image.src,
          title: image.name || productName,
        })),
      }
    })
}

export interface FetchWordPressProductImagesOptions {
  baseUrl?: string
  fetcher?: typeof fetch
}

export async function fetchWordPressProductImages({
  baseUrl = 'https://goodopalco.com/wp-json/wc/store/v1/products',
  fetcher = fetch,
}: FetchWordPressProductImagesOptions = {}): Promise<WordPressProductImages[]> {
  const products: WordPressProductImages[] = []
  let page = 1
  let totalPages: number | null = null

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', '100')
    url.searchParams.set('stock_status', 'instock,outofstock,onbackorder')
    const response = await fetcher(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) throw new Error(`WordPress product request failed (${response.status})`)
    products.push(...parseWordPressProductImages(await response.json()))
    const totalPagesHeader = response.headers.get('x-wp-totalpages')
    if (totalPagesHeader) {
      totalPages = Number.parseInt(totalPagesHeader, 10)
      if (!Number.isInteger(totalPages) || totalPages < 1) {
        throw new Error('WordPress product response has an invalid page count')
      }
    }
    if (totalPages === null) break
    page += 1
  } while (page <= totalPages)

  if (new Set(products.map((product) => product.productId)).size !== products.length) {
    throw new Error('WordPress product gallery snapshot returned duplicate product IDs')
  }
  return products
}

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
  images: z.array(sourceImageSchema),
})

export interface WordPressProductImage {
  productId: number
  productName: string
  media: WordPressFeaturedMedia
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

export function parseWordPressProductImages(input: unknown): WordPressProductImage[] {
  return z.array(sourceProductSchema).parse(input).flatMap((product) => {
    const image = product.images[0]
    if (!image) return []
    const productName = decodeWordPressHtml(product.name)
    return [
      {
        productId: product.id,
        productName,
        media: {
          id: image.id,
          alt: image.alt.trim() || productName,
          mimeType: imageMimeType(image.src),
          sourceUrl: image.src,
          title: image.name || productName,
        },
      },
    ]
  })
}

export async function fetchWordPressProductImages(
  fetcher: typeof fetch = fetch
): Promise<WordPressProductImage[]> {
  const url = new URL('https://goodopalco.com/wp-json/wc/store/v1/products')
  url.searchParams.set('per_page', '100')
  const response = await fetcher(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`WordPress product request failed (${response.status})`)
  return parseWordPressProductImages(await response.json())
}

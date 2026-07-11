import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { extractPlainText } from '@/lib/rich-text'
import { resolveMediaUrl } from '@/lib/media-url'

export const dynamic = 'force-dynamic'

/** Public, presentation-focused catalogue feed. Payload REST remains at /api/products. */
export async function GET() {
  try {
    const payload = await getPayload()
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 200,
      depth: 2,
      sort: '-createdAt',
    })

    return NextResponse.json(
      products.map((product) => {
        const primaryImage = product.images?.[0]?.image
        const imageUrl =
          typeof primaryImage === 'object' && primaryImage
            ? resolveMediaUrl(primaryImage.url)
            : undefined

        return {
          id: String(product.id),
          slug: product.slug,
          name: product.name,
          description: extractPlainText(product.description),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          featured: product.featured,
          category: product.category,
          image: imageUrl,
          stoneType: product.stoneType,
          origin: product.stoneOrigin,
        }
      })
    )
  } catch (error) {
    console.error('Error fetching storefront products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

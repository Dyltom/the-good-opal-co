import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

/**
 * GET /api/products
 * Returns products from Payload CMS for client-side fetching
 */
export async function GET() {
  try {
    const payload = await getPayload()

    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'published' },
      },
      limit: 100,
      depth: 2,
      sort: '-createdAt',
    })

    // Transform products to a simpler format for the frontend
    const transformedProducts = products.map((product) => {
      const primaryImage = product.images?.[0]?.image
      const imageUrl = typeof primaryImage === 'object' && primaryImage ? primaryImage.url : undefined

      return {
        id: String(product.id),
        slug: product.slug,
        name: product.name,
        description: typeof product.description === 'string'
          ? product.description
          : '',
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

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Fetch ALL products - filtering happens client-side
    const products = await payload.find({
      collection: 'products',
      limit: 200,
      sort: '-createdAt',
    })

    // Transform to match our Product interface
    const transformedProducts = products.docs.map((doc: any) => ({
      id: doc.id,
      slug: doc.slug,
      name: doc.name,
      description: doc.description?.[0]?.children?.[0]?.text || '',
      price: doc.price,
      compareAtPrice: doc.compareAtPrice,
      stock: doc.stock,
      featured: doc.featured,
      category: doc.category,
      image: doc.images?.[0]?.image?.url || null,
      origin: doc.stoneOrigin,
      stoneType: doc.stoneType,
      material: doc.material,
      weight: doc.weight,
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

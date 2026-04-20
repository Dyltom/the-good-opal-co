import { getPayload } from '@/lib/payload'
import { formatCurrency } from '@/lib/utils'
import { ProductHero } from './ProductHero'

/**
 * HomeHero Component - Dynamic Product Showcase
 *
 * Server component that fetches products and passes to client ProductHero
 */
export async function HomeHero() {
  // Fetch featured/expensive products from database
  const payload = await getPayload()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
      stock: { greater_than: 0 }
    },
    limit: 10,
    sort: '-price', // Most expensive first
  })

  // Transform products for display
  const featuredProducts = products.map((product) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    price: formatCurrency(product.price, 'AUD'),
    originalPrice: product.compareAtPrice ? formatCurrency(product.compareAtPrice, 'AUD') : null,
    image: product.images?.[0]?.image?.url ?? '/placeholder.jpg',
    badge: product.featured
      ? { text: "FEATURED", type: "featured" as const }
      : product.compareAtPrice && product.compareAtPrice > product.price
        ? { text: `${Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF`, type: "sale" as const }
        : product.stock <= 5
          ? { text: "LIMITED", type: "limited" as const }
          : { text: "NEW", type: "new" as const },
    rating: undefined, // Removed fake rating to comply with ACL
    sold: undefined, // Removed fake sold count to comply with ACL
    description: typeof product.description === 'string'
      ? product.description
      : product.description?.root?.children?.map((node: any) =>
          node.children?.map((child: any) => child.text ?? '').join('')
        ).join(' ') ?? ''
  }))

  return <ProductHero products={featuredProducts} />
}
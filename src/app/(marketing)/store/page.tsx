import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { getPayload } from '@/lib/payload'
import { CollectionJsonLd } from '@/components/seo'
import { PageTransition } from '@/components/layout/PageTransition'
import { TrustSignalBarCompact } from '@/components/trust/TrustSignalBar'
import { PersonalizedHero } from '@/components/store/PersonalizedHero'
import { EnhancedStoreContent } from './EnhancedStoreContent'

/**
 * Store Page Metadata
 */
export const metadata = {
  title: 'Shop Australian Opals | The Good Opal Co',
  description:
    'Discover our collection of authentic Australian opals. Handpicked from Lightning Ridge, Coober Pedy, and Queensland mines. Free shipping on orders over $500.',
}

/**
 * Product type derived from Payload collection
 */
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images?: Array<{
    image?: {
      url?: string
    }
  }>
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  stock: number
  material?: string
  stoneType?: string
  stoneOrigin?: string
  weight?: number
  createdAt: string
  updatedAt: string
}

/**
 * Loading skeleton for products
 */

/**
 * Store Page
 *
 * Server Component that fetches products from Payload and renders the store.
 * Uses direct Payload Local API queries for optimal performance.
 */
export default async function StorePage() {
  // Fetch all published products using Payload Local API
  const payload = await getPayload()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    limit: 200, // Reasonable limit for product catalog
    sort: '-createdAt',
    depth: 2, // Include related media
  })

  // Transform products for client component
  const transformedProducts: Product[] = products.map((product) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description:
      typeof product.description === 'string'
        ? product.description
        : product.description?.root?.children
            ?.map((node: { children?: Array<{ text?: string }> }) =>
              node.children?.map((child: { text?: string }) => child.text ?? '').join('')
            )
            .join(' ') ?? '',
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    images: product.images as Product['images'],
    category: product.category,
    status: product.status as Product['status'],
    featured: product.featured ?? false,
    stock: product.stock ?? 0,
    material: product.material ?? undefined,
    stoneType: product.stoneType ?? undefined,
    stoneOrigin: product.stoneOrigin ?? undefined,
    weight: product.weight ?? undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }))

  // Prepare products for JSON-LD
  const productsForJsonLd = transformedProducts.slice(0, 10).map((product) => ({
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0]?.image?.url,
  }))

  return (
    <>
      <CollectionJsonLd
        name="Australian Opals Collection"
        description="Discover our collection of authentic Australian opals. Handpicked from Lightning Ridge, Coober Pedy, and Queensland mines."
        url="/store"
        products={productsForJsonLd}
      />

      <PageTransition>
        <div className="min-h-screen flex flex-col bg-white">
          <Navigation
            logoText="The Good Opal Co"
            items={[
              { href: '/store', label: 'Shop' },
              { href: '/blog', label: 'Blog' },
              { href: '/faq', label: 'FAQ' },
            ]}
            transparent
          />

          <main className="flex-1">
            {/* Personalized Hero Section - Adapts based on user preferences */}
            <div className="pt-20">
              <PersonalizedHero />
            </div>

            {/* Trust Signals - 2026 Best Practice for Building Confidence */}
            <section className="bg-gray-50 sticky top-20 z-10 shadow-sm">
              <TrustSignalBarCompact />
            </section>

            {/* Products Section with All Enhanced Features */}
            <section className="py-12 bg-white">
              <Container>
                <Suspense fallback={<ProductGridSkeleton count={12} />}>
                  <EnhancedStoreContent products={transformedProducts} />
                </Suspense>
              </Container>
            </section>

          </main>

          <Footer logoText="The Good Opal Co" />
        </div>
      </PageTransition>
    </>  )
}

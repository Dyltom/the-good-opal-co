import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { getPayload } from '@/lib/payload'
import { StoreContentPro } from './store-content-pro'
import { CollectionJsonLd } from '@/components/seo'
import { PageTransition } from '@/components/layout/PageTransition'

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
 * Professional Store Page Design
 * Clean, minimal, focused on products
 */
export default async function StorePagePro() {
  // Fetch all published products using Payload Local API
  const payload = await getPayload()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    limit: 200,
    sort: '-createdAt',
    depth: 2,
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
          />

          <main className="flex-1">
            {/* Clean header with better spacing */}
            <section className="pt-24 pb-12 bg-white border-b border-gray-100">
              <Container>
                <div className="max-w-3xl">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
                    Shop Opals
                  </h1>
                  <p className="text-lg text-content-muted">
                    Handpicked Australian opals from Lightning Ridge, Coober Pedy, and Queensland.
                    Each piece is unique and ethically sourced.
                  </p>
                </div>
              </Container>
            </section>

            {/* Products Section */}
            <section className="py-8 md:py-12">
              <Container>
                <Suspense fallback={<ProductGridSkeleton count={12} />}>
                  <StoreContentPro products={transformedProducts} />
                </Suspense>
              </Container>
            </section>

            {/* Bottom CTA */}
            <section className="py-16 bg-gray-50 border-t border-gray-100">
              <Container>
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-4">
                    Looking for Something Special?
                  </h2>
                  <p className="text-lg text-content-muted mb-8">
                    We offer custom commission services for bespoke opal jewelry.
                    Let us help you create a one-of-a-kind piece.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-opal-electric text-white font-semibold rounded-lg hover:bg-opal-electric-dark transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get In Touch
                  </a>
                </div>
              </Container>
            </section>
          </main>

          <Footer logoText="The Good Opal Co" />
        </div>
      </PageTransition>
    </>
  )
}
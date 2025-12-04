import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { getPayload } from '@/lib/payload'
import { ResponsiveStoreContent } from '@/components/store/ResponsiveStoreContent'
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
            {/* Header - Dark opal-inspired */}
            <section className="relative py-20 md:py-32 bg-black-rich overflow-hidden pt-28">
              {/* Background gradient orbs */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-gold" />
                <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-deep" />
              </div>
              <Container>
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <span className="text-opal-deep text-sm font-semibold uppercase tracking-wider mb-4 block">
                    Premium Collection
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                    Australian <span className="text-gradient-prismatic">Opals</span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/70">
                    Handpicked opals from Lightning Ridge, Coober Pedy, and Queensland.
                    Each piece is unique, ethically sourced, and absolutely breathtaking.
                  </p>
                </div>
              </Container>
            </section>

            {/* Products Section */}
            <section className="py-16 md:py-20 bg-gray-whisper">
              <Container>
                <Suspense fallback={<ProductGridSkeleton count={12} />}>
                  <ResponsiveStoreContent products={transformedProducts} />
                </Suspense>
              </Container>
            </section>

            {/* Bottom CTA */}
            <section className="relative py-20 bg-black-rich overflow-hidden">
              {/* Gradient orbs */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -bottom-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-10 blur-3xl bg-fire-orange" />
                <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-10 blur-3xl bg-opal-teal" />
              </div>
              <Container>
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                    Looking for Something <span className="text-gradient-prismatic">Special?</span>
                  </h2>
                  <p className="text-lg text-white/70 mb-8">
                    We offer custom commission services for bespoke opal jewelry.
                    Let us help you create a one-of-a-kind piece.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-charcoal font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
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
    </>  )
}

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
            {/* Header - Premium opal-inspired design */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-black-rich via-gray-900 to-black-rich overflow-hidden pt-32">
              {/* Enhanced background effects */}
              <div className="absolute inset-0">
                <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-fire-gold to-fire-orange" />
                <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl bg-gradient-to-tr from-opal-electric to-opal-deep" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full opacity-10 blur-3xl bg-gradient-to-r from-opal-turquoise to-opal-emerald" />
              </div>

              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`
                }} />
              </div>

              <Container>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                  <span className="mb-6 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-fire-gold via-opal-electric to-fire-pink">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-fire-gold"></span>
                    Premium Collection
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-fire-pink"></span>
                  </span>
                  <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-white leading-tight">
                    Australian <span className="text-gradient-prismatic">Opals</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                    Handpicked treasures from Lightning Ridge, Coober Pedy, and Queensland.
                    Each piece is unique, ethically sourced, and absolutely breathtaking.
                  </p>

                  {/* Quick stats */}
                  <div className="flex justify-center gap-8 mt-12">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{transformedProducts.length}</p>
                      <p className="text-sm text-white/60 mt-1">Unique Pieces</p>
                    </div>
                    <div className="h-12 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">100%</p>
                      <p className="text-sm text-white/60 mt-1">Australian</p>
                    </div>
                    <div className="h-12 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">Free</p>
                      <p className="text-sm text-white/60 mt-1">Shipping $500+</p>
                    </div>
                  </div>
                </div>
              </Container>
            </section>

            {/* Products Section */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
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

import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { TrustBadges, CTASection } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { getPayload } from '@/lib/payload'
import { StoreContent } from './store-content'
import { CollectionJsonLd } from '@/components/seo'

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
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {[...Array(12)].map((_, i) => (
        <div key={i}>
          <div className="aspect-square bg-warm-grey-light animate-pulse mb-3 rounded-lg" />
          <div className="h-4 bg-warm-grey-light animate-pulse mb-2 rounded" />
          <div className="h-4 bg-warm-grey-light animate-pulse w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

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
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation
        logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
        transparent
      />

      <main className="flex-1">
        {/* Header - Dark opal-inspired */}
        <section className="relative py-16 md:py-20 bg-black-rich overflow-hidden pt-28">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-electric" />
            <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-pink" />
          </div>
          <Container>
            <div className="relative z-10 text-center">
              <span className="text-opal-light text-sm font-semibold uppercase tracking-wider mb-4 block">
                Our Collection
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Australian <span className="text-gradient-prismatic">Opals</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Handpicked treasures from Lightning Ridge, Coober Pedy, and Queensland mines.
                Each piece is one-of-a-kind.
              </p>
            </div>
          </Container>
        </section>

        {/* Products Section - Dark background for opal pop */}
        <section className="py-8 bg-black-rich">
          <Container>
            <div className="bg-black-rich/50 rounded-3xl p-4 md:p-8">
              <Suspense fallback={<ProductsSkeleton />}>
                <StoreContent products={transformedProducts} />
              </Suspense>
            </div>
          </Container>
        </section>
      </main>

      {/* Trust Section */}
      <TrustBadges />

      {/* CTA Section */}
      <CTASection
        title="Looking for Something Unique?"
        description="We offer custom commission services for bespoke opal jewelry"
        buttons={[{ href: '/contact', label: 'Get In Touch' }]}
      />

      <Footer />
    </div>
    </>
  )
}

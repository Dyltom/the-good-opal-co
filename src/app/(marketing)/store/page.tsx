import { Suspense } from 'react'
import { Navigation, Footer } from '@/components/navigation'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { getPayload } from '@/lib/payload'
import { CollectionJsonLd } from '@/components/seo'
import { PageTransition } from '@/components/layout/PageTransition'
import { Container } from '@/components/layout'
import { StoreContent } from './store-content'

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
            logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
            items={[
              { href: '/store', label: 'Shop' },
              { href: '/blog', label: 'Blog' },
              { href: '/courses', label: 'Courses' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/faq', label: 'FAQ' },
            ]}
            transparent
          />

          <main className="flex-1">
            {/* Header - Premium opal-inspired design matching blog and FAQ pages */}
            <section className="relative py-24 lg:py-32 bg-gradient-to-b from-black-rich via-gray-900 to-black-rich overflow-hidden pt-32">
              {/* Enhanced background effects */}
              <div className="absolute inset-0">
                <div className="absolute -top-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl bg-gradient-to-br from-opal-electric to-opal-deep" />
                <div className="absolute -bottom-40 right-1/3 w-[300px] h-[300px] rounded-full opacity-5 blur-3xl bg-gradient-to-tl from-fire-orange to-fire-gold" />
              </div>

              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`
                }} />
              </div>

              <Container>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                  <span className="mb-6 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-opal-turquoise via-fire-gold to-opal-electric">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-opal-turquoise"></span>
                    Our Collection
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-opal-electric"></span>
                  </span>
                  <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-white leading-tight">
                    Australian <span className="text-gradient-prismatic">Opals</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                    Discover our collection of authentic Australian opals, handpicked from Lightning Ridge,
                    Coober Pedy, and Queensland&apos;s boulder opal fields.
                  </p>
                </div>
              </Container>
            </section>

            {/* Products Section */}
            <section id="products" className="bg-white">
              <Suspense fallback={<ProductGridSkeleton count={12} />}>
                <StoreContent products={transformedProducts} />
              </Suspense>
            </section>

          </main>

          <Footer logoText="The Good Opal Co" />
        </div>
      </PageTransition>
    </>  )
}

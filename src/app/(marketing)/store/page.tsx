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

interface StorePageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams
  const searchQuery = params.search

  // Fetch all published products using Payload Local API
  const payload = await getPayload()

  const whereCondition = searchQuery
    ? {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { name: { contains: searchQuery } },
              { category: { contains: searchQuery } },
              { material: { contains: searchQuery } },
              { stoneType: { contains: searchQuery } },
              { stoneOrigin: { contains: searchQuery } },
              { sku: { contains: searchQuery } },
            ]
          }
        ]
      }
    : { status: { equals: 'published' } }

  const { docs: products } = await payload.find({
    collection: 'products',
    where: whereCondition as any,
    limit: 200, // Reasonable limit for product catalog
    sort: searchQuery ? '-featured,-createdAt' : '-createdAt',
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
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 bg-gradient-to-br from-slate-50 via-white to-opal-electric/5 overflow-hidden">
              {/* Magical sparkle effects */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-1/4 w-4 h-4 bg-opal-electric/30 rounded-full animate-pulse" />
                <div className="absolute top-32 right-1/3 w-2 h-2 bg-fire-pink/40 rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-24 left-1/2 w-3 h-3 bg-opal-turquoise/30 rounded-full animate-pulse delay-700" />
              </div>

              <Container>
                <div className="text-center max-w-5xl mx-auto">
                  <span className="font-accent text-lg text-opal-electric mb-4 block">
                    ⭐ Handcrafted Treasures ⭐
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-charcoal leading-tight">
                    {searchQuery ? (
                      <>Results for <span className="font-accent text-opal-electric">&ldquo;{searchQuery}&rdquo;</span></>
                    ) : (
                      <>Australian <span className="font-accent text-opal-electric">Opals</span></>
                    )}
                  </h1>
                  <p className="text-base md:text-lg text-charcoal/70 leading-relaxed max-w-3xl mx-auto mb-4">
                    {searchQuery ? (
                      <>Found {transformedProducts.length} opal{transformedProducts.length !== 1 ? 's' : ''} matching your search.</>
                    ) : (
                      <>Each opal in our collection tells a story millions of years in the making.
                      Discover these magical gemstones, lovingly handpicked from Australia&apos;s most treasured mines.</>
                    )}
                  </p>
                  <p className="font-accent text-lg text-opal-electric/80">
                    ~ Where magic meets craftsmanship ~
                  </p>
                </div>
              </Container>
            </section>

            {/* Products Section */}
            <section id="products" className="bg-white">
              <Suspense fallback={<ProductGridSkeleton count={12} />}>
                <StoreContent products={transformedProducts} searchQuery={searchQuery} />
              </Suspense>
            </section>

          </main>

          <Footer />
        </div>
      </PageTransition>
    </>  )
}

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
    where: whereCondition as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
            <section className="pt-32 pb-12 bg-white">
              <Container>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-opal-electric-accessible mb-4">
                    The Collection
                  </p>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal leading-[1.1] tracking-tight mb-5">
                    {searchQuery ? (
                      <>Results for &ldquo;{searchQuery}&rdquo;</>
                    ) : (
                      <>Australian Opals</>
                    )}
                  </h1>
                  <p className="text-base md:text-lg text-charcoal/70 leading-relaxed">
                    {searchQuery ? (
                      <>Found {transformedProducts.length} opal{transformedProducts.length !== 1 ? 's' : ''} matching your search.</>
                    ) : (
                      <>Each stone in the collection is handpicked from Lightning Ridge, Coober Pedy and Queensland, cut and set in our Australian studio.</>
                    )}
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

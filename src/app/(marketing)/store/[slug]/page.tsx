import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Product } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { RelatedProductsWithSuspense } from '@/components/product/RelatedProducts'
import { formatCurrency } from '@/lib/utils'
import { getFreeShippingProgress } from '@/lib/constants/shipping'
import { getPayload } from '@/lib/payload'
import {
  AuthenticityChecklist,
  SocialProof,
  PaymentBadgesCompact,
} from '@/components/trust'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate metadata for product pages
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const product = docs[0]
  if (!product) {
    return {
      title: 'Product Not Found | The Good Opal Co',
    }
  }

  const imageUrl = product.images?.[0]?.image?.url

  return {
    title: `${product.name} | The Good Opal Co`,
    description:
      typeof product.description === 'string'
        ? product.description.slice(0, 160)
        : 'Discover this unique Australian opal from The Good Opal Co.',
    openGraph: {
      title: product.name,
      description:
        typeof product.description === 'string'
          ? product.description.slice(0, 160)
          : 'Authentic Australian opal',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  }
}

/**
 * Generate static params for all published products
 */
export async function generateStaticParams() {
  const payload = await getPayload()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 500,
    select: { slug: true },
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}

/**
 * Helper to extract plain text from rich text field
 */
function extractPlainText(description: unknown): string {
  if (typeof description === 'string') return description
  if (!description || typeof description !== 'object') return ''

  const richText = description as {
    root?: {
      children?: Array<{
        children?: Array<{ text?: string }>
      }>
    }
  }

  return (
    richText.root?.children
      ?.map((node) => node.children?.map((child) => child.text ?? '').join(''))
      .join(' ') ?? ''
  )
}

/**
 * Product Detail Page
 *
 * Server Component that fetches product data directly from Payload.
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2, // Include related media
  })

  const product = docs[0] as Product | undefined
  if (!product) {
    notFound()
  }

  // Extract image URL
  const primaryImage = product.images?.[0]?.image
  const imageUrl = typeof primaryImage === 'object' && primaryImage ? primaryImage.url : undefined

  // Get description as plain text
  const descriptionText = extractPlainText(product.description)

  // Social proof removed to comply with Australian Consumer Law
  // Real analytics would be implemented here in production
  const viewCount = undefined // Removed fake metrics
  const lastSoldDaysAgo = undefined // Removed fake metrics

  // Format category name
  const categoryName = product.category
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
  const productShippingProgress = getFreeShippingProgress(product.price)

  // Collect all product images with alt text
  const productImages = product.images
    ?.map((img: { image?: { url?: string; alt?: string } | string | null }, index: number) => {
      const imgObj = typeof img.image === 'object' && img.image ? img.image : null
      if (!imgObj?.url) return null
      return {
        url: imgObj.url,
        alt: imgObj.alt || `${product.name} view ${index + 1}`
      }
    })
    .filter((img): img is { url: string; alt: string } => Boolean(img)) ?? []

  return (
    <>
      {/* Structured Data */}
      <ProductJsonLd
        product={{
          name: product.name,
          slug: product.slug,
          description: descriptionText,
          price: product.price,
          images: productImages.map(img => img.url),
          category: categoryName,
          stock: product.stock,
          sku: String(product.id),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Store', url: '/store' },
          { name: product.name, url: `/store/${product.slug}` },
        ]}
      />

    <ProductViewTracker product={product}>
      <div className="min-h-screen flex flex-col">
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
        />
        <main className="flex-1">
        {/* Premium Background */}
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 -z-10" />

        </div>

        {/* Breadcrumb */}
        <section className="pt-24 pb-4">
          <Container>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-opal-electric-accessible transition-colors">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/store" className="text-gray-500 hover:text-opal-electric-accessible transition-colors">
                Store
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-charcoal font-medium">{product.name}</span>
            </nav>
          </Container>
        </section>

        {/* Product Detail */}
        <section className="pb-20">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image Gallery */}
              <div className="space-y-4">
                <ProductImageGallery
                  productName={product.name}
                  images={productImages}
                  featured={product.featured}
                  stock={product.stock}
                />

                {/* Social Proof */}
                <div className="flex items-center justify-center">
                  <SocialProof viewCount={viewCount} lastSoldDaysAgo={lastSoldDaysAgo} />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <span className="mb-4 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-normal text-opal-electric-accessible">
                    <span className="h-px w-12 bg-opal-electric-accessible/35"></span>
                    {categoryName}
                  </span>
                  <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-charcoal md:text-5xl lg:text-6xl">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="flex items-start gap-4 pb-8 border-b border-gray-200">
                  <div>
                    <span className="font-serif text-4xl font-semibold leading-none text-charcoal md:text-5xl">
                      {formatCurrency(product.price, 'AUD')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg text-gray-400 line-through">
                          {formatCurrency(product.compareAtPrice, 'AUD')}
                        </span>
                        <span className="rounded-full bg-opal-emerald-dark px-3 py-1 text-sm font-semibold text-white">
                          Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="text-charcoal/80 leading-relaxed">
                  <p className="text-lg">{descriptionText}</p>
                </div>

                {/* Authenticity Checklist */}
                <div className="py-6 border-y border-warm-grey">
                  <AuthenticityChecklist />
                </div>

                {/* Product Actions */}
                <ProductActions
                  product={{
                    id: String(product.id),
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    image: imageUrl,
                  }}
                />

                {/* Purchase Confidence */}
                <div className="rounded-2xl border border-opal-electric-accessible/15 bg-opal-electric-accessible/5 p-5">
                  <h2 className="mb-4 font-serif text-2xl font-semibold text-charcoal">
                    Purchase confidence
                  </h2>
                  <div className="grid gap-3 text-sm text-charcoal/75 sm:grid-cols-2">
                    <div>
                      <p className="font-sans font-semibold text-charcoal">Shipping</p>
                      <p className="mt-1">
                        {productShippingProgress.qualifies
                          ? 'This piece qualifies for free express shipping.'
                          : `${formatCurrency(productShippingProgress.remaining, 'AUD')} away from free express shipping.`}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-charcoal">Care</p>
                      <p className="mt-1">Insured delivery, elegant packaging, and clear care guidance included.</p>
                    </div>
                  </div>
                </div>

                {/* Payment Security */}
                <div className="pt-6 border-t border-warm-grey">
                  <PaymentBadgesCompact />
                </div>

                {/* Shipping Info */}
                <div className="rounded-xl border border-warm-grey/30 bg-white p-5">
                  <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-opal-electric-accessible" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span className="font-medium">Free shipping over $500</span>
                    </div>
                    <div className="hidden h-4 w-px bg-gray-200 sm:block" />
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-opal-electric-accessible" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span className="font-medium">30-day returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            {(product.stoneOrigin || product.stoneType || product.material || product.weight) && (
              <div className="mt-20 border-t border-warm-grey/40 pt-12">
                <h2 className="mb-8 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
                  Gemstone <span className="text-opal-electric">Specifications</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                  {product.stoneType && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Stone Type</span>
                      <span className="font-semibold text-charcoal">
                        {product.stoneType.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.stoneOrigin && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Origin</span>
                      <span className="font-semibold text-charcoal">
                        {product.stoneOrigin.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Metal</span>
                      <span className="font-semibold text-charcoal">
                        {product.material.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Weight</span>
                      <span className="font-semibold text-charcoal">{product.weight} carats</span>
                    </div>
                  )}
                  {product.ringSize && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Ring Size</span>
                      <span className="font-semibold text-charcoal">{product.ringSize}</span>
                    </div>
                  )}
                  {product.certified && (
                    <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-charcoal/60">Certificate</span>
                      <span className="font-semibold text-charcoal">
                        {product.certificateNumber ?? 'Included'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Products */}
            <div className="mt-24">
              <RelatedProductsWithSuspense
                product={product}
                className="border-t border-gray-200 pt-16"
              />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
    </ProductViewTracker>
    </>
  )
}

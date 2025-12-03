import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductActions } from '@/components/product/ProductActions'
import { formatCurrency } from '@/lib/utils'
import { getPayload } from '@/lib/payload'
import {
  StockBadge,
  NewBadge,
  AuthenticityChecklist,
  SocialProof,
  PaymentBadgesCompact,
} from '@/components/trust'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo'

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

  const product = docs[0]
  if (!product) {
    notFound()
  }

  // Extract image URL
  const primaryImage = product.images?.[0]?.image
  const imageUrl = typeof primaryImage === 'object' && primaryImage ? primaryImage.url : undefined

  // Get description as plain text
  const descriptionText = extractPlainText(product.description)

  // Simulated social proof (would come from analytics in production)
  const viewCount = Math.floor(Math.random() * 20) + 5
  const lastSoldDaysAgo = product.stock < 5 ? Math.floor(Math.random() * 3) : undefined

  // Format category name
  const categoryName = product.category
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())

  // Collect all product images
  const productImages = product.images
    ?.map((img: { image?: { url?: string } | string | null }) => {
      const imgObj = typeof img.image === 'object' && img.image ? img.image : null
      return imgObj?.url
    })
    .filter((url: string | undefined): url is string => Boolean(url)) ?? []

  return (
    <>
      {/* Structured Data */}
      <ProductJsonLd
        product={{
          name: product.name,
          slug: product.slug,
          description: descriptionText,
          price: product.price,
          images: productImages,
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

    <div className="min-h-screen flex flex-col">
      <Navigation
        logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
      />
      <main className="flex-1">
        {/* Breadcrumb */}
        <Section padding="sm">
          <Container>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/store" className="hover:text-primary transition-colors">
                Store
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </Container>
        </Section>

        {/* Product Detail */}
        <Section padding="lg">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-warm-grey-light">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-opal-blue/20 to-opal-purple/20">
                      <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-70">
                        💎
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-2">
                      {product.featured && <NewBadge />}
                    </div>
                    {product.stock <= 10 && product.stock > 0 && (
                      <StockBadge stock={product.stock} />
                    )}
                  </div>
                </div>

                {/* Image Gallery Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img: { image?: { url?: string } | string | null }, index: number) => {
                      const thumbUrl =
                        typeof img.image === 'object' && img.image ? img.image.url : undefined
                      if (!thumbUrl) return null
                      return (
                        <div
                          key={index}
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-opal-blue transition-colors cursor-pointer"
                        >
                          <Image
                            src={thumbUrl}
                            alt={`${product.name} view ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Social Proof */}
                <div className="flex items-center justify-center">
                  <SocialProof viewCount={viewCount} lastSoldDaysAgo={lastSoldDaysAgo} />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <p className="text-sm text-opal-blue font-semibold uppercase tracking-wide mb-2">
                    {categoryName}
                  </p>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-4 pb-6 border-b border-warm-grey">
                  <span className="text-4xl font-bold text-opal-blue">
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <>
                      <span className="text-xl text-charcoal-60 line-through">
                        {formatCurrency(product.compareAtPrice, 'AUD')}
                      </span>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-error text-white text-sm font-bold">
                        SAVE{' '}
                        {Math.round(
                          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                        )}
                        %
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="text-charcoal-80 leading-relaxed">
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

                {/* Payment Security */}
                <div className="pt-6 border-t border-warm-grey">
                  <PaymentBadgesCompact />
                </div>

                {/* Shipping Info */}
                <div className="p-4 bg-opal-blue-pale rounded-lg">
                  <p className="text-sm text-charcoal-80">
                    <span className="font-semibold">Free shipping</span> on orders over $500 AUD •
                    <span className="font-semibold"> 30-day returns</span> •
                    <span className="font-semibold"> Arrives in 3-7 business days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            {(product.stoneOrigin || product.stoneType || product.material || product.weight) && (
              <div className="mt-16 border-t border-warm-grey pt-12">
                <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">Specifications</h2>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                  {product.stoneType && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Stone Type</span>
                      <span className="font-semibold text-charcoal">
                        {product.stoneType.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.stoneOrigin && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Origin</span>
                      <span className="font-semibold text-charcoal">
                        {product.stoneOrigin.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Metal</span>
                      <span className="font-semibold text-charcoal">
                        {product.material.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Weight</span>
                      <span className="font-semibold text-charcoal">{product.weight} carats</span>
                    </div>
                  )}
                  {product.ringSize && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Ring Size</span>
                      <span className="font-semibold text-charcoal">{product.ringSize}</span>
                    </div>
                  )}
                  {product.certified && (
                    <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                      <span className="text-charcoal-60">Certificate</span>
                      <span className="font-semibold text-charcoal">
                        {product.certificateNumber ?? 'Included'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
    </>
  )
}

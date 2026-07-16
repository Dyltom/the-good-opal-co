import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Product } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { Footer, SiteNavigation } from '@/components/navigation'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { RelatedProductsWithSuspense } from '@/components/product/RelatedProducts'
import { formatCurrency } from '@/lib/utils'
import { getFreeShippingProgress } from '@/lib/constants/shipping'
import { getPayload } from '@/lib/payload'
import { PaymentBadgesCompact } from '@/components/trust'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import { extractPlainText } from '@/lib/rich-text'
import { mergeProductGallery } from '@/lib/product-gallery'
import { isBuilderEligibleOpal } from '@/lib/custom-builder/opal-visual'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

/**
 * Generate metadata for product pages
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })

  const product = docs[0]
  if (!product) {
    notFound()
  }

  const primaryImage = product.images?.[0]?.image
  const imageUrl =
    (primaryImage && typeof primaryImage === 'object' ? resolveMediaUrl(primaryImage.url) : undefined) ??
    ownedProductImageUrl(product.slug)
  const description = extractPlainText(product.description).slice(0, 160)

  return {
    title: `${product.name} | The Good Opal Co`,
    description: description || 'Discover this unique Australian opal from The Good Opal Co.',
    alternates: { canonical: `/store/${product.slug}` },
    openGraph: {
      title: product.name,
      description: description || 'Australian opal selected by The Good Opal Co.',
      url: `/store/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description || 'Australian opal selected by The Good Opal Co.',
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
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
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2, // Include related media
  })

  const product = docs[0] as Product | undefined
  if (!product) {
    notFound()
  }

  // Extract image URL
  const primaryImage = product.images?.[0]?.image
  const imageUrl =
    (typeof primaryImage === 'object' && primaryImage
      ? resolveMediaUrl(primaryImage.url)
      : undefined) ?? ownedProductImageUrl(product.slug)

  // Get description as plain text
  const descriptionText = extractPlainText(product.description)

  // Format category name
  const categoryName = product.category
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
  const productShippingProgress = getFreeShippingProgress(product.price)
  const builderEligible = isBuilderEligibleOpal(product.slug, product.name, product)
  const weightUnit =
    product.weightUnit ?? (product.category === 'raw-opals' ? ('carats' as const) : undefined)

  // Collect all product images with alt text
  const cmsImages =
    product.images
      ?.map((img, index: number) => {
        const imgObj = typeof img.image === 'object' && img.image ? img.image : null
        if (!imgObj?.url) return null
        return {
          url: resolveMediaUrl(imgObj.url) ?? '',
          alt: imgObj.alt || `${product.name} view ${index + 1}`,
        }
      })
      .filter((img): img is { url: string; alt: string } => Boolean(img)) ?? []
  const ownedImage = ownedProductImageUrl(product.slug)
  const productImages = mergeProductGallery(
    product.slug,
    product.name,
    cmsImages.length === 0 && ownedImage
      ? [{ url: ownedImage, alt: product.name }]
      : cmsImages
  )

  return (
    <>
      {/* Structured Data */}
      <ProductJsonLd
        product={{
          name: product.name,
          slug: product.slug,
          description: descriptionText,
          price: product.price,
          images: productImages.map((img) => img.url),
          category: categoryName,
          stock: product.stock ?? 0,
          sku: product.sku ?? String(product.id),
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
        <div className="flex min-h-screen flex-col bg-cream">
          <SiteNavigation />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {/* Breadcrumb */}
            <section className="pb-5 pt-28">
              <Container>
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-2 overflow-hidden font-sans text-xs text-charcoal/55 sm:text-sm"
                >
                  <Link href="/" className="transition-colors hover:text-charcoal">
                    Home
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link href="/store" className="transition-colors hover:text-charcoal">
                    Store
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page" className="truncate font-medium text-charcoal">
                    {product.name}
                  </span>
                </nav>
              </Container>
            </section>

            {/* Product Detail */}
            <section className="pb-20 lg:pb-28">
              <Container>
                <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
                  {/* Product Image Gallery */}
                  <div>
                    <ProductImageGallery
                      productName={product.name}
                      images={productImages}
                      featured={product.featured ?? false}
                      stock={product.stock ?? 0}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-7 lg:sticky lg:top-28 lg:self-start">
                    {/* Title */}
                    <div>
                      <span className="mb-4 inline-flex items-center font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                        {categoryName}
                      </span>
                      <h1 className="max-w-[14ch] font-serif text-4xl font-medium leading-[1.02] text-charcoal md:text-5xl lg:text-6xl">
                        {product.name}
                      </h1>
                    </div>

                    {/* Price */}
                    <div className="flex items-start gap-4 border-b border-warm-grey/60 pb-7">
                      <div>
                        <span className="font-serif text-4xl font-semibold leading-none text-charcoal tabular-nums md:text-5xl">
                          {formatCurrency(product.price, 'AUD')}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-lg tabular-nums text-charcoal/45 line-through">
                              {formatCurrency(product.compareAtPrice, 'AUD')}
                            </span>
                            <span className="rounded-full bg-opal-emerald-dark px-3 py-1 text-sm font-semibold text-white">
                              Save{' '}
                              {Math.round(
                                ((product.compareAtPrice - product.price) /
                                  product.compareAtPrice) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="leading-relaxed text-charcoal/75">
                      <p className="font-sans text-base leading-8 sm:text-lg">
                        {descriptionText ||
                          'Contact us for more detail about this piece, including its colour, origin, and condition.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 border-y border-warm-grey/60 font-sans text-sm text-charcoal/70">
                      <div className="border-r border-warm-grey/60 px-4 py-4">Australian opal</div>
                      <div className="px-4 py-4">Origin disclosed where known</div>
                      <div className="border-r border-t border-warm-grey/60 px-4 py-4">
                        Tracked delivery
                      </div>
                      <div className="border-t border-warm-grey/60 px-4 py-4">
                        Care questions answered
                      </div>
                    </div>

                    {builderEligible && (product.stock ?? 0) > 0 && (
                      <div className="border-y border-opal-electric-accessible/25 bg-opal-light/15 p-5">
                        <p className="font-serif text-xl font-medium text-charcoal">
                          Build a ring around this opal
                        </p>
                        <p className="mt-2 font-sans text-sm leading-6 text-charcoal/70">
                          Open this exact available stone in the 3D studio and compare compatible
                          settings before requesting a quote.
                        </p>
                        <Link
                          href={`/services/design?p=${encodeURIComponent(String(product.id))}`}
                          className="mt-3 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-charcoal underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                        >
                          Design with this opal
                        </Link>
                      </div>
                    )}

                    {/* Product Actions */}
                    <ProductActions
                      product={{
                        id: String(product.id),
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        stock: product.stock ?? 0,
                        image: imageUrl ?? undefined,
                      }}
                    />

                    {/* Purchase Confidence */}
                    <div className="border border-warm-grey/60 bg-white p-5">
                      <h2 className="mb-4 font-serif text-2xl font-medium text-charcoal">
                        Delivery and decisions
                      </h2>
                      <div className="grid gap-3 text-sm text-charcoal/75 sm:grid-cols-2">
                        <div>
                          <p className="font-sans font-semibold text-charcoal">Shipping</p>
                          <p className="mt-1">
                            {productShippingProgress.qualifies
                              ? 'This piece qualifies for free shipping.'
                              : 'Shipping is calculated at checkout. Orders over $500 ship free.'}
                          </p>
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-charcoal">Returns</p>
                          <p className="mt-1">
                            Change of mind is covered.{' '}
                            <Link
                              href="/returns"
                              className="underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                            >
                              See what&apos;s included before you buy.
                            </Link>
                          </p>
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-charcoal">
                            Need a closer look?
                          </p>
                          <p className="mt-1">
                            <Link
                              href={`/contact?subject=virtual-viewing&product=${encodeURIComponent(product.name)}`}
                              className="underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                            >
                              Ask a question or book a viewing.
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Security */}
                    <div className="border-t border-warm-grey pt-6">
                      <PaymentBadgesCompact />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-warm-grey/60 pt-5 font-sans text-sm text-charcoal/65">
                      <Link
                        href="/shipping"
                        className="underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                      >
                        Shipping details
                      </Link>
                      <Link
                        href="/returns"
                        className="underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                      >
                        Returns policy
                      </Link>
                      <Link
                        href="/contact"
                        className="underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                      >
                        Contact us
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Product Specifications */}
                {(product.stoneOrigin ||
                  product.stoneType ||
                  product.material ||
                  product.weight) && (
                  <div className="mt-20 border-t border-warm-grey/40 pt-12">
                    <h2 className="mb-8 font-serif text-3xl font-medium text-charcoal md:text-4xl">
                      Piece details
                    </h2>
                    <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
                      {product.stoneType && (
                        <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-charcoal/60">Stone Type</span>
                          <span className="font-semibold text-charcoal">
                            {product.stoneType
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {product.stoneOrigin && (
                        <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-charcoal/60">Origin</span>
                          <span className="font-semibold text-charcoal">
                            {product.stoneOrigin
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {product.material && (
                        <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-charcoal/60">Metal</span>
                          <span className="font-semibold text-charcoal">
                            {product.material
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {product.weight && weightUnit && (
                        <div className="flex flex-col gap-1 border-b border-warm-grey-light py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-charcoal/60">Weight</span>
                          <span className="font-semibold text-charcoal">
                            {product.weight} {weightUnit}
                          </span>
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
                    className="border-t border-warm-grey/40 pt-16"
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

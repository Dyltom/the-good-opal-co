import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ringStyles } from '@/components/custom-builder/config'
import { ArrowRight, Camera, ChevronDown, MessageCircle, RotateCcw, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import type { Product } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { RelatedProductsWithSuspense } from '@/components/product/RelatedProducts'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { formatCurrency, savePercent } from '@/lib/utils'
import { getFreeShippingProgress, SHIPPING_CONFIG } from '@/lib/constants/shipping'
import { getPayload } from '@/lib/payload'
import { PaymentMethods } from '@/components/trust'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import { parseProductDescription } from '@/lib/product-description'
import { parseStoreQuery, storeLabel, storeUrl } from '@/app/(marketing)/store/store-query'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { productImageTransitionName } from '@/lib/view-transitions'
import { mergeProductGallery } from '@/lib/product-gallery'
import { isBuilderEligibleOpal } from '@/lib/custom-builder/opal-visual'
import { Eyebrow } from '@/components/ui/eyebrow'
import { summarize } from '@/lib/catalog'
import { reservedProductIds } from '@/lib/inventory-reservations'

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
  const description = summarize(parseProductDescription(product.description).paragraphs.join(' '))

  return {
    title: `${product.name} | The Good Opal Co`,
    description: description || 'Discover this unique Australian opal from The Good Opal Co.',
    alternates: { canonical: `/store/${product.slug}` },
    openGraph: {
      title: product.name,
      description: description || 'Australian opal selected by The Good Opal Co.',
      url: `/store/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
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

  const about = parseProductDescription(product.description)
  const descriptionText = about.paragraphs.join(' ')

  // Format category name
  const categoryName = product.category ? storeLabel(product.category) : undefined
  const productShippingProgress = getFreeShippingProgress(product.price)
  const facts = [
    { label: 'Stone', value: product.stoneType && storeLabel(product.stoneType) },
    { label: 'Origin', value: product.stoneOrigin && storeLabel(product.stoneOrigin) },
    { label: 'Weight', value: product.weight && weightUnitLabel(product.weight, product.weightUnit ?? (product.category === 'raw-opals' ? 'carats' : undefined)) },
    { label: 'Dimensions', value: dimensionsLabel(product.dimensions) },
    { label: 'Ring size', value: product.ringSize },
    { label: 'Metal', value: product.material && product.material !== 'none' ? storeLabel(product.material) : undefined },
    { label: 'Inclusions', value: about.inclusions && about.inclusions.charAt(0).toUpperCase() + about.inclusions.slice(1) },
    { label: 'Certificate', value: product.certified ? (product.certificateNumber ?? 'Included') : undefined },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))
  const stock = product.stock ?? 0
  const reserved = stock <= 0 && (await reservedProductIds()).has(String(product.id))
  const sold = stock <= 0 && !reserved
  const discount = savePercent(product.price, product.compareAtPrice)
  const similarHref = sold ? await similarPiecesHref(product) : undefined
  const builderEligible = isBuilderEligibleOpal(product.slug, product.name, product)
  const designStyle = ringStyles.find((style) =>
    product.name.toLowerCase().includes(`${style.label.replace('&', 'and').toLowerCase()} ring`)
  )

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
  const productVideos =
    product.videos?.flatMap((clip) => {
      const video = typeof clip.video === 'object' ? clip.video : null
      const url = resolveMediaUrl(video?.url)
      if (!url || !video?.mimeType?.startsWith('video/')) return []
      const poster = typeof clip.poster === 'object' ? resolveMediaUrl(clip.poster?.url) : undefined
      return [{ url, mimeType: video.mimeType, poster }]
    }) ?? []
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
          properties: facts.map((fact) => ({ name: fact.label, value: fact.value })),
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
        <MarketingShell>
            {/* Breadcrumb */}
            <section className="pb-4 pt-4">
              <Container>
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-2 overflow-hidden font-sans text-xs text-ink-2 sm:text-sm"
                >
                  <Link href="/" className="transition-colors hover:text-ink">
                    Home
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link href="/store" className="transition-colors hover:text-ink">
                    Store
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page" className="truncate font-medium text-ink">
                    {product.name}
                  </span>
                </nav>
              </Container>
            </section>

            <section className="pb-20 lg:pb-28">
              <Container>
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
                  <div className="min-w-0 space-y-12">
                    <div data-insight-section="photos">
                      <ProductImageGallery
                        productName={product.name}
                        images={productImages}
                        videos={productVideos}
                        transitionName={productImageTransitionName(product.slug)}
                      />
                    </div>

                    {about.paragraphs.length > 0 ? (
                      <section aria-labelledby="about-stone" data-insight-section="details" className="hidden max-w-prose lg:block">
                        <h2 id="about-stone" className="font-serif text-2xl font-medium text-ink">
                          About this stone
                        </h2>
                        <div className="mt-4 space-y-4 font-sans text-base leading-7 text-ink">
                          {about.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>

                  <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                    <Eyebrow>
                      {[categoryName, product.stoneOrigin && storeLabel(product.stoneOrigin)].filter(Boolean).join(' · ')}
                    </Eyebrow>
                    <h1 className="mt-3 font-serif text-3xl font-medium leading-[1.08] text-ink sm:text-4xl xl:text-[2.75rem]">
                      {product.name}
                    </h1>

                    {reserved ? (
                      <div data-insight-section="price" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="rounded-full bg-ink px-3 py-1 font-sans text-sm font-medium text-bg">
                          Reserved
                        </span>
                        <span className="font-sans text-sm text-ink-2">
                          Someone is checking out with this piece. If they don&apos;t complete payment, it returns to the shop within 30 minutes.
                        </span>
                      </div>
                    ) : sold ? (
                      <div data-insight-section="price" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="rounded-full bg-ink px-3 py-1 font-sans text-sm font-medium text-bg">
                          Sold
                        </span>
                        <span className="font-sans text-sm text-ink-2">This piece has found a home.</span>
                      </div>
                    ) : (
                      <div data-insight-section="price" className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-serif text-3xl font-semibold text-ink">
                          {formatCurrency(product.price, 'AUD')}
                        </span>
                        {discount && product.compareAtPrice ? (
                          <>
                            <span className="text-base text-ink-3 line-through">
                              {formatCurrency(product.compareAtPrice, 'AUD')}
                            </span>
                            <span className="text-sm font-medium text-accent">Save {discount}%</span>
                          </>
                        ) : null}
                        <span className="text-sm text-ink-2">AUD</span>
                      </div>
                    )}
                    {stock === 1 ? (
                      <p className="mt-2 font-sans text-sm text-success">
                        One available. This exact stone is the one you receive.
                      </p>
                    ) : null}

                    {facts.length > 0 ? (
                      <dl data-insight-section="details" className="mt-6 divide-y divide-rule border-y border-rule font-sans text-sm">
                        {facts.map((fact) => (
                          <div key={fact.label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-2.5">
                            <dt className="text-ink-2">{fact.label}</dt>
                            <dd className="font-medium text-ink">{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {similarHref ? (
                      <div className="mt-6">
                        <Link
                          href={similarHref}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-ink font-sans text-base font-semibold text-white shadow-md transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                          See similar pieces
                          <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                        <Link
                          href="/contact?subject=opal-finder"
                          className="mt-2 flex min-h-11 items-center justify-center font-sans text-sm text-ink underline underline-offset-4 hover:text-ink"
                        >
                          Ask us to find one like it
                        </Link>
                      </div>
                    ) : reserved ? null : (
                      <>
                        <div className="mt-6">
                          <ProductActions
                            product={{
                              id: String(product.id),
                              slug: product.slug,
                              name: product.name,
                              price: product.price,
                              stock,
                              image: imageUrl ?? undefined,
                            }}
                          />
                        </div>

                        <PaymentMethods className="mt-4" />
                      </>
                    )}

                    {sold && !about.photographedUnderWhiteLight ? null : (
                      <ul className="mt-6 space-y-3 border-t border-rule pt-6 font-sans text-sm text-ink">
                        {about.photographedUnderWhiteLight ? (
                          <li className="flex gap-3">
                            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                            Photographed under white light. Studio shots have the background replaced; the stone is never retouched.
                          </li>
                        ) : null}
                        {sold ? null : (
                          <>
                            <li className="flex gap-3">
                              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                              <span>
                                {productShippingProgress.qualifies
                                  ? 'Free tracked shipping.'
                                  : `Tracked shipping, $${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD in Australia. Free on orders of $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more.`}{' '}
                                <Link href="/shipping" className="underline underline-offset-4 hover:text-ink">
                                  Rates
                                </Link>
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                              <span>
                                30-day change-of-mind returns on eligible unused pieces.{' '}
                                <Link href="/returns" className="underline underline-offset-4 hover:text-ink">
                                  Returns policy
                                </Link>
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
                              <Link
                                href={`/contact?subject=virtual-viewing&product=${encodeURIComponent(product.name)}`}
                                className="underline underline-offset-4 hover:text-ink"
                              >
                                Ask a question or book a video viewing
                              </Link>
                            </li>
                          </>
                        )}
                      </ul>
                    )}

                    {builderEligible && stock > 0 ? (
                      <Link
                        href={`/services/design?p=${encodeURIComponent(String(product.id))}`}
                        className="group mt-6 flex items-center justify-between gap-4 border border-rule bg-bg p-4 transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span>
                          <span className="block font-serif text-lg text-ink">Design a ring around this opal</span>
                          <span className="mt-1 block font-sans text-sm text-ink-2">
                            Try this exact stone in settings in the 3D studio, then request a quote.
                          </span>
                        </span>
                        <ArrowRight className="h-5 w-5 shrink-0 text-ink-2 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                      </Link>
                    ) : null}

                    {designStyle ? (
                      <Link
                        href={`/services/design?y=${designStyle.id}`}
                        className="group mt-3 flex items-center justify-between gap-4 border border-rule bg-bg p-4 transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span>
                          <span className="block font-serif text-lg text-ink">
                            Want the {designStyle.label} with a different opal?
                          </span>
                          <span className="mt-1 block font-sans text-sm text-ink-2">
                            Choose a stone, metal and size in the 3D studio, then request a quote.
                          </span>
                        </span>
                        <ArrowRight className="h-5 w-5 shrink-0 text-ink-2 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                {about.paragraphs.length > 0 ? (
                  <details data-insight-section="details" className="group mt-8 max-w-prose border-y border-rule lg:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-xl font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
                      About this stone
                      <ChevronDown className="h-5 w-5 shrink-0 text-ink-2 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                    </summary>
                    <div className="space-y-4 pb-5 font-sans text-base leading-7 text-ink">
                      {about.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </details>
                ) : null}

                <ReviewsSection
                  productId={product.id}
                  eyebrow="Customer review"
                  title="From the person who bought it."
                  className="mt-12 border-t border-rule pt-10 lg:mt-24 lg:pt-16"
                />

                <div className="mt-12 lg:mt-24">
                  <RelatedProductsWithSuspense
                    product={product}
                    className="border-t border-rule pt-10 lg:pt-16"
                  />
                </div>
              </Container>
            </section>
        </MarketingShell>
      </ProductViewTracker>
    </>
  )
}

async function similarPiecesHref(product: Product): Promise<string> {
  const payload = await getPayload()
  const { category, stone } = parseStoreQuery({
    category: product.category ?? undefined,
    stone: product.stoneType ?? undefined,
  })
  const candidates = [
    { category, stone },
    { category, stone: [] },
    { category: [], stone },
  ].filter((candidate) => candidate.category.length + candidate.stone.length > 0)

  for (const candidate of candidates) {
    const { totalDocs } = await payload.count({
      collection: 'products',
      where: {
        and: [
          LISTED_PRODUCTS,
          { stock: { greater_than: 0 } },
          ...candidate.category.map((value) => ({ category: { equals: value } })),
          ...candidate.stone.map((value) => ({ stoneType: { equals: value } })),
        ],
      },
    })
    if (totalDocs > 0) return storeUrl({ ...parseStoreQuery({}), ...candidate })
  }
  return '/store'
}

function weightUnitLabel(weight: number, unit: string | null | undefined) {
  if (!unit) return undefined
  return `${weight} ${unit === 'carats' ? 'ct' : unit}`
}

function dimensionsLabel(dimensions: Product['dimensions']) {
  const sizes = [dimensions?.length, dimensions?.width, dimensions?.depth].filter(
    (size): size is number => typeof size === 'number' && size > 0
  )
  return sizes.length > 0 ? `${sizes.join(' × ')} mm` : undefined
}

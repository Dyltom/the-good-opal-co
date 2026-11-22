import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ringStyles } from '@/components/custom-builder/config'
import { ArrowRight } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import type { Metadata } from 'next'
import type { Product } from '@/types/payload-types'
import { MarketingShell } from '@/components/marketing'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { RelatedProductsWithSuspense } from '@/components/product/RelatedProducts'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { cn, formatCurrency, savePercent } from '@/lib/utils'
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
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { summarize, toCatalogProduct } from '@/lib/catalog'
import { reservedProductIds } from '@/lib/inventory-reservations'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

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
  const description =
    product.meta?.description?.trim() ||
    summarize(parseProductDescription(product.description).paragraphs.join(' '))

  return {
    title: product.meta?.title?.trim() || `${product.name} | The Good Opal Co`,
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

export default async function ProductDetailPage({ params }: ProductPageProps) {
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

  const product = docs[0] as Product | undefined
  if (!product) {
    notFound()
  }

  const primaryImage = product.images?.[0]?.image
  const imageUrl =
    (typeof primaryImage === 'object' && primaryImage
      ? resolveMediaUrl(primaryImage.url)
      : undefined) ?? ownedProductImageUrl(product.slug)

  const about = parseProductDescription(product.description)

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
  const notes: string[] = []
  for (const paragraph of about.paragraphs) {
    const labelled = paragraph.match(/^([A-Z][A-Za-z ]{1,18}):\s*(.{1,80})$/)
    if (labelled) {
      const label = labelled[1]!
      const value = labelled[2]!.replace(/\.$/, '')
      const known = facts.some(
        (fact) =>
          fact.label === label || fact.value.toLowerCase() === value.toLowerCase()
      )
      if (!known) facts.push({ label, value })
    } else {
      notes.push(paragraph)
    }
  }
  const stock = product.stock ?? 0
  const catalogProduct = toCatalogProduct(product, stock <= 0 ? await reservedProductIds() : undefined)
  const reserved = catalogProduct.availability === 'reserved'
  const sold = catalogProduct.availability === 'sold'
  const discount = savePercent(product.price, product.compareAtPrice)
  const similarHref = sold ? await similarPiecesHref(product) : undefined
  const isDeposit = product.category === 'custom-commissions'
  const isLooseOpal = product.category === 'raw-opals'
  const aboutHeading = isDeposit
    ? 'About this deposit'
    : product.soldPerUnit
      ? 'About these stones'
      : isLooseOpal
        ? 'About this stone'
        : 'About this piece'
  const availabilityNote = isDeposit
    ? 'A deposit to start your custom piece.'
    : product.soldPerUnit
      ? 'Priced per stone. Stones are selected at random from this batch.'
      : stock === 1
        ? 'What is photographed is exactly what you receive.'
        : null
  const builderEligible = isBuilderEligibleOpal(product.slug, product.name, product)
  const designStyle = ringStyles.find((style) =>
    product.name.toLowerCase().includes(`${style.label.replace('&', 'and').toLowerCase()} ring`)
  )

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

  const askHref = `/contact?subject=product-question&product=${encodeURIComponent(product.name)}`
  const viewingHref = `/contact?subject=virtual-viewing&product=${encodeURIComponent(product.name)}`
  const slideCount = productImages.length + productVideos.length
  const galleryWidth =
    slideCount >= 3
      ? 'calc(var(--H) * 1.2 + 8px)'
      : slideCount === 2
        ? 'calc(var(--H) * 1.6 + 8px)'
        : 'calc(var(--H) * 0.8)'
  const [nameLead, ...nameRest] = product.name.split(' – ')
  const isRing = product.category === 'opal-rings' || Boolean(designStyle)

  return (
    <>
      <ProductJsonLd
        product={catalogProduct}
        properties={facts.map((fact) => ({ name: fact.label, value: fact.value }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Store', url: '/store' },
          ...(product.category && categoryName
            ? [{ name: categoryName, url: `/store?category=${product.category}` }]
            : []),
          { name: product.name, url: catalogProduct.url },
        ]}
      />

      <ProductViewTracker product={product}>
        <MarketingShell>
          <div
            className="grid items-start md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-x-[clamp(24px,3vw,48px)] md:px-gut md:pt-3 lg:grid-cols-[min(var(--gw),calc(100%_-_400px))_minmax(0,1fr)]"
            style={
              {
                '--H': 'max(560px, calc(100svh - 80px))',
                '--gw': galleryWidth,
              } as CSSProperties
            }
          >
            <div data-insight-section="photos" className={cn('min-w-0', slideCount <= 2 && 'md:sticky md:top-[68px]', slideCount === 3 && 'lg:sticky lg:top-[68px]')}>
              <ProductImageGallery
                productName={product.name}
                images={productImages}
                videos={productVideos}
                transitionName={productImageTransitionName(product.slug)}
              />
            </div>

            <div className="min-w-0 px-gut pt-3 md:sticky md:top-[68px] md:max-w-[500px] md:px-0 md:pt-1.5">
              <Breadcrumb
                items={[
                  { label: 'Store', href: '/store' },
                  ...(product.category && categoryName
                    ? [{ label: categoryName, href: `/store?category=${product.category}` }]
                    : []),
                  { label: product.name },
                ]}
                className={cn('[&_li:last-child]:hidden md:[&_li:last-child]:flex', slideCount > 1 && 'pr-14 md:pr-0')}
              />
              <h1 className="mt-2.5 text-[30px] leading-[1.04] tracking-[-0.02em] text-ink md:mt-3.5 md:text-[clamp(30px,2.6vw,42px)]">
                {nameRest.length > 0 ? (
                  <>
                    {nameLead} – <i>{nameRest.join(' – ')}</i>
                  </>
                ) : (
                  product.name
                )}
              </h1>

              {reserved || sold ? (
                <div data-insight-section="price" className="mt-3 md:mt-4">
                  <p className="text-[22px] font-medium leading-tight text-ink md:text-2xl">
                    {reserved ? 'Reserved' : 'Sold'}
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-2">
                    {reserved
                      ? "Someone is checking out with this piece. If they don't complete payment, it returns to the shop within 30 minutes."
                      : 'This piece has found a home.'}
                  </p>
                </div>
              ) : (
                <div
                  data-insight-section="price"
                  className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mt-4"
                >
                  <span className="text-[22px] font-medium leading-tight text-ink md:text-2xl">
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                  <span className="text-[13px] text-ink-2">AUD incl. GST</span>
                  {discount && product.compareAtPrice ? (
                    <span className="text-[13px] text-ink-2">
                      <span className="line-through">{formatCurrency(product.compareAtPrice, 'AUD')}</span>{' '}
                      <span className="font-medium text-accent">Save {discount}%</span>
                    </span>
                  ) : null}
                  {isDeposit ? null : stock === 1 && !product.soldPerUnit ? (
                    <span className="ml-auto text-[13px] text-accent">One of a kind</span>
                  ) : (
                    <span className="ml-auto text-[13px] text-ink-2">{stock} available</span>
                  )}
                </div>
              )}

              <div className="mt-4 md:mt-[18px]">
                {similarHref ? (
                  <div className="grid gap-2">
                    <Button asChild className="min-h-[50px] md:min-h-12">
                      <Link href={similarHref}>See similar pieces</Link>
                    </Button>
                    <Button asChild variant="ghost" className="min-h-[50px] md:min-h-12">
                      <Link href="/contact?subject=opal-finder">Ask us to find one like it</Link>
                    </Button>
                  </div>
                ) : reserved ? (
                  <Button asChild variant="ghost" className="min-h-[50px] w-full md:min-h-12">
                    <Link href={askHref}>Ask about this piece</Link>
                  </Button>
                ) : (
                  <>
                    <ProductActions
                      product={{
                        id: String(product.id),
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        stock,
                        image: imageUrl ?? undefined,
                      }}
                    >
                      <Button asChild variant="ghost" className="min-h-[50px] px-[18px] md:min-h-12">
                        <Link href={askHref}>Ask about this piece</Link>
                      </Button>
                    </ProductActions>
                    {availabilityNote ? (
                      <p className="mt-2 text-[13px] text-ink-2">{availabilityNote}</p>
                    ) : null}
                    <PaymentMethods className="mt-3" />
                  </>
                )}
              </div>

              {facts.length > 0 ? (
                <dl data-insight-section="details" className="mt-4 border-t border-rule text-sm">
                  {facts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 border-b border-rule py-[9px]">
                      <dt className="text-ink-3">{fact.label}</dt>
                      <dd className="text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {notes.length > 0 ? (
                <section aria-labelledby="about-stone" data-insight-section="details" className="mt-[18px]">
                  <h2 id="about-stone" className="sr-only">
                    {aboutHeading}
                  </h2>
                  <div className="grid max-w-[60ch] gap-2.5 text-[14.5px] leading-[1.6] text-ink-2">
                    {notes.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ) : null}

              {sold && !about.photographedUnderWhiteLight ? null : (
                <ul className="mt-5 grid gap-2 text-[13px] text-ink-2">
                  {sold ? null : (
                    <>
                      <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                        <span className="font-medium text-ink-3">Shipping</span>
                        <span>
                          {isDeposit
                            ? 'No shipping charge on the deposit, and it does not count towards free shipping.'
                            : productShippingProgress.qualifies
                              ? 'Free tracked shipping.'
                            : `Tracked shipping, $${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD in Australia, $${SHIPPING_CONFIG.RATES.INTERNATIONAL.EXPRESS} AUD international. Free on orders of $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more.`}{' '}
                          <Link href="/shipping" className="text-ink underline underline-offset-4">
                            Rates
                          </Link>
                        </span>
                      </li>
                      <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                        <span className="font-medium text-ink-3">Returns</span>
                        <span>
                          {isDeposit
                            ? 'Custom work is not eligible for change-of-mind returns. Australian Consumer Law rights still apply.'
                            : '30-day change-of-mind returns on eligible unused pieces.'}{' '}
                          <Link href="/returns" className="text-ink underline underline-offset-4">
                            Policy
                          </Link>
                        </span>
                      </li>
                    </>
                  )}
                  {about.photographedUnderWhiteLight ? (
                    <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                      <span className="font-medium text-ink-3">Photos</span>
                      <span>
                        Photographed under white light. Studio shots have the background replaced; the stone is never
                        retouched.
                      </span>
                    </li>
                  ) : null}
                  {sold || isDeposit ? null : (
                    <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                      <span className="font-medium text-ink-3">Viewing</span>
                      <Link href={viewingHref} className="justify-self-start text-ink underline underline-offset-4">
                        Book a video viewing
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              {isRing ? (
                <div className="mt-[22px] flex flex-wrap items-baseline gap-x-[22px] gap-y-2.5 border border-rule px-[18px] py-4">
                  <p className="basis-full font-serif text-[19px] italic leading-[1.2] text-ink">
                    {designStyle
                      ? `Love the ${designStyle.label} but want your own opal or size?`
                      : 'Love the style but want your own opal or size?'}
                  </p>
                  <TextLink href={designStyle ? `/services/design?y=${designStyle.id}` : '/services/design'}>
                    Design it in the 3D studio
                  </TextLink>
                  <TextLink href="/contact?subject=custom-design">Ask about a custom piece</TextLink>
                </div>
              ) : builderEligible && stock > 0 ? (
                <div className="mt-[22px] flex flex-wrap items-baseline gap-x-[22px] gap-y-2.5 border border-rule px-[18px] py-4">
                  <p className="basis-full font-serif text-[19px] italic leading-[1.2] text-ink">
                    Design a ring around this opal
                  </p>
                  <p className="basis-full text-[13px] text-ink-2">
                    Try this exact stone in settings in the 3D studio, then request a quote.
                  </p>
                  <TextLink href={`/services/design?p=${encodeURIComponent(String(product.id))}`}>
                    Open the 3D studio
                  </TextLink>
                </div>
              ) : null}
            </div>
          </div>

          <ReviewsSection
            productId={product.id}
            title="From the person who bought it."
            className="mx-gut mt-12 border-t border-rule pt-10 md:mt-16"
          />

          <RelatedProductsWithSuspense product={product} limit={5} className="px-gut pb-[clamp(48px,6vw,88px)] pt-[clamp(48px,6vw,88px)]" />
        </MarketingShell>
      </ProductViewTracker>
    </>
  )
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline decoration-rule-2 underline-offset-4 transition-colors hover:decoration-ink md:min-h-0"
    >
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-200 ease-gallery group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
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

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditableHeading, linkArrow, MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { LivingWall, type WallPiece } from '@/components/sections/LivingWall'
import { ClosingBand } from '@/components/sections/ClosingBand'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { opalFire } from '@/lib/opal-fire'
import { getPageContent } from '@/lib/site-content'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { withSalePrice } from '@/lib/promotions'
import {
  cheapestShippingOption,
  EXTRA_COVER_INCLUDED,
  RETURN_WINDOW_DAYS,
} from '@/lib/constants/shipping'
import { caratWeight, storeLabel } from '@/app/(marketing)/store/store-query'
import type { Product } from '@/types/payload-types'

export const metadata: Metadata = {
  title: 'Australian Opals, Chosen by Hand | The Good Opal Co',
  description:
    'Shop one-of-a-kind Australian opals and handcrafted jewellery with clear origin, authenticity, delivery, and care details.',
  alternates: { canonical: '/' },
}

export const dynamic = 'force-dynamic'

const FINISHED = new Set(['opal-rings', 'opal-earrings'])
const PRICED_PER_STONE = /calibrated|priced individually/i
const FINISHED_SLOTS = [0, 1, 6, 8, 12, 14]
const WALL_SIZE = 15

type ListedProduct = Pick<
  Product,
  | 'name'
  | 'slug'
  | 'price'
  | 'featured'
  | 'category'
  | 'stoneType'
  | 'stoneOrigin'
  | 'weight'
  | 'weightUnit'
  | 'images'
>

type Listing = {
  product: ListedProduct
  image: string
  studio: boolean
  fire: number
}

async function firstImage(product: ListedProduct): Promise<Omit<Listing, 'product'> | undefined> {
  const media = product.images?.[0]?.image
  if (typeof media !== 'object' || media === null) return undefined
  const image = resolveMediaUrl(media.url)
  if (!image) return undefined
  const swatch = media.sizes?.thumbnail?.filename ?? media.filename
  return {
    image,
    studio: Boolean(media.filename?.startsWith('studio-')),
    fire: swatch ? await opalFire(swatch) : 0,
  }
}

function toWallPiece({ product, image }: Listing): WallPiece {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image,
    kind: product.category ? storeLabel(product.category) : 'Opal',
    stone: product.stoneType ? storeLabel(product.stoneType) : undefined,
    origin: product.stoneOrigin ? storeLabel(product.stoneOrigin) : undefined,
    carats: caratWeight(product),
  }
}

function hangWall(listings: Listing[]): WallPiece[] {
  const single = listings
    .filter((listing) => !PRICED_PER_STONE.test(listing.product.name))
    .sort(
      (a, b) =>
        Number(b.studio) - Number(a.studio) ||
        Number(Boolean(b.product.featured)) - Number(Boolean(a.product.featured)) ||
        b.fire - a.fire
    )
  const byFire = (a: Listing, b: Listing) => b.fire - a.fire
  const finished = single
    .filter((listing) => FINISHED.has(listing.product.category ?? ''))
    .slice(0, FINISHED_SLOTS.length)
    .sort(byFire)
  const loose = single
    .filter((listing) => !FINISHED.has(listing.product.category ?? ''))
    .slice(0, WALL_SIZE - finished.length)
    .sort(byFire)
  const wall: Listing[] = []
  for (let slot = 0; slot < WALL_SIZE; slot++) {
    const next = FINISHED_SLOTS.includes(slot)
      ? (finished.shift() ?? loose.shift())
      : (loose.shift() ?? finished.shift())
    if (next) wall.push(next)
  }
  return wall.map(toWallPiece)
}

const KINDS = [
  {
    title: 'Rings and earrings',
    href: '/store?category=opal-rings,opal-earrings',
    matches: (product: ListedProduct) => FINISHED.has(product.category ?? ''),
  },
  {
    title: 'Loose opals',
    href: '/store?category=raw-opals',
    matches: (product: ListedProduct) => product.category === 'raw-opals',
  },
  {
    title: 'For jewellers',
    href: '/store?search=calibrated',
    matches: (product: ListedProduct) => /calibrated/i.test(product.name),
  },
]

function walkTheCollection(listings: Listing[], onWall: Set<string>) {
  return KINDS.map((kind) => {
    const members = listings.filter((listing) => kind.matches(listing.product))
    const cover =
      members.find((listing) => listing.studio && !onWall.has(listing.product.slug)) ??
      members.find((listing) => !onWall.has(listing.product.slug)) ??
      members[0]
    return { ...kind, count: members.length, cover }
  }).filter((kind) => kind.count > 0)
}

async function loadInStock(): Promise<Listing[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [LISTED_PRODUCTS, { stock: { greater_than: 0 } }] },
    pagination: false,
    sort: ['-featured', '-price'],
    depth: 1,
    select: {
      name: true,
      slug: true,
      price: true,
      featured: true,
      category: true,
      stoneType: true,
      stoneOrigin: true,
      weight: true,
      weightUnit: true,
      images: true,
    },
  })
  const listings = await Promise.all(
    docs.map(async (doc) => {
      const product = withSalePrice(doc)
      const image = await firstImage(product)
      return image ? [{ product, ...image }] : []
    })
  )
  return listings.flat()
}

const FACTS = [
  ['One of a kind', 'Each stone photographed on its own.'],
  ['Shown as it is', 'Never recoloured.'],
  [
    'Shipping',
    `From $${(cheapestShippingOption('AU', 0).cents / 100).toFixed(2)}, insured over $${EXTRA_COVER_INCLUDED}.`,
  ],
  ['Returns', `${RETURN_WINDOW_DAYS} days, change of mind.`],
  ['Checkout', 'Stripe or PayPal.'],
] as const

function pieceCount(count: number) {
  return `${count} ${count === 1 ? 'piece' : 'pieces'}`
}

export default async function HomePage() {
  const [listings, content] = await Promise.all([loadInStock(), getPageContent('home')])
  const wall = hangWall(listings)
  const kinds = walkTheCollection(listings, new Set(wall.map((piece) => piece.slug)))

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <MarketingShell>
        <LivingWall pieces={wall} />

        <dl className="mx-gut mt-[clamp(28px,4vw,48px)] grid grid-cols-2 border-y border-rule min-[901px]:grid-cols-5">
          {FACTS.map(([term, detail]) => (
            <div
              key={term}
              className="py-3.5 pr-3 last:col-span-2 last:border-l-0 last:pl-0 even:border-l even:border-rule even:pl-3.5 min-[901px]:py-[18px] min-[901px]:pr-5 min-[901px]:last:col-span-1 min-[901px]:[&:nth-child(n+2)]:border-l min-[901px]:[&:nth-child(n+2)]:pl-5 [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-rule min-[901px]:[&:nth-child(n+3)]:border-t-0"
            >
              <dt className="mb-[5px] text-xs uppercase tracking-[0.06em] text-ink-3">{term}</dt>
              <dd className="text-[14.5px] leading-[1.45] text-ink">{detail}</dd>
            </div>
          ))}
        </dl>

        {kinds.length > 0 ? (
          <section aria-labelledby="kinds-heading" className="px-gut pt-sec">
            <div className="mb-[22px] flex items-end justify-between gap-5">
              <h2 id="kinds-heading" className="text-[clamp(30px,3.4vw,52px)] leading-[1.02]">
                <EditableHeading heading={content.collectionHeading} />
              </h2>
              <Link href="/store" className={`${linkArrow} shrink-0`}>
                All pieces
                <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 items-start gap-x-2 gap-y-4 md:grid-cols-[1.5fr_1fr_1fr] md:gap-[clamp(10px,1.4vw,20px)]">
              {kinds.map((kind) => (
                <Link
                  key={kind.title}
                  href={kind.href}
                  className="group block text-ink no-underline first:col-span-2 md:first:col-span-1"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-plinth group-first:aspect-[5/4] md:aspect-auto md:h-[clamp(300px,36vw,540px)] md:group-first:aspect-auto">
                    {kind.cover ? (
                      <Image
                        src={kind.cover.image}
                        alt={kind.cover.product.name}
                        fill
                        sizes="(max-width: 767px) 100vw, 40vw"
                        className="object-cover transition-transform duration-1000 ease-gallery group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-3 flex items-center justify-between gap-3 text-[21px] md:text-[clamp(22px,2vw,30px)]">
                    {kind.title}
                    <ArrowRight
                      className="h-5 w-5 shrink-0 transition-transform duration-300 ease-gallery group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="mt-1 text-[13px] tabular-nums text-ink-3 md:text-sm">
                    {pieceCount(kind.count)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="custom-heading" className="px-gut pt-sec">
          <div className="grid gap-5 border-t border-rule pt-[clamp(14px,1.4vw,20px)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-[clamp(20px,4vw,72px)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-plinth md:aspect-[4/3]">
              <Image
                src={content.customImage.src}
                alt={content.customImage.alt}
                fill
                sizes="(max-width: 767px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 id="custom-heading" className="text-[clamp(30px,3.4vw,52px)] leading-[1.02]">
                <EditableHeading heading={content.customHeading} />
              </h2>
              <p className="mt-2 max-w-[48ch] text-[15px] text-ink-2">{content.customText}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button asChild>
                  <Link href="/services/design">
                    Open the 3D designer
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Link href="/contact?subject=custom-design" className={linkArrow}>
                  Or start with an enquiry
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection title={content.reviewsHeading} className="px-gut pt-sec" />

        <ClosingBand
          id="sourced-heading"
          heading={<EditableHeading heading={content.closingHeading} />}
          line={content.closingText}
          image={content.closingImage}
          action={{ href: '/about', label: 'Our story' }}
        />
      </MarketingShell>
    </>
  )
}

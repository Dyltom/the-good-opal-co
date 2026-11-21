import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Instagram } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { MarketingShell } from '@/components/marketing'
import { ProductCard } from '@/components/product/ProductCard'
import { HomeHero } from '@/components/sections/HomeHero'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import type { Product } from '@/types/payload-types'

export const metadata: Metadata = {
  title: 'Australian Opals, Chosen by Hand | The Good Opal Co',
  description:
    'Shop one-of-a-kind Australian opals and handcrafted jewellery with clear origin, authenticity, delivery, and care details.',
  alternates: { canonical: '/' },
}

export const dynamic = 'force-dynamic'

function descriptionText(description: unknown): string {
  if (typeof description === 'string') return description
  const richText = description as {
    root?: { children?: Array<{ children?: Array<{ text?: string }> }> }
  }

  return (richText.root?.children ?? [])
    .flatMap((node) => (node.children ?? []).map((child) => child.text ?? ''))
    .filter(Boolean)
    .join(' ')
}

const MULTI_STONE_LISTING = /parcel|calibrated|priced individually/i

function hasStudioPhoto(product: Product): boolean {
  const image = product.images?.[0]?.image
  return (
    typeof image === 'object' && image !== null && Boolean(image.filename?.startsWith('studio-'))
  )
}

async function FeaturedPieces() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [LISTED_PRODUCTS, { stock: { greater_than: 0 } }],
    },
    limit: 48,
    sort: ['-featured', '-price'],
    depth: 1,
  })
  const products = docs
    .filter((product) => hasStudioPhoto(product) && !MULTI_STONE_LISTING.test(product.name))
    .slice(0, 8)

  if (products.length === 0) {
    return (
      <div className="border-y border-warm-grey/55 py-14 text-center">
        <h3 className="font-serif text-2xl font-semibold text-charcoal">
          New pieces are being prepared.
        </h3>
        <p className="mx-auto mt-3 max-w-xl font-sans text-sm leading-6 text-charcoal/65">
          Join the gallery notes or contact us if you are looking for a particular opal.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {products.map((product, index) => {
        const image = product.images?.[0]?.image
        return (
          <ProductCard
            key={product.id}
            index={index}
            product={{
              id: String(product.id),
              slug: product.slug,
              name: product.name,
              description: descriptionText(product.description),
              price: product.price,
              compareAtPrice: product.compareAtPrice ?? undefined,
              stock: product.stock ?? 0,
              featured: product.featured ?? false,
              category: product.category,
              image: image && typeof image === 'object' ? resolveMediaUrl(image.url) : undefined,
              stoneType: product.stoneType ?? undefined,
              stoneOrigin: product.stoneOrigin ?? undefined,
            }}
          />
        )
      })}
    </div>
  )
}

const discoveryPaths = [
  {
    eyebrow: 'Gifts',
    title: 'A piece with a story.',
    copy: 'Start with pieces that are ready to give, then ask us anything before you decide.',
    href: '/store',
    cta: 'Explore gift-worthy pieces',
    image: '/images/studio/heart-opal.jpg',
    alt: 'A heart-shaped white Australian opal on a cream background',
  },
  {
    eyebrow: 'First opal',
    title: 'New to opals? Start here.',
    copy: 'Learn what colour, origin, setting, and care details matter, in plain language.',
    href: '/blog',
    cta: 'Read the opal guide',
    image: '/images/studio/opal-selection.jpg',
    alt: 'Four polished Australian opals in blue, green and orange on a cream background',
  },
  {
    eyebrow: 'Collector stones',
    title: 'For the serious collector.',
    copy: 'Browse loose and raw opals by colour, type, origin, price, and availability.',
    href: '/store?category=raw-opals',
    cta: 'Browse collector stones',
    image: '/images/studio/black-opal.jpg',
    alt: 'A loose black opal with green and blue flashes',
  },
]

const INSTAGRAM_URL = 'https://www.instagram.com/thegoodopalco'

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <MarketingShell mainClassName="pt-0">
        <HomeHero />

        <section className="bg-cream px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[90rem]">
            <div className="mb-10 max-w-3xl lg:mb-12">
              <Eyebrow>Find your way in</Eyebrow>
              <h2 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl lg:text-5xl">
                Choose by what matters to you.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden border border-warm-grey/55 bg-warm-grey/55 md:grid-cols-3">
              {discoveryPaths.map((path) => (
                <Link
                  key={path.eyebrow}
                  href={path.href}
                  className="group grid grid-cols-[7.5rem_1fr] bg-cream md:flex md:flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-opal-electric-accessible"
                >
                  <div className="relative aspect-square overflow-hidden border-r border-warm-grey/55 bg-cream-dark md:aspect-[4/3] md:border-b md:border-r-0">
                    <Image
                      src={path.image}
                      alt={path.alt}
                      fill
                      sizes="(max-width: 768px) 7.5rem, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5 md:p-9">
                    <div>
                      <Eyebrow>{path.eyebrow}</Eyebrow>
                      <h3 className="mt-4 text-balance font-serif text-2xl font-medium leading-tight text-charcoal lg:text-3xl">
                        {path.title}
                      </h3>
                      <p className="text-charcoal/68 mt-4 hidden font-sans text-sm leading-7 sm:text-base md:block">
                        {path.copy}
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-3 font-sans text-sm font-semibold text-charcoal md:mt-8">
                      {path.cta}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[90rem]">
            <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>Featured pieces</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl font-medium text-charcoal sm:text-4xl lg:text-5xl">
                  One stone, one piece.
                </h2>
              </div>
              <Link
                href="/store"
                className="inline-flex min-h-11 items-center gap-3 font-sans text-sm font-semibold text-charcoal underline decoration-warm-grey underline-offset-8 hover:decoration-charcoal"
              >
                View the full collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <FeaturedPieces />
          </div>
        </section>

        <section className="overflow-hidden bg-charcoal text-cream">
          <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-20">
            <figure className="mx-auto w-full max-w-lg lg:max-w-[34rem]">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal-dark">
                <Image
                  src="/images/studio/opal-macro-coober-pedy.jpg"
                  alt="Close-up of a white opal from Coober Pedy with orange, blue and green flashes"
                  fill
                  sizes="(max-width: 1024px) 100vw, 34rem"
                  className="macro-drift object-cover"
                />
              </div>
              <figcaption className="mt-4 font-sans text-xs tracking-wide text-cream/60">
                Coober Pedy white opal, 6.35 ct. Close-up, shown as photographed.
              </figcaption>
            </figure>
            <div className="max-w-xl">
              <Eyebrow className="text-opal-light">Nothing retouched</Eyebrow>
              <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
                Every flash you see is in the stone.
              </h2>
              <p className="text-cream/72 mt-6 font-sans text-base leading-8 sm:text-lg">
                This is one opal from the shop, up close. Our studio shots replace the background
                and never the colour, so the stone you choose is the stone that arrives.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/store/coober-pedy-white-opal-6-35-cts"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-cream px-6 font-sans text-sm font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                >
                  See this opal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/store"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-cream/40 px-6 font-sans text-sm font-semibold text-cream transition-colors hover:border-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                >
                  Shop all opals
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection
          eyebrow="Customer reviews"
          title="In their words."
          className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
        />

        <section className="border-t border-warm-grey/55 bg-cream px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-cream-dark">
              <Image
                src="/images/studio/white-opal.jpg"
                alt="A polished white Australian opal with green flashes"
                fill
                sizes="(max-width: 1024px) 90vw, 24rem"
                className="object-cover"
              />
            </div>
            <div className="max-w-2xl">
              <Eyebrow>Meet Steph</Eyebrow>
              <h2 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl lg:text-5xl">
                The person behind the stones.
              </h2>
              <p className="text-charcoal/72 mt-6 font-sans text-base leading-8">
                The Good Opal Co is led by founder Stephanie Caruana. Steph has written about
                cutting and sourcing Australian opal since 2020, and she leads the personal guidance
                behind every enquiry.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-charcoal px-6 font-sans text-sm font-semibold text-cream transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                >
                  Read our story
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-charcoal/45 px-6 font-sans text-sm font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  Follow @thegoodopalco
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="grid bg-charcoal text-cream lg:grid-cols-2">
          <div className="relative min-h-[28rem] lg:min-h-[42rem]">
            <Image
              src="/images/customs/custom-2.jpg"
              alt="Australian opals selected for a custom jewellery piece"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16 lg:py-20">
            <div className="max-w-xl">
              <Eyebrow className="text-opal-light">Custom work</Eyebrow>
              <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
                Begin with the stone, not a template.
              </h2>
              <p className="text-cream/72 mt-6 font-sans text-base leading-8 sm:text-lg">
                Bring an occasion, an idea, or an opal of your own. We can help shape the brief,
                explain the trade-offs, and create a piece around what matters to you.
              </p>
              <Link
                href="/services"
                className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-md bg-cream px-6 font-sans text-sm font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                Explore custom work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </MarketingShell>
    </>
  )
}

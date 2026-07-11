import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/marketing'
import { ProductCard } from '@/components/product/ProductCard'
import { HomeHero } from '@/components/sections'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'

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

async function LatestPieces() {
  const payload = await getPayload()
  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      and: [{ status: { equals: 'published' } }, { stock: { greater_than: 0 } }],
    },
    limit: 4,
    sort: '-updatedAt',
    depth: 2,
  })

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
            animated={false}
            showWishlist={false}
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
              createdAt: product.createdAt,
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
    image: '/images/customs/custom-1.jpg',
    alt: 'Three heart-shaped Australian opals',
    layout: 'lg:col-span-7',
  },
  {
    eyebrow: 'First opal',
    title: 'New to opals? Start here.',
    copy: 'Learn what colour, origin, setting, and care details matter, in plain language.',
    href: '/blog',
    cta: 'Read the opal guide',
    image: '/images/hero/opal-1.jpg',
    alt: 'A selection of blue Australian opals',
    layout: 'lg:col-span-5',
  },
  {
    eyebrow: 'Collector stones',
    title: 'For the detail-led collector.',
    copy: 'Browse loose and raw opals by colour, type, origin, dimensions, and availability.',
    href: '/store?category=raw-opals',
    cta: 'Browse collector stones',
    image: '/images/categories/opals.jpg',
    alt: 'Loose Australian opals for collectors',
    layout: 'lg:col-span-12',
  },
]

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <MarketingShell mainClassName="pt-0">
          <HomeHero />

          <section className="bg-cream px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="mx-auto max-w-[90rem]">
              <div className="mb-12 max-w-3xl lg:mb-16">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                  Find your way in
                </p>
                <h2 className="mt-4 text-balance font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl lg:text-6xl">
                  Choose by what matters to you.
                </h2>
              </div>

              <div className="grid gap-px overflow-hidden border border-warm-grey/55 bg-warm-grey/55 lg:grid-cols-12">
                {discoveryPaths.map((path, index) => (
                  <Link
                    key={path.eyebrow}
                    href={path.href}
                    className={`group grid min-h-[32rem] bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-opal-electric-accessible ${path.layout} ${index === 2 ? 'sm:grid-cols-[0.8fr_1.2fr]' : ''}`}
                  >
                    <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-11">
                      <div>
                        <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                          {path.eyebrow}
                        </p>
                        <h3 className="mt-5 max-w-[12ch] text-balance font-serif text-4xl font-medium leading-[1.02] text-charcoal lg:text-5xl">
                          {path.title}
                        </h3>
                        <p className="text-charcoal/68 mt-5 max-w-[32rem] font-sans text-sm leading-7 sm:text-base">
                          {path.copy}
                        </p>
                      </div>
                      <span className="mt-9 inline-flex items-center gap-3 font-sans text-sm font-semibold text-charcoal">
                        {path.cta}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div
                      className={`relative min-h-64 overflow-hidden ${index < 2 ? 'border-t border-warm-grey/55' : 'border-t border-warm-grey/55 sm:border-l sm:border-t-0'}`}
                    >
                      <Image
                        src={path.image}
                        alt={path.alt}
                        fill
                        sizes={
                          index === 2
                            ? '(max-width: 1024px) 100vw, 60vw'
                            : '(max-width: 1024px) 100vw, 50vw'
                        }
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="mx-auto max-w-[90rem]">
              <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                    Recently added
                  </p>
                  <h2 className="mt-4 font-serif text-4xl font-medium text-charcoal sm:text-5xl">
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
              <LatestPieces />
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
            <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
              <div className="max-w-xl">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-opal-light">
                  Custom work
                </p>
                <h2 className="mt-5 text-balance font-serif text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
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

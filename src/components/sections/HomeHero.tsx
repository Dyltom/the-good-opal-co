import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Camera, Lock, RotateCcw, Truck } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { formatCurrency } from '@/lib/utils'
import { SHIPPING_CONFIG } from '@/lib/constants/shipping'
import type { Media } from '@/types/payload-types'
import { resolveMediaUrl } from '@/lib/media-url'

function mediaDetails(value: number | Media | null | undefined) {
  if (!value || typeof value === 'number') return null

  return {
    url: resolveMediaUrl(value.url) ?? null,
    alt: value.alt || 'Australian opal selected by The Good Opal Co',
  }
}

export async function HomeHero() {
  const payload = await getPayload()
  const [{ docs: finishedPieces }, { docs: products }] = await Promise.all([
    payload.find({
      collection: 'products',
      where: {
        and: [
          LISTED_PRODUCTS,
          { stock: { greater_than: 0 } },
          { category: { not_equals: 'raw-opals' } },
        ],
      },
      limit: 12,
      sort: '-updatedAt',
      depth: 2,
    }),
    payload.find({
    collection: 'products',
    where: {
      and: [LISTED_PRODUCTS, { stock: { greater_than: 0 } }],
    },
    limit: 12,
    sort: '-updatedAt',
    depth: 2,
    }),
  ])

  const displayPieces = finishedPieces.filter((product) => product.price >= 100)
  const primary = displayPieces[0] ?? finishedPieces[0] ?? products[0]
  const secondary =
    displayPieces[1] ?? finishedPieces.find((product) => product.id !== primary?.id)
  const primaryMedia = mediaDetails(primary?.images?.[0]?.image)
  const secondaryMedia = mediaDetails(secondary?.images?.[0]?.image)

  const primaryHref = primary ? `/store/${primary.slug}` : '/store'
  const primaryImage = primaryMedia?.url ?? '/images/hero/opal-1.jpg'
  const secondaryImage = secondaryMedia?.url ?? '/images/customs/custom-1.jpg'

  const trustItems = [
    { icon: Lock, label: 'Secure checkout by Stripe', detail: 'Card, Apple Pay, Klarna' },
    {
      icon: Truck,
      label: 'Tracked delivery',
      detail: `Free on orders of $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more`,
    },
    { icon: RotateCcw, label: '30-day returns', detail: 'Change of mind, on eligible pieces' },
    { icon: Camera, label: 'Every stone shown as it is', detail: 'Photographed individually, origin disclosed' },
  ]

  return (
    <section className="border-b border-rule">
      <div className="mx-auto grid max-w-[96rem] lg:min-h-[40rem] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center px-5 py-8 sm:px-8 sm:py-14 lg:px-12 lg:py-20 xl:px-20">
          <div className="max-w-[42rem]">
            <p className="mb-5 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Personally selected in Australia
            </p>
            <h1 className="max-w-[12ch] text-balance font-serif text-[clamp(2.4rem,4.4vw,4.5rem)] font-medium leading-[1] text-ink">
              Australian opals, chosen by hand.
            </h1>
            <p className="mt-5 max-w-[35rem] text-pretty font-sans text-base leading-7 text-ink sm:mt-7 sm:text-lg sm:leading-8">
              One-of-a-kind stones and jewellery, sourced here and explained clearly. See the
              colour, provenance, price, and practical details before you choose.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                href="/store"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-ink px-6 font-sans text-sm font-semibold text-bg transition-colors duration-150 hover:bg-[#3a332b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Shop one-of-a-kind pieces
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact?subject=virtual-viewing"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-rule-2 bg-transparent px-6 font-sans text-sm font-semibold text-ink transition-colors duration-150 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Book a virtual viewing
              </Link>
            </div>
            <p className="mt-5 hidden max-w-[34rem] font-sans text-sm leading-6 text-ink-2 sm:block">
              Unsure where to begin? Tell us who it is for, your budget, and what caught your eye.
              We will help narrow the choice without pressure.
            </p>
          </div>
        </div>

        <div className="relative order-first aspect-[3/2] overflow-hidden bg-plinth sm:aspect-auto sm:min-h-[31rem] lg:order-none lg:min-h-full">
          <Link href={primaryHref} className="group absolute inset-0 block">
            <Image
              src={primaryImage}
              alt={primaryMedia?.alt ?? 'Collection of vivid Australian opals'}
              fill
              priority
              fetchPriority="high"
              quality={92}
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-ink px-5 py-4 text-bg sm:px-7">
              <span className="min-w-0">
                <span className="block truncate font-serif text-xl font-semibold sm:text-2xl">
                  {primary?.name ?? 'Explore current opals'}
                </span>
                <span className="mt-1 block font-sans text-xs text-bg/70">
                  {primary ? 'Available now, one piece only' : 'See the current collection'}
                </span>
              </span>
              {primary ? (
                <span className="shrink-0 font-sans text-sm font-semibold">
                  {formatCurrency(primary.price, 'AUD')}
                </span>
              ) : null}
            </span>
          </Link>

          <div className="absolute right-4 top-4 hidden w-[11rem] rotate-[1.5deg] border border-rule bg-bg p-2 shadow-md sm:block lg:right-7 lg:top-7 xl:w-[13rem]">
            <div className="relative aspect-[4/3] overflow-hidden bg-plinth">
              <Image
                src={secondaryImage}
                alt={secondaryMedia?.alt ?? 'Opals selected at The Good Opal Co workbench'}
                fill
                sizes="13rem"
                className="object-cover"
              />
            </div>
            <p className="px-1 pb-1 pt-3 font-serif text-sm italic leading-5 text-ink">
              Selected one stone at a time.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-rule bg-bg">
        <ul aria-label="Buying with us" className="mx-auto grid max-w-[96rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <li
              key={item.label}
              className="flex min-h-20 items-center gap-3 border-b border-rule px-5 py-4 font-sans text-sm sm:px-8 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <item.icon className="h-5 w-5 shrink-0 text-ink-2" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-ink">{item.label}</span>
                <span className="block text-ink-2">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

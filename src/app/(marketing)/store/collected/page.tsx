import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing'
import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import { storeLabel } from '../store-query'

export const metadata: Metadata = {
  title: 'Recently sold | The Good Opal Co',
  description: 'One-of-a-kind Australian opals and pieces that have already found a home.',
  alternates: { canonical: '/store/collected' },
}
export const dynamic = 'force-dynamic'

export default async function CollectedPage() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [LISTED_PRODUCTS, { stock: { less_than_equal: 0 } }] },
    sort: '-updatedAt',
    limit: 48,
    depth: 1,
    select: { name: true, slug: true, images: true, stoneType: true, stoneOrigin: true },
  })

  if (docs.length === 0) notFound()

  return (
    <MarketingShell>
      <header className="border-b border-rule px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[92rem]">
          <p className="mb-4 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-2">
            Recently sold
          </p>
          <h1 className="max-w-[18ch] font-serif text-[clamp(2.1rem,3.4vw,3.5rem)] leading-[1.02] text-ink">
            Pieces that have found a home.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base leading-7 text-ink-2 sm:text-lg sm:leading-8">
            Every opal here was one of a kind, so none of them will come back. If one speaks to you,
            tell us about it and we will look for something with the same feeling.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm font-semibold">
            <Link
              href="/contact?subject=opal-finder"
              className="inline-flex min-h-11 items-center rounded-sm bg-ink px-6 text-bg transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Ask us to find one
            </Link>
            <Link
              href="/store"
              className="inline-flex min-h-11 items-center underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
            >
              Shop available pieces
            </Link>
          </div>
        </div>
      </header>

      <section aria-label="Sold pieces" className="bg-plinth px-5 py-12 sm:px-8 sm:py-16">
        <ul className="mx-auto grid max-w-[92rem] grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {docs.map((product) => {
            const first = product.images?.[0]?.image
            const image =
              (typeof first === 'object' && first ? resolveMediaUrl(first.url) : undefined) ??
              ownedProductImageUrl(product.slug)
            const details = [product.stoneType, product.stoneOrigin]
              .flatMap((value) => (value ? [storeLabel(value)] : []))
              .join(' · ')

            return (
              <li key={product.id}>
                <Link
                  href={`/store/${encodeURIComponent(product.slug)}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-bg">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
                        className="object-cover"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-bg px-3 py-1 font-sans text-xs font-semibold text-ink">
                      Sold
                    </span>
                  </div>
                  <h2 className="mt-3 font-serif text-base leading-tight text-ink group-hover:underline group-hover:underline-offset-4">
                    {product.name}
                  </h2>
                  {details ? <p className="mt-1 font-sans text-xs text-ink-2">{details}</p> : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </MarketingShell>
  )
}

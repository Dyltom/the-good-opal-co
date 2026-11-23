import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing'
import { buttonVariants } from '@/components/ui/button'
import { getPayload } from '@/lib/payload'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import { storeLabel } from '../store-query'

export const metadata: Metadata = {
  title: 'Recently sold | The Good Opal Co',
  description:
    'One-of-a-kind Australian opals and pieces that have already found a home. Ask us to find a similar stone, or browse the opals still for sale.',
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
      <section aria-labelledby="collected-title" className="px-gut pb-14 pt-5 lg:pb-20 lg:pt-7">
        <div className="flex flex-col gap-x-10 gap-y-3 border-b border-rule pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1
              id="collected-title"
              className="font-serif text-[26px] leading-[1.1] tracking-[-0.02em] text-ink lg:text-[28px]"
            >
              Pieces that have found a home
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              Every opal here was one of a kind, so none of them will come back. If one speaks to
              you, tell us about it and we will look for something with the same feeling.
            </p>
          </div>
          <div className="flex flex-none flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/contact?subject=opal-finder" className={buttonVariants({ size: 'sm' })}>
              Ask us to find one
            </Link>
            <Link
              href="/store"
              className="inline-flex min-h-11 items-center text-sm text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
            >
              Shop available pieces
            </Link>
          </div>
        </div>

        <ul
          aria-label="Sold pieces"
          className="mt-5 grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))] sm:gap-x-3 sm:gap-y-[22px]"
        >
          {docs.map((product) => {
            const first = product.images?.[0]?.image
            const image =
              (typeof first === 'object' && first ? resolveMediaUrl(first.url) : undefined) ??
              ownedProductImageUrl(product.slug)
            const details = [product.stoneType, product.stoneOrigin]
              .flatMap((value) => (value ? [storeLabel(value).split(',')[0]] : []))
              .join(' · ')

            return (
              <li key={product.id}>
                <Link
                  href={`/store/${encodeURIComponent(product.slug)}`}
                  className="group block no-underline"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-plinth">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 300px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2.5 gap-y-px px-px pb-0.5 pt-[9px]">
                    <h2 className="line-clamp-2 font-serif text-[15px] italic leading-[1.25] text-ink group-hover:underline group-hover:decoration-rule-2 group-hover:underline-offset-4">
                      {product.name}
                    </h2>
                    <p className="text-sm font-medium text-ink-2">Sold</p>
                    {details ? (
                      <p className="col-span-2 text-xs leading-[1.4] text-ink-2">{details}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </MarketingShell>
  )
}

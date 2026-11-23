import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { ProductCard } from '@/components/product'
import { toProductCardProduct } from '@/components/product/RelatedProducts'
import { BreadcrumbJsonLd } from '@/components/seo'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { getPayload } from '@/lib/payload'
import { CHRISTMAS_DELIVERY, withSalePrice } from '@/lib/promotions'
import type { Product } from '@/types/payload-types'
import { EMPTY_STORE_QUERY, storeUrl } from '../store/store-query'

export const metadata: Metadata = {
  title: 'Opal Gifts by Budget | The Good Opal Co',
  description:
    'Natural Australian opals and opal jewellery grouped by budget: under $100, $100 to $250, and $250 and over. Tracked delivery from Cowra NSW.',
  alternates: { canonical: '/gifts' },
}
export const dynamic = 'force-dynamic'

const BANDS = [
  { title: 'Under $100', priceMax: 99.99 },
  { title: '$100 to $250', priceMin: 100, priceMax: 249.99 },
  { title: '$250 and over', priceMin: 250 },
] as const

async function loadGiftProducts(): Promise<Product[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [LISTED_PRODUCTS, { stock: { greater_than: 0 } }, { category: { not_equals: 'custom-commissions' } }],
    },
    sort: ['-featured', '-createdAt'],
    limit: 500,
    pagination: false,
    depth: 1,
  })
  return docs.map((doc) => withSalePrice(doc))
}

const GIFT_MESSAGE = 'I am looking for an opal gift.\nIt is for:\nMy budget:\nNeeded by:'

const linkClass =
  'inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink md:min-h-0'

export default async function GiftsPage() {
  const products = await loadGiftProducts()
  const christmas = new Date() < CHRISTMAS_DELIVERY.endsAt

  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Gifts', url: '/gifts' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title="Opal gifts, by budget."
          description="Natural Australian opals and opal jewellery, grouped by budget. Every order ships tracked from Cowra NSW."
        />

        {christmas ? (
          <div className="mt-6 max-w-[65ch] border-l-2 border-accent pl-4 text-sm leading-6 text-ink-2">
            <p>
              <strong className="font-medium text-ink">Christmas delivery in Australia:</strong> order by{' '}
              {CHRISTMAS_DELIVERY.orderBy}, or by {CHRISTMAS_DELIVERY.remoteOrderBy} for WA, NT and
              Tasmania.{' '}
              <Link href="/shipping#christmas" className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink">
                Shipping details
              </Link>
            </p>
          </div>
        ) : null}

        {BANDS.map((band) => {
          const inBand = products.filter(
            (product) =>
              product.price >= ('priceMin' in band ? band.priceMin : 0) &&
              product.price <= ('priceMax' in band ? band.priceMax : Infinity)
          )
          if (inBand.length === 0) return null
          const query = {
            ...EMPTY_STORE_QUERY,
            priceMin: 'priceMin' in band ? band.priceMin : undefined,
            priceMax: 'priceMax' in band ? band.priceMax : undefined,
          }
          return (
            <section key={band.title} className="mt-12 md:mt-[clamp(48px,5vw,72px)]">
              <div className="mb-[22px] flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-[clamp(26px,3vw,38px)] leading-[1.05] tracking-[-0.015em] text-ink">
                  {band.title}
                </h2>
                <Link href={storeUrl(query)} className={linkClass}>
                  See all {inBand.length}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 md:grid-cols-4 md:gap-x-4">
                {inBand.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={toProductCardProduct(product)} index={index} />
                ))}
              </div>
            </section>
          )
        })}

        <section className="mt-12 grid gap-6 border-t border-rule pt-8 md:mt-[clamp(48px,5vw,72px)] md:grid-cols-2 md:gap-[clamp(24px,4vw,72px)]">
          <div>
            <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">Not sure which one?</h2>
            <p className="mt-3 max-w-[60ch] text-sm leading-6 text-ink-2">
              Tell us who it is for and your budget, and we will suggest a few pieces. Design a ring
              around one of our opals, or give a gift voucher and let them choose.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-x-6 gap-y-2 md:justify-end md:pt-2">
            <Link href={`/contact?message=${encodeURIComponent(GIFT_MESSAGE)}`} className={linkClass}>
              Ask for suggestions
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/services/design" className={linkClass}>
              Design a ring
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/gift-vouchers" className={linkClass}>
              Give a gift voucher
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Container>
    </MarketingShell>
  )
}

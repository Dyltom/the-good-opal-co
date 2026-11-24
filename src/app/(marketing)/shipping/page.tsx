import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd } from '@/components/seo'
import {
  DELIVERY_ESTIMATE,
  FREE_SHIPPING_THRESHOLD,
  publishedShippingOptions,
  SHIPPING_COUNTRIES,
  SHIPPING_COUNTRY_NAMES,
} from '@/lib/constants/shipping'

const AUSTRALIA = publishedShippingOptions('AU')

function audPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)}`
}
import { CHRISTMAS_DELIVERY, promotionsPending } from '@/lib/promotions'

export const metadata: Metadata = {
  title: 'Shipping & Delivery | The Good Opal Co',
  description: `Tracked Australia Post delivery from Cowra NSW at Australia Post's published price, from ${audPrice(AUSTRALIA[0]?.cents ?? 0)} AUD within Australia. Free on orders of ${FREE_SHIPPING_THRESHOLD} AUD or more. Dispatch and delivery times for every order.`,
  alternates: { canonical: '/shipping' },
}

async function ChristmasDelivery() {
  if (!promotionsPending()) return null
  await connection()
  if (new Date() >= CHRISTMAS_DELIVERY.endsAt) return null

  return (
    <section id="christmas" className="mt-10 scroll-mt-24 border-l-2 border-accent pl-4 md:mt-12">
      <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">Christmas delivery</h2>
      <p className="mt-3 max-w-[65ch] text-sm leading-6 text-ink-2">
        For delivery in Australia before Christmas, order by{' '}
        <strong className="font-medium text-ink">{CHRISTMAS_DELIVERY.orderBy}</strong>, or by{' '}
        <strong className="font-medium text-ink">{CHRISTMAS_DELIVERY.remoteOrderBy}</strong>{' '}
        for WA, NT and Tasmania. These dates allow for our dispatch time and Australia Post&apos;s
        Christmas lodgement dates.
      </p>
      <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
        Ordering later, or sending overseas?{' '}
        <Link
          href="/contact?subject=shipping"
          className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
        >
          Ask us first
        </Link>{' '}
        and we will tell you what is still possible.
      </p>
    </section>
  )
}

export default function ShippingPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shipping', url: '/shipping' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title="Shipping, without surprises."
          description="See the current charge before payment. Every dispatched order includes tracking, and delivery estimates begin after dispatch."
        />

        <div className="mt-8 grid border-t border-rule md:grid-cols-3 md:border-b">
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Tracked delivery</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              We charge Australia Post&apos;s published price for your destination, with
              tracking on every parcel.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Free delivery</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Orders of ${FREE_SHIPPING_THRESHOLD} AUD or more ship free: Express Post within
              Australia, International Standard overseas.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Delivery estimate</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">{DELIVERY_ESTIMATE}</p>
          </div>
        </div>

        <section className="mt-10 md:mt-12" aria-labelledby="shipping-prices">
          <h2 id="shipping-prices" className="text-[1.75rem] leading-[1.1] md:text-[2rem]">
            Prices per order
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-6 text-ink-2">
            Australia Post&apos;s published price for the smallest parcel, in AUD. You choose the
            service in secure checkout.
          </p>
          <table className="mt-4 w-full max-w-2xl text-left text-sm">
            <thead className="border-b border-rule text-ink-3">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Destination</th>
                <th scope="col" className="py-2 pr-4 font-medium">Standard</th>
                <th scope="col" className="py-2 font-medium">Express</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule text-ink-2">
              {SHIPPING_COUNTRIES.map((country) => {
                const [standard, express] = publishedShippingOptions(country)
                return (
                  <tr key={country}>
                    <th scope="row" className="py-2 pr-4 font-normal text-ink">
                      {SHIPPING_COUNTRY_NAMES[country]}
                    </th>
                    <td className="py-2 pr-4">
                      {standard ? `${standard.label} ${audPrice(standard.cents)}` : null}
                    </td>
                    <td className="py-2">{express ? `${express.label} ${audPrice(express.cents)}` : null}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <ChristmasDelivery />

        <div className="mt-10 grid gap-10 md:mt-[clamp(40px,4.5vw,64px)] md:grid-cols-2 md:gap-[clamp(24px,4vw,72px)]">
          <section>
            <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">What happens next</h2>
            <ol className="mt-4 max-w-[65ch] space-y-3 text-sm leading-6 text-ink-2">
              <li>
                <strong className="font-medium text-ink">1. Confirmation.</strong> You receive an
                order confirmation after payment.
              </li>
              <li>
                <strong className="font-medium text-ink">2. Preparation.</strong> In-stock pieces
                are checked and prepared for dispatch.
              </li>
              <li>
                <strong className="font-medium text-ink">3. Tracking.</strong> We send tracking
                details when the carrier accepts the parcel.
              </li>
            </ol>
          </section>
          <section>
            <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">International orders</h2>
            <p className="mt-4 max-w-[65ch] text-sm leading-6 text-ink-2">
              Supported destinations are charged Australia Post&apos;s published International
              Standard or International Express price below the free-shipping threshold. Prices and
              shipping are charged in AUD. Import
              duties, taxes, and local handling charges are not included in our price and remain the
              recipient’s responsibility.
            </p>
            <p className="mt-3 max-w-[65ch] text-sm leading-6 text-ink-2">
              Need a piece by a particular date, or cannot select your country?{' '}
              <Link
                href="/contact?subject=shipping"
                className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
              >
                Ask us before ordering.
              </Link>
            </p>
          </section>
        </div>

        <p className="mt-10 max-w-[80ch] border-t border-rule pt-5 text-[13px] leading-5 text-ink-3">
          Delivery times are carrier estimates, not guarantees. Custom pieces ship when they are
          finished, on the timing in your quote. Any different charge shown in secure checkout takes
          precedence for that order.
        </p>
      </Container>
    </MarketingShell>
  )
}

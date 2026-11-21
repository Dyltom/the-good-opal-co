import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd } from '@/components/seo'
import { SHIPPING_CONFIG } from '@/lib/constants/shipping'

export const metadata: Metadata = {
  title: 'Shipping & Delivery | The Good Opal Co',
  description:
    'Clear Australian and international delivery information for The Good Opal Co orders.',
  alternates: { canonical: '/shipping' },
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
      <Container className="py-10 sm:py-12 lg:py-16">
        <PageHeader
          title="Shipping, without surprises."
          description="See the current charge before payment. Every dispatched order includes tracking, and delivery estimates begin after dispatch."
        />

        <div className="mt-10 grid border border-rule bg-bg md:grid-cols-3">
          <div className="p-7 md:border-r md:border-rule">
            <h2 className="font-serif text-2xl font-medium text-ink">Tracked delivery</h2>
            <p className="mt-3 font-sans text-sm leading-6 text-ink-2">
              ${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD for orders below the free-shipping
              threshold.
            </p>
          </div>
          <div className="border-t border-rule p-7 md:border-r md:border-t-0">
            <h2 className="font-serif text-2xl font-medium text-ink">Free delivery</h2>
            <p className="mt-3 font-sans text-sm leading-6 text-ink-2">
              Orders of ${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more ship free.
            </p>
          </div>
          <div className="border-t border-rule p-7 md:border-t-0">
            <h2 className="font-serif text-2xl font-medium text-ink">Delivery estimate</h2>
            <p className="mt-3 font-sans text-sm leading-6 text-ink-2">
              The carrier estimate is shown at checkout and again with tracking after dispatch.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-12 border-t border-rule pt-12 lg:grid-cols-2 lg:gap-20">
          <section>
            <h2 className="font-serif text-3xl font-medium text-ink">What happens next</h2>
            <ol className="mt-6 space-y-5 font-sans text-sm leading-7 text-ink-2">
              <li>
                <strong className="text-ink">1. Confirmation.</strong> You receive an order
                confirmation after payment.
              </li>
              <li>
                <strong className="text-ink">2. Preparation.</strong> In-stock pieces are
                checked and prepared for dispatch.
              </li>
              <li>
                <strong className="text-ink">3. Tracking.</strong> We send tracking details
                when the carrier accepts the parcel.
              </li>
            </ol>
          </section>
          <section>
            <h2 className="font-serif text-3xl font-medium text-ink">International orders</h2>
            <p className="mt-6 font-sans text-sm leading-7 text-ink-2">
              Supported destinations are charged ${SHIPPING_CONFIG.RATES.INTERNATIONAL.EXPRESS} AUD
              below the free-shipping threshold. Import duties, taxes, and local handling charges
              are not included in our price and remain the recipient’s responsibility.
            </p>
            <p className="mt-5 font-sans text-sm leading-7 text-ink-2">
              Need a piece by a particular date, or cannot select your country?{' '}
              <Link
                href="/contact?subject=shipping"
                className="font-semibold text-ink underline underline-offset-4"
              >
                Ask us before ordering.
              </Link>
            </p>
          </section>
        </div>

        <p className="mt-16 border-t border-rule pt-6 font-sans text-xs leading-5 text-ink-2">
          Carrier timeframes are estimates, not guarantees. Any different charge or timeframe shown
          in secure checkout takes precedence for that order.
        </p>
      </Container>
    </MarketingShell>
  )
}

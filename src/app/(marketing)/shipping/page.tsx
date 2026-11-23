import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd } from '@/components/seo'
import { DELIVERY_ESTIMATE, SHIPPING_CONFIG } from '@/lib/constants/shipping'

export const metadata: Metadata = {
  title: 'Shipping & Delivery | The Good Opal Co',
  description: `Tracked delivery from Cowra NSW: $${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD within Australia, $${SHIPPING_CONFIG.RATES.INTERNATIONAL.EXPRESS} AUD to supported countries, free over $${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD. Dispatch and delivery times for every order.`,
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
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title="Shipping, without surprises."
          description="See the current charge before payment. Every dispatched order includes tracking, and delivery estimates begin after dispatch."
        />

        <div className="mt-8 grid border-t border-rule md:grid-cols-3 md:border-b">
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Tracked delivery</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              ${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD for orders below the free-shipping
              threshold.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Free delivery</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Orders of ${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more ship free.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Delivery estimate</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">{DELIVERY_ESTIMATE}</p>
          </div>
        </div>

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
              Supported destinations are charged ${SHIPPING_CONFIG.RATES.INTERNATIONAL.EXPRESS} AUD
              below the free-shipping threshold. Prices and shipping are charged in AUD and include
              Australian GST. Import duties, taxes, and local handling charges are not included in
              our price and remain the recipient’s responsibility.
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

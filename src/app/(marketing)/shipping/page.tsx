import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { SHIPPING_CONFIG } from '@/lib/constants/shipping'

export const metadata: Metadata = {
  title: 'Shipping & Delivery | The Good Opal Co',
  description: 'Clear Australian and international delivery information for The Good Opal Co orders.',
  alternates: { canonical: '/shipping' },
}

export default function ShippingPage() {
  return (
    <MarketingShell>
      <Container className="py-16 sm:py-20 lg:py-28">
          <PageHeader
            eyebrow="Order information"
            title="Shipping, without surprises."
            description="See the current charge before payment. Every dispatched order includes tracking, and delivery estimates begin after dispatch."
          />

          <div className="mt-14 grid border border-warm-grey/60 bg-white md:grid-cols-3">
            <div className="p-7 md:border-r md:border-warm-grey/60">
              <h2 className="font-serif text-2xl font-medium text-charcoal">Standard delivery</h2>
              <p className="mt-3 font-sans text-sm leading-6 text-charcoal/65">${SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS} AUD for orders below the free-shipping threshold.</p>
            </div>
            <div className="border-t border-warm-grey/60 p-7 md:border-r md:border-t-0">
              <h2 className="font-serif text-2xl font-medium text-charcoal">Free delivery</h2>
              <p className="mt-3 font-sans text-sm leading-6 text-charcoal/65">Orders of ${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD} AUD or more ship free.</p>
            </div>
            <div className="border-t border-warm-grey/60 p-7 md:border-t-0">
              <h2 className="font-serif text-2xl font-medium text-charcoal">Delivery estimate</h2>
              <p className="mt-3 font-sans text-sm leading-6 text-charcoal/65">Usually 3–7 business days after dispatch. Remote and international destinations can take longer.</p>
            </div>
          </div>

          <div className="mt-16 grid gap-12 border-t border-warm-grey/60 pt-12 lg:grid-cols-2 lg:gap-20">
            <section>
              <h2 className="font-serif text-3xl font-medium text-charcoal">What happens next</h2>
              <ol className="mt-6 space-y-5 font-sans text-sm leading-7 text-charcoal/70">
                <li><strong className="text-charcoal">1. Confirmation.</strong> You receive an order confirmation after payment.</li>
                <li><strong className="text-charcoal">2. Preparation.</strong> In-stock pieces are checked and prepared for dispatch.</li>
                <li><strong className="text-charcoal">3. Tracking.</strong> We send tracking details when the carrier accepts the parcel.</li>
              </ol>
            </section>
            <section>
              <h2 className="font-serif text-3xl font-medium text-charcoal">International orders</h2>
              <p className="mt-6 font-sans text-sm leading-7 text-charcoal/70">Available destinations appear during secure checkout. Import duties, taxes, and local handling charges are not included in our price and remain the recipient&apos;s responsibility.</p>
              <p className="mt-5 font-sans text-sm leading-7 text-charcoal/70">Need a piece by a particular date, or cannot select your country? <Link href="/contact?subject=shipping" className="font-semibold text-charcoal underline underline-offset-4">Ask us before ordering.</Link></p>
            </section>
          </div>

          <p className="mt-16 border-t border-warm-grey/60 pt-6 font-sans text-xs leading-5 text-charcoal/55">Carrier timeframes are estimates, not guarantees. Any different charge or timeframe shown in secure checkout takes precedence for that order.</p>
      </Container>
    </MarketingShell>
  )
}

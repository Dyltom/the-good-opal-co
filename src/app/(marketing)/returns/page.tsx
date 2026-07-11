import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Returns & Refunds | The Good Opal Co',
  description: 'Returns, change-of-mind, and faulty-item information for The Good Opal Co purchases.',
}

export default function ReturnsPage() {
  return (
    <MarketingShell>
      <Container className="py-16 sm:py-20 lg:py-28">
          <PageHeader
            eyebrow="Order information"
            title="A clear way to make things right."
            description="Contact us before sending anything back. We will confirm the correct return steps for your order."
          />

          <div className="mt-14 grid border border-warm-grey/60 bg-white md:grid-cols-2">
            <section className="p-7 sm:p-9 md:border-r md:border-warm-grey/60">
              <h2 className="font-serif text-3xl font-medium text-charcoal">Change of mind</h2>
              <p className="mt-4 font-sans text-sm leading-7 text-charcoal/70">Contact us within 30 days of delivery. Standard, unused pieces may be returned when they remain in their original condition and packaging. Return postage is paid by the customer.</p>
              <p className="mt-4 font-sans text-sm leading-7 text-charcoal/70">Custom, personalised, altered, worn, hygiene-sensitive, and final-sale pieces are not eligible for change-of-mind returns.</p>
            </section>
            <section className="border-t border-warm-grey/60 p-7 sm:p-9 md:border-t-0">
              <h2 className="font-serif text-3xl font-medium text-charcoal">A problem with your order</h2>
              <p className="mt-4 font-sans text-sm leading-7 text-charcoal/70">Tell us promptly if a piece arrives damaged, differs materially from its description, or develops a fault. Include your order number and clear photographs when possible so we can assess the right remedy.</p>
              <p className="mt-4 font-sans text-sm leading-7 text-charcoal/70">Your automatic rights under the Australian Consumer Law are not limited by this change-of-mind policy.</p>
            </section>
          </div>

          <div className="mt-16 grid gap-12 border-t border-warm-grey/60 pt-12 lg:grid-cols-2 lg:gap-20">
            <section>
              <h2 className="font-serif text-3xl font-medium text-charcoal">Start a return</h2>
              <ol className="mt-6 space-y-5 font-sans text-sm leading-7 text-charcoal/70">
                <li><strong className="text-charcoal">1. Contact us.</strong> Send the order number, item name, and reason for the return.</li>
                <li><strong className="text-charcoal">2. Wait for instructions.</strong> Do not post the piece until we confirm the return details.</li>
                <li><strong className="text-charcoal">3. Pack securely.</strong> Use the original packaging where possible and retain tracking.</li>
                <li><strong className="text-charcoal">4. Assessment.</strong> We inspect the returned piece, then confirm the applicable refund, replacement, or repair.</li>
              </ol>
            </section>
            <section>
              <h2 className="font-serif text-3xl font-medium text-charcoal">Before you decide</h2>
              <p className="mt-6 font-sans text-sm leading-7 text-charcoal/70">Opal colour can change with lighting and screen settings. If colour, scale, or a fine detail matters to your decision, ask for another image or a virtual viewing before purchase.</p>
              <Link href="/contact?subject=return" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-charcoal px-6 font-sans text-sm font-semibold text-cream hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2">Contact us about an order</Link>
              <p className="mt-5 font-sans text-xs leading-5 text-charcoal/55">For general information about Australian consumer guarantees, visit the <a href="https://www.accc.gov.au/consumers/buying-products-and-services/consumer-rights-and-guarantees" target="_blank" rel="noreferrer" className="underline underline-offset-4">ACCC consumer rights guide</a>.</p>
            </section>
          </div>
      </Container>
    </MarketingShell>
  )
}

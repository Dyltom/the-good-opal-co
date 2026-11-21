import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { BreadcrumbJsonLd, JsonLd, merchantReturnPolicyStructuredData } from '@/components/seo'

export const metadata: Metadata = {
  title: 'Returns & Refunds | The Good Opal Co',
  description:
    'Returns, change-of-mind, and faulty-item information for The Good Opal Co purchases.',
  alternates: { canonical: '/returns' },
}

export default function ReturnsPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{ '@context': 'https://schema.org', ...merchantReturnPolicyStructuredData() }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Returns', url: '/returns' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title="A clear way to make things right."
          description="Contact us before sending anything back. We will confirm the correct return steps for your order."
        />

        <div className="mt-8 grid border-t border-rule md:grid-cols-2 md:border-b">
          <section className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Change of mind</h2>
            <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
              Contact us within 30 days of delivery. Standard, unused pieces may be returned when
              they remain in their original condition and packaging. Return postage is paid by the
              customer.
            </p>
            <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
              Custom, personalised, altered, worn, hygiene-sensitive, and final-sale pieces are not
              eligible for change-of-mind returns.
            </p>
          </section>
          <section className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">A problem with your order</h2>
            <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
              Tell us promptly if a piece arrives damaged, differs materially from its description,
              or develops a fault. Include your order number and clear photographs when possible so
              we can assess the right remedy.
            </p>
            <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
              Your automatic rights under the Australian Consumer Law are not limited by this
              change-of-mind policy.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-10 md:mt-[clamp(40px,4.5vw,64px)] md:grid-cols-2 md:gap-[clamp(24px,4vw,72px)]">
          <section>
            <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">Start a return</h2>
            <ol className="mt-4 max-w-[65ch] space-y-3 text-sm leading-6 text-ink-2">
              <li>
                <strong className="font-medium text-ink">1. Contact us.</strong> Send the order
                number, item name, and reason for the return.
              </li>
              <li>
                <strong className="font-medium text-ink">2. Wait for instructions.</strong> Do not
                post the piece until we confirm the return details.
              </li>
              <li>
                <strong className="font-medium text-ink">3. Pack securely.</strong> Use the original
                packaging where possible and retain tracking.
              </li>
              <li>
                <strong className="font-medium text-ink">4. Assessment.</strong> We inspect the
                returned piece, then confirm the applicable refund, replacement, or repair.
              </li>
            </ol>
          </section>
          <section>
            <h2 className="text-[1.75rem] leading-[1.1] md:text-[2rem]">Before you decide</h2>
            <p className="mt-4 max-w-[65ch] text-sm leading-6 text-ink-2">
              Opal colour can change with lighting and screen settings. If colour, scale, or a fine
              detail matters to your decision, ask for another image or a virtual viewing before
              purchase.
            </p>
            <Button asChild className="mt-5">
              <Link href="/contact?subject=return">Contact us about an order</Link>
            </Button>
            <p className="mt-4 max-w-[65ch] text-[13px] leading-5 text-ink-3">
              For general information about Australian consumer guarantees, visit the{' '}
              <a
                href="https://www.accc.gov.au/consumers/buying-products-and-services/consumer-rights-and-guarantees"
                target="_blank"
                rel="noreferrer"
                className="-my-3 inline-block py-3 text-ink-2 underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
              >
                ACCC consumer rights guide
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </MarketingShell>
  )
}

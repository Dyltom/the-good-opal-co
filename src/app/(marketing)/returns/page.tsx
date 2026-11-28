import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader, PolicyText } from '@/components/marketing'
import { formatDate, getPageContent } from '@/lib/site-content'
import { Button } from '@/components/ui/button'
import { BreadcrumbJsonLd, JsonLd, merchantReturnPolicyStructuredData } from '@/components/seo'
import { RETURN_WINDOW_DAYS } from '@/lib/constants/shipping'

export const metadata: Metadata = {
  title: 'Returns & Refunds | The Good Opal Co',
  description:
    'Returns, change-of-mind, and faulty-item information for The Good Opal Co purchases.',
  alternates: { canonical: '/returns' },
}

export const dynamic = 'force-dynamic'

const REFUND_DETAILS = [
  {
    term: 'Who qualifies',
    detail: [
      `Change of mind: an eligible piece, unused, undamaged and in its original condition and packaging, when you contact us within ${RETURN_WINDOW_DAYS} days of delivery. Custom work does not qualify.`,
      'Faulty, damaged or not as described: a repair, replacement or refund under the Australian Consumer Law, depending on the problem. This includes custom work.',
    ],
  },
  {
    term: 'How to start',
    detail: [
      'Contact us first with your order number, the piece and the reason. We confirm the return steps before you post anything.',
    ],
  },
  {
    term: 'Return postage',
    detail: [
      'Change of mind: you pay to send the piece back. Use a tracked service and keep the receipt.',
      'Faulty, damaged or incorrect items: we cover the return postage.',
    ],
  },
  {
    term: 'What is refunded',
    detail: [
      'Change of mind: the price you paid for the piece. The original shipping charge is not refunded.',
      'Faulty, damaged or incorrect items: the price of the piece and the original shipping charge.',
    ],
  },
  {
    term: 'How you are paid',
    detail: [
      'We refund to your original payment method through Stripe. Klarna purchases are refunded through Klarna, which updates your payment plan.',
    ],
  },
  {
    term: 'How long it takes',
    detail: [
      'We refund once the piece is back with us and checked. Stripe says a refund usually takes 5 to 10 business days to appear; your bank or card issuer controls the exact timing.',
    ],
  },
] as const

export default async function ReturnsPage() {
  const content = await getPageContent('returns')
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
          title={content.heading}
          description="Contact us before sending anything back. We will confirm the correct return steps for your order."
        />
        {content.lastUpdated.date ? (
          <p className="mt-3 text-[13px] text-ink-3">
            Last updated: {formatDate(content.lastUpdated)}
          </p>
        ) : null}

        {content.body ? (
          <PolicyText body={content.body} className="mt-8 max-w-[70ch] border-t border-rule pt-8" />
        ) : (
          <ReturnsText />
        )}
      </Container>
    </MarketingShell>
  )
}

function ReturnsText() {
  return (
    <>
      <div className="mt-8 grid border-t border-rule md:grid-cols-2 md:border-b">
        <section className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
          <h2 className="text-[1.375rem] leading-[1.15]">Change of mind</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
            Contact us within {RETURN_WINDOW_DAYS} days of delivery. Standard, unused pieces may be returned when
            they are undamaged and in their original condition and packaging. Return postage is paid by the
            customer.
          </p>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
            Custom work can&apos;t be returned for a change of mind. That covers commissions,
            custom rings, stones or parcels cut to order, and the deposit paid to start them.
            Personalised, altered, worn, hygiene-sensitive and final-sale pieces are excluded too.
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
            change-of-mind policy. They apply to custom work too.
          </p>
        </section>
      </div>

      <section id="refunds" aria-labelledby="refunds-heading" className="mt-10 md:mt-[clamp(40px,4.5vw,64px)]">
        <h2 id="refunds-heading" className="text-[1.75rem] leading-[1.1] md:text-[2rem]">
          Refunds
        </h2>
        <dl className="mt-4 border-t border-rule text-sm leading-6">
          {REFUND_DETAILS.map((row) => (
            <div
              key={row.term}
              className="grid gap-1 border-b border-rule py-3 md:grid-cols-[180px_minmax(0,65ch)] md:gap-6"
            >
              <dt className="font-medium text-ink">{row.term}</dt>
              <dd className="space-y-1.5 text-ink-2">
                {row.detail.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

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
    </>
  )
}

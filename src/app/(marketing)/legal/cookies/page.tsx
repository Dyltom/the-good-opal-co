import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CONTACT_INFO } from '@/lib/constants/contact'

export const metadata: Metadata = {
  title: 'Cookie Policy | The Good Opal Co',
  description: 'How The Good Opal Co uses essential storage and optional analytics.',
  alternates: { canonical: '/legal/cookies' },
}

const storageRows = [
  {
    name: 'cart',
    location: 'Cookie',
    duration: '7 days',
    purpose: 'Keeps product identifiers and quantities in your shopping cart.',
  },
  {
    name: 'cookie-consent',
    location: 'Local storage',
    duration: 'Until cleared',
    purpose: 'Records whether you allow optional analytics.',
  },
  {
    name: 'cookie-consent-date',
    location: 'Local storage',
    duration: 'Until cleared',
    purpose: 'Records when you saved your privacy choice.',
  },
] as const

export default function CookiePolicyPage() {
  return (
    <MarketingShell mainClassName="bg-white">
      <Container className="py-12 sm:py-16">
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]}
          className="mb-8"
        />

        <article className="mx-auto max-w-3xl">
          <p className="font-sans text-sm font-semibold text-opal-electric-accessible">
            Privacy choices
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-3 font-sans text-sm text-charcoal/60">Last updated 12 July 2026</p>

          <div className="mt-12 space-y-12 font-sans text-base leading-7 text-charcoal/80">
            <section aria-labelledby="policy-overview">
              <h2 id="policy-overview" className="font-serif text-2xl font-semibold text-charcoal">
                What this site stores
              </h2>
              <p className="mt-4">
                We use a small amount of browser storage to keep the shop working and remember your
                privacy choice. Optional analytics run only after you agree. We do not currently use
                advertising, remarketing, or social-media tracking pixels on this site.
              </p>
            </section>

            <section aria-labelledby="essential-storage">
              <h2
                id="essential-storage"
                className="font-serif text-2xl font-semibold text-charcoal"
              >
                Essential storage
              </h2>
              <p className="mt-4">
                The cart cookie is required to carry your selected products between pages and into
                checkout. It is HTTP-only, sent securely in production, and cannot be read by
                browser scripts. Your consent choice is stored in your browser so we do not ask on
                every visit.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Storage used by The Good Opal Co</caption>
                  <thead>
                    <tr className="border-b border-warm-grey text-charcoal">
                      <th scope="col" className="py-3 pr-5 font-semibold">
                        Name
                      </th>
                      <th scope="col" className="py-3 pr-5 font-semibold">
                        Location
                      </th>
                      <th scope="col" className="py-3 pr-5 font-semibold">
                        Duration
                      </th>
                      <th scope="col" className="py-3 font-semibold">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {storageRows.map((row) => (
                      <tr key={row.name} className="border-b border-warm-grey/70 align-top">
                        <th scope="row" className="py-4 pr-5 font-medium text-charcoal">
                          <code className="font-mono text-xs">{row.name}</code>
                        </th>
                        <td className="py-4 pr-5">{row.location}</td>
                        <td className="py-4 pr-5">{row.duration}</td>
                        <td className="min-w-64 py-4">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="optional-analytics">
              <h2
                id="optional-analytics"
                className="font-serif text-2xl font-semibold text-charcoal"
              >
                Optional analytics
              </h2>
              <p className="mt-4">
                If you select “Accept analytics”, Vercel Web Analytics may collect limited,
                aggregated information about visits and page use. This helps us understand which
                pages are useful and where the shopping experience needs improvement. Analytics do
                not load when you choose necessary storage only.
              </p>
            </section>

            <section aria-labelledby="checkout-providers">
              <h2
                id="checkout-providers"
                className="font-serif text-2xl font-semibold text-charcoal"
              >
                Checkout and third parties
              </h2>
              <p className="mt-4">
                Checkout is hosted by Stripe. When you continue to secure checkout, Stripe may use
                its own essential security and fraud-prevention cookies under its privacy policy.
                Those cookies are controlled by Stripe, not by our analytics choice.
              </p>
            </section>

            <section aria-labelledby="manage-choice">
              <h2 id="manage-choice" className="font-serif text-2xl font-semibold text-charcoal">
                Change your choice
              </h2>
              <p className="mt-4">
                Use “Cookie Settings” in the footer to review your choice. You can also clear this
                site&apos;s cookies and local storage in your browser. Blocking essential storage
                may prevent the cart from working.
              </p>
            </section>

            <section aria-labelledby="policy-contact">
              <h2 id="policy-contact" className="font-serif text-2xl font-semibold text-charcoal">
                Questions
              </h2>
              <p className="mt-4">
                Contact The Good Opal Co at{' '}
                <a
                  href={`mailto:${CONTACT_INFO.privacyEmail}`}
                  className="font-semibold text-opal-electric-accessible underline underline-offset-4"
                >
                  {CONTACT_INFO.privacyEmail}
                </a>
                . We may update this policy when our technology or legal obligations change.
              </p>
            </section>
          </div>
        </article>
      </Container>
    </MarketingShell>
  )
}

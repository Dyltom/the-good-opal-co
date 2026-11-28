import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell, PolicyText } from '@/components/marketing'
import { formatDate, getPageContent } from '@/lib/site-content'
import { CONTACT_INFO } from '@/lib/constants/contact'

export const metadata: Metadata = {
  title: 'Cookie Policy | The Good Opal Co',
  description:
    'How The Good Opal Co uses cookies and browser storage: the essentials that keep your bag and checkout working, and optional analytics you can accept or decline.',
  alternates: { canonical: '/legal/cookies' },
}

export const dynamic = 'force-dynamic'

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
  {
    name: '_ga, _ga_*',
    location: 'Cookie',
    duration: '2 years',
    purpose:
      'Set by Google Analytics only after you accept analytics, to recognise your browser across visits.',
  },
  {
    name: 'checkout-feedback-asked',
    location: 'Session storage',
    duration: 'Until you close the tab',
    purpose: 'Remembers that we already asked why you left checkout, so we ask only once.',
  },
] as const

export default async function CookiePolicyPage() {
  const content = await getPageContent('cookies')
  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <article className="max-w-[70ch]">
          <h1 className="text-[2.375rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4.2vw,3.75rem)]">
            {content.heading}
          </h1>
          <p className="mt-3 text-[13px] text-ink-3">
            Last updated {formatDate(content.lastUpdated)}
          </p>

          {content.body ? (
            <PolicyText body={content.body} className="mt-8 border-t border-rule pt-8" />
          ) : (
            <CookiesText />
          )}
        </article>
      </Container>
    </MarketingShell>
  )
}

function CookiesText() {
  return (
    <div className="mt-8 space-y-9 border-t border-rule pt-8 text-[15px] leading-7 text-ink">
      <section aria-labelledby="policy-overview">
        <h2 id="policy-overview" className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
          What this site stores
        </h2>
        <p className="mt-3">
          We use a small amount of browser storage to keep the shop working and remember your
          privacy choice. Analytics cookies are set only after you agree. We do not use
          remarketing, personalised advertising, or social-media tracking pixels on this site.
          We do measure which of our Google ads lead to purchases, as described below, and we
          count visits on our own server without any cookies.
        </p>
      </section>

      <section aria-labelledby="essential-storage">
        <h2 id="essential-storage" className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
          Essential storage
        </h2>
        <p className="mt-3">
          The cart cookie is required to carry your selected products between pages and into
          checkout. It is HTTP-only, sent securely in production, and cannot be read by
          browser scripts. Your consent choice is stored in your browser so we do not ask on
          every visit.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Storage used by The Good Opal Co</caption>
            <thead>
              <tr className="border-b border-rule-2 text-[13px] text-ink-3">
                <th scope="col" className="py-3 pr-5 font-medium">
                  Name
                </th>
                <th scope="col" className="py-3 pr-5 font-medium">
                  Location
                </th>
                <th scope="col" className="py-3 pr-5 font-medium">
                  Duration
                </th>
                <th scope="col" className="py-3 font-medium">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody>
              {storageRows.map((row) => (
                <tr key={row.name} className="border-b border-rule align-top">
                  <th scope="row" className="py-4 pr-5 font-medium text-ink">
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
          className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]"
        >
          Optional analytics
        </h2>
        <p className="mt-3">
          Google Analytics loads on every page. Until you select “Accept analytics” it sets no
          cookies and sends Google only cookieless signals, such as that a page was viewed or
          an order was placed, which Google uses to estimate visits and how many of our Google
          ads lead to a purchase. If you accept, it also sets the _ga cookies listed above so
          visits from the same browser can be connected. We use it to see which pages are
          useful and which of our Google ads lead to purchases, never for remarketing or
          personalised ads. Microsoft Clarity loads only after you accept. It records how pages are used, such as clicks, scrolling and mouse
          movement, so we can replay visits and see where the shop is confusing. It may set
          its own cookies, such as _clck and _clsk, and Microsoft handles that data under its
          own privacy statement. This helps us understand which pages are useful and where the
          shopping experience needs improvement.
        </p>
      </section>

      <section aria-labelledby="cookieless-measurement">
        <h2
          id="cookieless-measurement"
          className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]"
        >
          Cookieless measurement
        </h2>
        <p className="mt-3">
          Separately from optional analytics, the site sends a short note to our own server
          when you view pages and pieces, use the cart, search, filter, start checkout, answer
          our short question about checkout or hit an error. It also notes how long you
          actively spend on a page, how far you scroll, how quickly the page loads and when
          the same spot is clicked several times in a row, described by what was clicked and
          never by what you typed. This stores nothing in your browser. Your IP address and
          browser details are turned into a one-way code with a random value that changes
          every day, and are never stored themselves, so we can count visits without
          recognising you from one day to the next. Records are deleted after 400 days. Read
          more in section 6.1 of our{' '}
          <Link href="/legal/privacy" className="text-accent underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="checkout-providers">
        <h2
          id="checkout-providers"
          className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]"
        >
          Checkout and third parties
        </h2>
        <p className="mt-3">
          Checkout is hosted by Stripe. When you continue to secure checkout, Stripe may use
          its own essential security and fraud-prevention cookies under its privacy policy.
          Those cookies are controlled by Stripe, not by our analytics choice.
        </p>
      </section>

      <section aria-labelledby="manage-choice">
        <h2 id="manage-choice" className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
          Change your choice
        </h2>
        <p className="mt-3">
          Use “Cookie settings” in the footer to review your choice. You can also clear this
          site&apos;s cookies and local storage in your browser. Blocking essential storage
          may prevent the cart from working.
        </p>
      </section>

      <section aria-labelledby="policy-contact">
        <h2 id="policy-contact" className="text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
          Questions
        </h2>
        <p className="mt-3">
          Contact The Good Opal Co at{' '}
          <a
            href={`mailto:${CONTACT_INFO.privacyEmail}`}
            className="text-accent underline underline-offset-4"
          >
            {CONTACT_INFO.privacyEmail}
          </a>
          . We may update this policy when our technology or legal obligations change.
        </p>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { CONTACT_INFO } from '@/lib/constants/contact'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Good Opal Co',
  description:
    'Learn how The Good Opal Co collects, uses, and protects your personal information when you shop for Australian opals.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[70ch]">
          <h1 className="text-[2.375rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4.2vw,3.75rem)]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[13px] text-ink-3">Last updated: 21 November 2026</p>

          <div className="prose mt-8 max-w-none border-t border-rule pt-8 text-[15px] leading-7 prose-headings:font-normal prose-headings:text-ink prose-p:text-ink prose-a:text-accent prose-a:underline-offset-4 prose-strong:font-medium prose-strong:text-ink prose-li:text-ink">
            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                1. Introduction
              </h2>
              <p className="mb-4">
                The Good Opal Co (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed
                to protecting your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website or make a
                purchase from us.
              </p>
              <p className="mb-4">
                We handle personal information under applicable privacy laws. The rights and
                obligations that apply can depend on your location and our legal obligations.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                2. Information We Collect
              </h2>
              <h3 className="mb-2 mt-5 text-[1.25rem] leading-tight">2.1 Personal Information</h3>
              <p className="mb-4">
                When you make a purchase or attempt to make a purchase, we collect:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>Name and contact information (email address, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Order history and messages you send us</li>
              </ul>

              <h3 className="mb-2 mt-5 text-[1.25rem] leading-tight">
                2.2 Automatically Collected Information
              </h3>
              <p className="mb-4">
                Our site and service providers may process limited technical information needed to
                operate and secure the service:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>Essential cart and privacy-choice data stored in your browser</li>
                <li>
                  Request logs that may include IP address, browser information, requested page, and
                  timestamps
                </li>
                <li>Optional website usage analytics only after you consent to analytics</li>
                <li>
                  Cookieless, anonymous measurement of how the site is used, described in section 6
                </li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Operate, secure, diagnose, and improve our website and shopping experience</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                4. Information Sharing
              </h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information. We share your information
                only with:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>
                  <strong>Service Providers:</strong> Including Stripe for payment processing,
                  shipping companies for order delivery, and email service providers
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with any merger, sale of
                  assets, or acquisition
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly agree to sharing
                </li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                5. Data Security
              </h2>
              <p className="mb-4">
                We use practical technical and organisational measures intended to protect personal
                information, including:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>HTTPS/TLS for data transmitted between your browser and the site</li>
                <li>Secure payment processing through Stripe</li>
                <li>Restricted administrative access to order and customer records</li>
                <li>Managed hosting, database, storage, and email providers</li>
              </ul>
              <p className="mb-4">
                No transmission or storage method is completely secure. Please contact us promptly
                if you suspect information connected with an order has been misused.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                6. Cookies and Tracking
              </h2>
              <p className="mb-4">We use only the browser storage described below:</p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>An essential HTTP-only cart cookie so the server can retain your basket</li>
                <li>Local storage recording your necessary and analytics consent choice</li>
                <li>
                  Session storage noting that we already asked why you left checkout, so we ask only
                  once per visit
                </li>
                <li>
                  Google Analytics and Microsoft Clarity after you choose to allow analytics.
                  Clarity records clicks, scrolling and mouse movement to replay visits and may set
                  its own cookies
                </li>
              </ul>
              <p className="mb-4">
                We do not currently use advertising, remarketing, or social-media tracking pixels.
                You can change optional analytics through Cookie Settings. Blocking essential
                storage may prevent the cart and privacy controls from working.
              </p>
              <h3 className="mb-2 mt-5 text-[1.25rem] leading-tight">
                6.1 Cookieless site measurement
              </h3>
              <p className="mb-4">
                We also measure how the shop is used, on our own systems and without cookies or
                browser storage. When you view a page or a piece, open or zoom a photo, add or
                remove a piece from your cart, search, use the store filters, start checkout, send
                an enquiry, join the newsletter, or run into an error, your browser sends a short
                note of that action to our server. When you leave a page it also sends how long you
                were active on it, how far you scrolled and, on a piece page, whether you reached
                the photos, price and details. It reports how quickly pages load and when the same
                spot is clicked several times in a row, with a short description of what was clicked
                but never what you typed.
              </p>
              <p className="mb-4">
                Each note records the page and action, the piece involved, the website or campaign
                link that brought you here, your country as supplied by our hosting network, your
                device type and your browser family. We do not store your IP address or your full
                browser details. They are combined with a random value that is replaced every day
                and turned into a one-way code, so we can count visits on a single day but cannot
                recognise you on a later day or work out who you are.
              </p>
              <p className="mb-4">
                When a Stripe checkout is paid or expires unpaid, we record its value and items
                against the same code. If a checkout expires unpaid and you had already typed your
                email address into Stripe, that address is kept with the record so we can follow up
                on the order. If you answer our short question about why you left checkout, we keep
                the reason you choose and any note you type. Errors on our server are recorded with
                the page and a shortened error message, with email addresses and keys removed. We
                use this measurement only to improve the shop and do not share it with advertisers.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                7. Your Rights
              </h2>
              <p className="mb-4">
                Depending on the law that applies to you, you may have rights to:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                8. International Data Transfers
              </h2>
              <p className="mb-4">
                Stripe, OVHcloud, Google, Microsoft, Resend, and other service providers may process
                information outside Australia. Processing locations depend on each provider&apos;s
                infrastructure and may change. We assess the providers we use and handle overseas
                disclosures as required by applicable privacy law, but we do not claim that every
                overseas jurisdiction provides protections identical to Australia.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                9. Children&apos;s Privacy
              </h2>
              <p className="mb-4">
                Our website is not intended for children under 16 years of age. We do not knowingly
                collect personal information from children under 16.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                10. Marketing Communications
              </h2>
              <p className="mb-4">
                With your consent, we may send you marketing emails about new products, special
                offers, and other updates. You can unsubscribe at any time by:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>Clicking the unsubscribe link in any marketing email</li>
                <li>Contacting us through the website contact form</li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                11. Data Retention
              </h2>
              <p className="mb-4">
                We retain personal information only as long as reasonably needed for orders,
                support, fraud prevention, disputes, and legal, tax, or accounting obligations.
                Different records can have different required retention periods.
              </p>
              <p className="mb-4">
                Site measurement records described in section 6.1 are deleted automatically after
                400 days.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                12. Third-Party Services
              </h2>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for
                the privacy practices of these sites. Key third-party services include:
              </p>
              <ul className="mb-4 list-disc space-y-1.5 pl-6">
                <li>
                  <strong>Stripe:</strong> Hosted checkout and payment processing
                </li>
                <li>
                  <strong>OVHcloud:</strong> Website hosting
                </li>
                <li>
                  <strong>Google Analytics:</strong> Site analytics, only after you allow analytics
                </li>
                <li>
                  <strong>Microsoft Clarity:</strong> Visit replays and heatmaps, only after you
                  allow analytics
                </li>
                <li>
                  <strong>Resend:</strong> Email communications
                </li>
              </ul>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                13. Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the &quot;Last
                updated&quot; date.
              </p>
            </section>

            <section className="mb-9">
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                14. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or your personal information, please
                contact us:
              </p>
              <div className="bg-plinth px-5 py-4">
                <p className="mb-2 font-medium text-ink">The Good Opal Co</p>
                <p>
                  Email:{' '}
                  <a
                    className="underline underline-offset-4"
                    href={`mailto:${CONTACT_INFO.privacyEmail}`}
                  >
                    {CONTACT_INFO.privacyEmail}
                  </a>
                </p>
                <p>Location: {CONTACT_INFO.address}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 mt-0 text-[1.5rem] leading-[1.15] md:text-[1.75rem]">
                15. Australian Privacy Commissioner
              </h2>
              <p>
                If you&apos;re not satisfied with our response to your privacy concern, you may
                contact the Office of the Australian Information Commissioner:
              </p>
              <div className="mt-4 bg-plinth px-5 py-4">
                <p>
                  <a
                    href="https://www.oaic.gov.au"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    Visit the OAIC website
                  </a>{' '}
                  for current contact details.
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}

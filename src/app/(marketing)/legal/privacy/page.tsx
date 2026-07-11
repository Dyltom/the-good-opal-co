import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MarketingShell } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Good Opal Co',
  description: 'Learn how The Good Opal Co collects, uses, and protects your personal information when you shop for Australian opals.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date('2026-07-11').toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <MarketingShell mainClassName="bg-white">
      <Container className="py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy' },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-charcoal mb-4">
            Privacy Policy
          </h1>
          <p className="text-content-muted mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                1. Introduction
              </h2>
              <p className="text-content mb-4">
                The Good Opal Co (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
              </p>
              <p className="text-content mb-4">
                We handle personal information under applicable privacy laws. The rights and obligations that apply can depend on your location and our legal obligations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-content mb-4">
                When you make a purchase or attempt to make a purchase, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Order history and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-content mb-4">
                When you visit our site, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Cookies and usage data</li>
                <li>Shopping behavior and preferences</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-content mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and shopping experience</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                4. Information Sharing
              </h2>
              <p className="text-content mb-4">
                We do not sell, trade, or rent your personal information. We share your information only with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> Including Stripe for payment processing, shipping companies for order delivery, and email service providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                5. Data Security
              </h2>
              <p className="text-content mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through Stripe</li>
                <li>Regular security assessments</li>
                <li>Limited access to personal information</li>
                <li>Secure data storage with encryption at rest</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                6. Cookies and Tracking
              </h2>
              <p className="text-content mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Maintain your shopping cart</li>
                <li>Remember your preferences</li>
                <li>Analyze website traffic and usage</li>
                <li>Personalize your experience</li>
              </ul>
              <p className="text-content mb-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                7. Your Rights
              </h2>
              <p className="text-content mb-4">
                Depending on the law that applies to you, you may have rights to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-content mb-4">
                Your information may be transferred to and processed in countries other than Australia. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-content mb-4">
                Our website is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                10. Marketing Communications
              </h2>
              <p className="text-content mb-4">
                With your consent, we may send you marketing emails about new products, special offers, and other updates. You can unsubscribe at any time by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Clicking the unsubscribe link in any marketing email</li>
                <li>Contacting us through the website contact form</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                11. Data Retention
              </h2>
              <p className="text-content mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Order information is typically retained for 7 years for tax purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                12. Third-Party Services
              </h2>
              <p className="text-content mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. Key third-party services include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                <li><strong>Vercel:</strong> Website hosting and analytics</li>
                <li><strong>Resend:</strong> Email communications</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                13. Changes to This Policy
              </h2>
              <p className="text-content mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                14. Contact Us
              </h2>
              <p className="text-content mb-4">
                If you have questions about this Privacy Policy or your personal information, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-charcoal mb-2">The Good Opal Co</p>
                <p className="text-content">Use the website contact form and select the privacy topic.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                15. Australian Privacy Commissioner
              </h2>
              <p className="text-content">
                If you&apos;re not satisfied with our response to your privacy concern, you may contact the Office of the Australian Information Commissioner:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="text-content"><a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer" className="underline underline-offset-4">Visit the OAIC website</a> for current contact details.</p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}

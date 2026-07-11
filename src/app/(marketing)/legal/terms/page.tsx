import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MarketingShell } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Terms of Service | The Good Opal Co',
  description: 'Terms and conditions for purchasing Australian opals and jewelry from The Good Opal Co.',
  alternates: { canonical: '/legal/terms' },
}

export default function TermsOfServicePage() {
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
            { label: 'Terms of Service' },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-charcoal mb-4">
            Terms of Service
          </h1>
          <p className="text-content-muted mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-content mb-4">
                By accessing or using The Good Opal Co website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
              <p className="text-content mb-4">
                These terms apply to all users of the site, including browsers, customers, merchants, and contributors of content.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                2. Use of Our Service
              </h2>
              <p className="text-content mb-4">
                You may not use our products for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
              </p>
              <p className="text-content mb-4">
                You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                3. Products and Pricing
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                3.1 Product Information
              </h3>
              <p className="text-content mb-4">
                We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor&apos;s display of any color will be accurate.
              </p>
              <p className="text-content mb-4">
                We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                3.2 Pricing
              </h3>
              <p className="text-content mb-4">
                All prices are listed in Australian Dollars (AUD) and are inclusive of GST where applicable. We reserve the right to change prices at any time without notice.
              </p>
              <p className="text-content mb-4">
                In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                4. Orders and Payment
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                4.1 Order Acceptance
              </h3>
              <p className="text-content mb-4">
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                4.2 Payment Processing
              </h3>
              <p className="text-content mb-4">
                All payments are processed securely through Stripe. We do not store or have access to your credit card information. By providing your payment information, you agree to be charged for your purchase.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                4.3 Order Confirmation
              </h3>
              <p className="text-content mb-4">
                You will receive an order confirmation email once your order has been placed. This confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                5. Shipping and Delivery
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                5.1 Shipping Methods
              </h3>
              <p className="text-content mb-4">
                Shipping availability and the applicable charge are shown before payment. Dispatched orders include tracking where the selected service supports it.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Orders of $500 AUD or more qualify for free shipping</li>
                <li>Orders below that threshold incur the charge shown at checkout</li>
                <li>Available international destinations are shown at checkout</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                5.2 Delivery Times
              </h3>
              <p className="text-content mb-4">
                Delivery timing begins after dispatch and varies by destination, carrier, and customs. Any timing we provide is an estimate rather than a guaranteed arrival date.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                5.3 Risk of Loss
              </h3>
              <p className="text-content mb-4">
                Risk, title, and responsibility for a delayed, lost, or damaged shipment are handled under applicable law. Contact us promptly if tracking shows a problem so we can investigate with the carrier.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                6. Returns and Refunds
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.1 Return Policy
              </h3>
              <p className="text-content mb-4">
                We offer a 30-day change-of-mind return policy for standard, unused pieces in their original condition and packaging. Custom or personalised items are excluded from change-of-mind returns. These exclusions do not limit rights that cannot be excluded under the Australian Consumer Law.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.2 Return Process
              </h3>
              <p className="text-content mb-4">
                To initiate a return, use our contact form with your order number and reason for return. We will provide the correct return instructions before you send the item.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.3 Refunds
              </h3>
              <p className="text-content mb-4">
                Once your return is received and inspected, we will confirm the outcome. Any approved refund is sent to the original payment method; your bank or card issuer controls the time taken to display it.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.4 Exchanges
              </h3>
              <p className="text-content mb-4">
                One-of-a-kind pieces may not have an identical replacement. Contact us so we can assess the appropriate remedy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                7. Product Authenticity
              </h2>
              <p className="text-content mb-4">
                Product pages describe the stone and disclose origin, treatments, or certificate details where that information is available.
              </p>
              <p className="text-content mb-4">
                We aim to describe products accurately and disclose known treatments or enhancements in the product listing.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-content mb-4">
                All content on this website, including text, graphics, logos, images, audio clips, digital downloads, and software, is the property of The Good Opal Co or its content suppliers and is protected by Australian and international copyright laws.
              </p>
              <p className="text-content mb-4">
                You may not use, reproduce, or distribute any content from our website without our express written permission.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                9. Guest Checkout and Order Access
              </h2>
              <p className="text-content mb-4">
                We currently offer guest checkout rather than customer password accounts. You must provide accurate, complete, and current checkout information so we can process and deliver your order.
              </p>
              <p className="text-content mb-4">
                Order tracking uses your order number and the email address supplied at checkout. Keep those details private and contact us if you believe they have been used without permission.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                10. Prohibited Uses
              </h2>
              <p className="text-content mb-4">
                You are prohibited from using the site or its content:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                11. Disclaimers and Limitations of Liability
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                11.1 Disclaimers
              </h3>
              <p className="text-content mb-4">
                Website information is provided in good faith and may contain errors or become outdated. To the extent permitted by law, we do not guarantee uninterrupted access to the website or that every general educational statement will suit a particular purpose.
              </p>
              <p className="text-content mb-4">
                Nothing in these Terms excludes, restricts, or modifies a consumer guarantee, remedy, or other right that cannot lawfully be excluded, including rights under the Australian Consumer Law.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                11.2 Limitation of Liability
              </h3>
              <p className="text-content mb-4">
                In no event shall The Good Opal Co, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
              <p className="text-content mb-4">
                Any limitation of liability applies only to the maximum extent permitted by law and does not limit non-excludable consumer remedies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                12. Indemnification
              </h2>
              <p className="text-content mb-4">
                You agree to defend, indemnify, and hold harmless The Good Opal Co and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees, from any claim or demand made by any third party due to or arising out of your breach of these Terms or your violation of any law or the rights of a third party.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                13. Governing Law and Jurisdiction
              </h2>
              <p className="text-content mb-4">
                These Terms are governed by the laws of New South Wales, Australia, subject to any mandatory law that applies where you live.
              </p>
              <p className="text-content mb-4">
                We encourage you to contact us first so we can try to resolve a concern in good faith. This does not prevent either party from using a court, tribunal, regulator, or dispute process available under applicable law.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-content mb-4">
                We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service. It is your responsibility to check our website periodically for changes.
              </p>
              <p className="text-content mb-4">
                Your continued use of or access to our website or the Service following the posting of any changes constitutes acceptance of those changes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                15. Severability
              </h2>
              <p className="text-content mb-4">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                16. Contact Information
              </h2>
              <p className="text-content mb-4">
                Questions about the Terms of Service should be sent to us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-charcoal mb-2">The Good Opal Co</p>
                <p className="text-content">Use the contact form and select the topic that best matches your question.</p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}

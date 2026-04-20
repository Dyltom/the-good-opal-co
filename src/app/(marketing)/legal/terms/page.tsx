import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Terms of Service | The Good Opal Co',
  description: 'Terms and conditions for purchasing Australian opals and jewelry from The Good Opal Co.',
}

export default function TermsOfServicePage() {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white">
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
                We offer standard and express shipping options within Australia and internationally. Shipping costs are calculated at checkout based on your location and selected shipping method.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Free standard shipping on orders over $500 AUD within Australia</li>
                <li>Express shipping available for an additional fee</li>
                <li>International shipping rates vary by destination</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                5.2 Delivery Times
              </h3>
              <p className="text-content mb-4">
                Estimated delivery times are provided at checkout and in your order confirmation email. These are estimates only and we are not liable for delays caused by shipping carriers or customs.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                5.3 Risk of Loss
              </h3>
              <p className="text-content mb-4">
                All items purchased from The Good Opal Co are made pursuant to a shipment contract. Risk of loss and title for items pass to you upon delivery to the carrier.
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
                We offer a 30-day return policy for unopened and unused items in their original packaging. Custom or personalized items cannot be returned unless defective.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.2 Return Process
              </h3>
              <p className="text-content mb-4">
                To initiate a return, please contact us at returns@thegoodpalco.com with your order number and reason for return. We will provide you with return instructions and a return authorization number.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.3 Refunds
              </h3>
              <p className="text-content mb-4">
                Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within 10 business days.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.4 Exchanges
              </h3>
              <p className="text-content mb-4">
                We only replace items if they are defective or damaged. If you need to exchange an item for the same product, contact us at returns@thegoodpalco.com.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                7. Product Authenticity
              </h2>
              <p className="text-content mb-4">
                All opals and gemstones sold by The Good Opal Co are genuine and natural unless specifically described as synthetic or treated. We provide certificates of authenticity for high-value items upon request.
              </p>
              <p className="text-content mb-4">
                We guarantee that all products are as described. Any treatments or enhancements will be fully disclosed in the product description.
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
                9. User Accounts
              </h2>
              <p className="text-content mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-content mb-4">
                You agree to notify us immediately of any unauthorized access to or use of your account.
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
                The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, The Good Opal Co:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                11.2 Limitation of Liability
              </h3>
              <p className="text-content mb-4">
                In no event shall The Good Opal Co, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
              <p className="text-content mb-4">
                Our liability is limited to the maximum extent permitted by law. In any case, our total liability to you for all damages shall not exceed the amount paid by you for products purchased from us.
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
                These Terms shall be governed by and construed in accordance with the laws of New South Wales, Australia. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
              <p className="text-content mb-4">
                Any disputes arising out of or relating to these Terms of Service shall first be resolved through good faith negotiations. If negotiations fail, disputes shall be resolved through binding arbitration in Sydney, Australia.
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
                <p className="text-content">Email: legal@thegoodpalco.com</p>
                <p className="text-content">Phone: +61 2 XXXX XXXX</p>
                <p className="text-content">Address: Sydney, NSW, Australia</p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}
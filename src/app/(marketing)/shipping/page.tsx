import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Truck, Package, Globe, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping & Delivery | The Good Opal Co',
  description: 'Free shipping on orders over $500. Learn about our shipping methods and delivery times for Australian opal jewelry.',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shipping & Delivery' },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-charcoal mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-lg text-content-muted mb-12">
            We ship Australian opals worldwide with secure, insured delivery options.
          </p>

          {/* Free Shipping Banner */}
          <div className="bg-gradient-to-r from-opal-electric to-fire-pink p-8 rounded-2xl mb-12 text-white">
            <div className="flex items-center justify-center gap-4">
              <Truck className="w-8 h-8" />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Free Australian Shipping</h2>
                <p className="text-lg">On all orders over $500 AUD</p>
              </div>
            </div>
          </div>

          {/* Shipping Options Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-opal-electric/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-opal-electric" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Standard Shipping</h3>
                  <p className="text-sm text-content mb-3">
                    5-7 business days within Australia
                  </p>
                  <p className="text-sm font-medium text-charcoal">
                    $15 flat rate (Free over $500)
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-fire-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-fire-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Express Shipping</h3>
                  <p className="text-sm text-content mb-3">
                    1-3 business days within Australia
                  </p>
                  <p className="text-sm font-medium text-charcoal">
                    $25 flat rate
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-opal-emerald/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-opal-emerald" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">International Standard</h3>
                  <p className="text-sm text-content mb-3">
                    7-14 business days worldwide
                  </p>
                  <p className="text-sm font-medium text-charcoal">
                    From $35 (calculated at checkout)
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-fire-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-fire-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">International Express</h3>
                  <p className="text-sm text-content mb-3">
                    3-5 business days worldwide
                  </p>
                  <p className="text-sm font-medium text-charcoal">
                    From $65 (calculated at checkout)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Australian Shipping
              </h2>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Delivery Times
              </h3>
              <p className="text-content mb-4">
                Estimated delivery times for Australian destinations:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Destination</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Standard</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Express</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm">Sydney Metro</td>
                      <td className="px-4 py-3 text-sm">2-3 business days</td>
                      <td className="px-4 py-3 text-sm">Next business day</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Melbourne, Brisbane</td>
                      <td className="px-4 py-3 text-sm">3-4 business days</td>
                      <td className="px-4 py-3 text-sm">1-2 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Perth, Adelaide</td>
                      <td className="px-4 py-3 text-sm">4-5 business days</td>
                      <td className="px-4 py-3 text-sm">2-3 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Regional Areas</td>
                      <td className="px-4 py-3 text-sm">5-7 business days</td>
                      <td className="px-4 py-3 text-sm">3-4 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Remote Areas</td>
                      <td className="px-4 py-3 text-sm">7-10 business days</td>
                      <td className="px-4 py-3 text-sm">4-5 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Shipping Partners
              </h3>
              <p className="text-content mb-4">
                We partner with Australia Post and trusted courier services to ensure safe delivery of your precious opals. All packages are:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Fully insured for their value</li>
                <li>Tracked from dispatch to delivery</li>
                <li>Require signature on delivery</li>
                <li>Packaged in discreet, secure packaging</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                International Shipping
              </h2>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Destinations
              </h3>
              <p className="text-content mb-4">
                We ship to over 50 countries worldwide. Popular destinations include:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-content">United States</li>
                  <li className="text-content">Canada</li>
                  <li className="text-content">United Kingdom</li>
                  <li className="text-content">Germany</li>
                </ul>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-content">France</li>
                  <li className="text-content">Japan</li>
                  <li className="text-content">Singapore</li>
                  <li className="text-content">Hong Kong</li>
                </ul>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-content">New Zealand</li>
                  <li className="text-content">Switzerland</li>
                  <li className="text-content">Netherlands</li>
                  <li className="text-content">Sweden</li>
                </ul>
              </div>
              <p className="text-content mb-6">
                Don't see your country? Contact us at <a href="mailto:shipping@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">shipping@thegoodpalco.com</a> for shipping options.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Customs and Import Duties
              </h3>
              <p className="text-content mb-4">
                International orders may be subject to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Import duties and taxes</li>
                <li>Customs processing fees</li>
                <li>VAT or GST in destination country</li>
              </ul>
              <p className="text-content mb-6">
                These charges are determined by your local customs office and are the responsibility of the recipient. We declare the full value of items for insurance purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Processing Times
              </h2>
              <p className="text-content mb-4">
                Orders are typically processed within:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>In-stock items:</strong> 1-2 business days</li>
                <li><strong>Custom orders:</strong> 5-7 business days</li>
                <li><strong>Engraved items:</strong> 3-4 business days</li>
              </ul>
              <p className="text-content mb-4">
                Processing times may be extended during peak periods (Christmas, Valentine's Day, Mother's Day). You'll receive a confirmation email once your order ships.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Tracking Your Order
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">How to track your package:</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li className="text-content">Check your email for shipping confirmation</li>
                  <li className="text-content">Click the tracking link in the email</li>
                  <li className="text-content">Enter your tracking number on the carrier's website</li>
                  <li className="text-content">Sign up for delivery notifications</li>
                </ol>
              </div>
              <p className="text-content mb-4">
                If you haven't received tracking information within 3 business days of ordering, please check your spam folder or contact us.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Delivery Security
              </h2>
              <p className="text-content mb-4">
                For your security and peace of mind:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Signature Required:</strong> All orders require signature on delivery</li>
                <li><strong>Discreet Packaging:</strong> No external branding or value indicators</li>
                <li><strong>Full Insurance:</strong> Every package is insured for its full value</li>
                <li><strong>Secure Facilities:</strong> Items stored in monitored, secure facilities</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Delivery Attempts
              </h3>
              <p className="text-content mb-4">
                If you're not home during delivery:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>The carrier will leave a delivery notice</li>
                <li>Package will be held at local post office or depot</li>
                <li>You can arrange redelivery or collection</li>
                <li>Valid ID required for collection</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Shipping Restrictions
              </h2>
              <p className="text-content mb-4">
                We currently cannot ship to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>P.O. Boxes (for security reasons)</li>
                <li>Hotels or temporary addresses</li>
                <li>Countries with active shipping embargoes</li>
                <li>APO/FPO addresses (military bases)</li>
              </ul>
              <p className="text-content mb-4">
                For special delivery arrangements, please contact us before placing your order.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Lost or Damaged Packages
              </h2>
              <p className="text-content mb-4">
                In the rare event of loss or damage:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Contact us immediately at <a href="mailto:support@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">support@thegoodpalco.com</a></li>
                <li>We'll file a claim with the carrier</li>
                <li>Investigation typically takes 5-10 business days</li>
                <li>We'll send a replacement or full refund once resolved</li>
              </ol>
              <p className="text-content mb-6">
                All packages are fully insured, so you're protected against loss or damage.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Holiday Shipping
              </h2>
              <p className="text-content mb-4">
                During peak holiday seasons, we recommend ordering early:
              </p>
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">Christmas Delivery Cutoffs:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-content"><strong>Australian Standard:</strong> December 15</li>
                  <li className="text-content"><strong>Australian Express:</strong> December 20</li>
                  <li className="text-content"><strong>International Standard:</strong> December 5</li>
                  <li className="text-content"><strong>International Express:</strong> December 15</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Contact Us
              </h2>
              <p className="text-content mb-4">
                Questions about shipping? We're here to help:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Shipping Inquiries</h4>
                    <p className="text-content">Email: <a href="mailto:shipping@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">shipping@thegoodpalco.com</a></p>
                    <p className="text-content">Response time: Within 24 hours</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Order Tracking</h4>
                    <p className="text-content">Email: <a href="mailto:orders@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">orders@thegoodpalco.com</a></p>
                    <p className="text-content">Include your order number</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-opal-electric/5 p-6 rounded-xl text-center">
              <p className="text-sm text-content">
                Shipping rates and times are estimates and may vary based on location and carrier performance.
                This policy was last updated on January 15, 2024.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
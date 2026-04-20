import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Package, Shield, Clock, CreditCard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Refunds | The Good Opal Co',
  description: 'Learn about our 30-day return policy and refund process for Australian opal jewelry.',
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Returns & Refunds' },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-charcoal mb-4">
            Returns & Refunds
          </h1>
          <p className="text-lg text-content-muted mb-12">
            We want you to love your opal jewelry. If you&apos;re not completely satisfied, we&apos;re here to help.
          </p>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-opal-electric/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-opal-electric" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">30-Day Returns</h3>
                  <p className="text-sm text-content">
                    Return items within 30 days of delivery for a full refund
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-fire-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-fire-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Free Return Shipping</h3>
                  <p className="text-sm text-content">
                    We provide prepaid return labels for Australian orders
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-opal-emerald/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-opal-emerald" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Quality Guarantee</h3>
                  <p className="text-sm text-content">
                    All items covered by our authenticity guarantee
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-fire-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-fire-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Fast Refunds</h3>
                  <p className="text-sm text-content">
                    Refunds processed within 5-10 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Return Policy
              </h2>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Items Eligible for Return
              </h3>
              <p className="text-content mb-4">
                Most items can be returned within 30 days of delivery. To be eligible for a return, items must be:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Unused and in the same condition as received</li>
                <li>In the original packaging with all tags attached</li>
                <li>Accompanied by the receipt or proof of purchase</li>
                <li>Not custom-made or personalized items</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Non-Returnable Items
              </h3>
              <p className="text-content mb-4">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Custom or personalized jewelry</li>
                <li>Earrings (for hygiene reasons)</li>
                <li>Items marked as final sale</li>
                <li>Gift cards</li>
                <li>Items damaged due to misuse or neglect</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                How to Return an Item
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-opal-electric text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Initiate Your Return</h4>
                    <p className="text-content">
                      Email us at <a href="mailto:returns@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">returns@thegoodpalco.com</a> with your order number and reason for return. We&apos;ll respond within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-opal-electric text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Receive Return Authorization</h4>
                    <p className="text-content">
                      We&apos;ll email you a Return Authorization (RA) number and prepaid shipping label for Australian orders. International customers are responsible for return shipping.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-opal-electric text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Pack Your Return</h4>
                    <p className="text-content">
                      Carefully pack the item in its original packaging. Include the RA number and a copy of your receipt. We recommend using a tracked shipping service.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-opal-electric text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Ship Your Return</h4>
                    <p className="text-content">
                      Drop off your package at any Australia Post location or schedule a pickup. Keep your tracking number for reference.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Refund Process
              </h2>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Inspection and Processing
              </h3>
              <p className="text-content mb-4">
                Once we receive your return, we&apos;ll inspect it within 2-3 business days. You&apos;ll receive an email confirming:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Your return has been received</li>
                <li>The condition of the returned item</li>
                <li>Whether your refund has been approved</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Refund Timeline
              </h3>
              <p className="text-content mb-4">
                If approved, your refund will be processed automatically:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Bank Transfer:</strong> 7-10 business days</li>
              </ul>
              <p className="text-content mb-4">
                The refund will be credited to your original payment method. Processing times may vary depending on your bank or card issuer.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                Partial Refunds
              </h3>
              <p className="text-content mb-4">
                Partial refunds may be granted in certain situations:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Items returned after 30 days</li>
                <li>Items not in original condition</li>
                <li>Items with missing parts or accessories</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Exchanges
              </h2>
              <p className="text-content mb-4">
                We only replace items if they are defective or damaged. If you need to exchange an item for a different size or style:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Return the original item following our return process</li>
                <li>Once your return is processed, place a new order for the desired item</li>
                <li>This ensures you receive your new item as quickly as possible</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Damaged or Defective Items
              </h2>
              <p className="text-content mb-4">
                If you receive a damaged or defective item:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Contact us immediately at <a href="mailto:support@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">support@thegoodpalco.com</a></li>
                <li>Include photos of the damage and packaging</li>
                <li>We&apos;ll arrange for a replacement or full refund</li>
                <li>Return shipping will be provided at no cost to you</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                International Returns
              </h2>
              <p className="text-content mb-4">
                For international orders:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Customers are responsible for return shipping costs</li>
                <li>We recommend using a trackable shipping service</li>
                <li>Any customs fees or duties are non-refundable</li>
                <li>Returns must be marked as &quot;Returned Goods&quot; to avoid additional charges</li>
              </ul>
              <p className="text-content mb-4">
                International return address:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-content">The Good Opal Co</p>
                <p className="text-content">Returns Department</p>
                <p className="text-content">[Address Line 1]</p>
                <p className="text-content">Sydney, NSW 2000</p>
                <p className="text-content">Australia</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Gift Returns
              </h2>
              <p className="text-content mb-4">
                Items marked as gifts can be returned for store credit:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Gift recipients will receive store credit equal to the item value</li>
                <li>Original purchaser will not be notified of the return</li>
                <li>Store credit does not expire</li>
                <li>Gift returns follow the same 30-day policy</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-charcoal mb-2">Can I return sale items?</h4>
                  <p className="text-content">
                    Yes, sale items can be returned following our standard return policy unless marked as &quot;Final Sale.&quot;
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-charcoal mb-2">What if I lost my receipt?</h4>
                  <p className="text-content">
                    We can look up your order with your email address or order number. Contact us at <a href="mailto:returns@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">returns@thegoodpalco.com</a>.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-charcoal mb-2">Can I return an item to your store?</h4>
                  <p className="text-content">
                    We are an online-only retailer. All returns must be shipped back to our warehouse.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-charcoal mb-2">What if my refund hasn&apos;t appeared?</h4>
                  <p className="text-content">
                    First, check with your bank as processing times vary. If it&apos;s been more than 10 business days, contact us with your order details.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                Contact Us
              </h2>
              <p className="text-content mb-4">
                Have questions about returns? We&apos;re here to help:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Returns Department</h4>
                    <p className="text-content">Email: <a href="mailto:returns@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">returns@thegoodpalco.com</a></p>
                    <p className="text-content">Response time: Within 24 hours</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Customer Support</h4>
                    <p className="text-content">Email: <a href="mailto:support@thegoodpalco.com" className="text-opal-electric-accessible hover:underline">support@thegoodpalco.com</a></p>
                    <p className="text-content">Phone: +61 2 XXXX XXXX</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-opal-electric/5 p-6 rounded-xl">
              <p className="text-sm text-content text-center">
                This policy was last updated on January 15, 2024. We reserve the right to update our return policy at any time.
                For the most current version, please visit this page.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
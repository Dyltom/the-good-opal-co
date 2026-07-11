import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { OrderTrackingForm } from './tracking-form'
import { MarketingShell, PageHeader } from '@/components/marketing'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Order Tracking | The Good Opal Co',
  description: 'Track your order status with your order number and email',
  robots: { index: false, follow: false },
}

export default function OrderTrackingPage() {
  return (
    <MarketingShell>
      <Container className="py-12 sm:py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Order Tracking' },
          ]}
          className="mb-8"
        />

        <div className="max-w-lg mx-auto">
          <PageHeader
            title="Track your order"
            description="Enter the order number and email from your confirmation message."
            align="center"
            className="mb-8"
            titleClassName="text-4xl sm:text-5xl"
            descriptionClassName="text-base"
          />

          <OrderTrackingForm />

          {/* Help Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Can&apos;t find your order?
            </p>
            <p className="text-sm text-gray-600">
              Send the details through our{' '}
              <Link
                href="/contact?subject=order"
                className="text-opal-electric-accessible hover:underline"
              >
                order help form
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}

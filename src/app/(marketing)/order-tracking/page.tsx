import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { OrderTrackingForm } from './tracking-form'

export const metadata: Metadata = {
  title: 'Order Tracking | The Good Opal Co',
  description: 'Track your order status with your order number and email',
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Order Tracking' },
          ]}
          className="mb-8"
        />

        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-charcoal mb-4">
              Track Your Order
            </h1>
            <p className="text-content">
              Enter your order details below to check the status of your order
            </p>
          </div>

          <OrderTrackingForm />

          {/* Help Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Can't find your order?
            </p>
            <p className="text-sm text-gray-600">
              Contact our support team at{' '}
              <a
                href="mailto:thegoodopalco@gmail.com"
                className="text-opal-electric-accessible hover:underline"
              >
                thegoodopalco@gmail.com
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
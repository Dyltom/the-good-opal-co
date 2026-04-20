import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Orders Page Metadata
 */
export const metadata = {
  title: 'Order History | The Good Opal Co',
  description: 'View your order history and track current orders.',
}

/**
 * Account Orders Page
 *
 * Displays user's order history and current order status.
 * Follows SOLID principles with single responsibility.
 */
export default function OrdersPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation
          logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
          items={[
            { href: '/store', label: 'Shop' },
            { href: '/blog', label: 'Blog' },
            { href: '/courses', label: 'Courses' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
            { href: '/faq', label: 'FAQ' },
          ]}
        />

        <main className="flex-1 pt-16">
          <Container>
            <div className="max-w-4xl mx-auto py-12">
              {/* Header */}
              <div className="mb-8">
                <Link
                  href="/account"
                  className="inline-flex items-center text-sm text-charcoal/60 hover:text-opal-electric mb-4"
                >
                  ← Back to Account
                </Link>
                <h1 className="text-3xl font-bold text-charcoal">Order History</h1>
                <p className="text-charcoal/60 mt-2">
                  View and track your orders
                </p>
              </div>

              {/* Orders List */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-charcoal mb-2">No orders yet</h2>
                    <p className="text-charcoal/60 mb-6">
                      When you place your first order, it will appear here.
                    </p>
                    <Button asChild>
                      <Link href="/store">
                        Start Shopping
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </main>

        <Footer logoText="The Good Opal Co" />
      </div>
    </PageTransition>
  )
}
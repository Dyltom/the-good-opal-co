import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Addresses Page Metadata
 */
export const metadata = {
  title: 'Saved Addresses | The Good Opal Co',
  description: 'Manage your saved shipping and billing addresses.',
}

/**
 * Account Addresses Page
 *
 * Displays and manages user's saved addresses.
 * Follows SOLID principles with single responsibility.
 */
export default function AddressesPage() {
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
                <h1 className="text-3xl font-bold text-charcoal">Saved Addresses</h1>
                <p className="text-charcoal/60 mt-2">
                  Manage your shipping and billing addresses
                </p>
              </div>

              {/* Addresses List */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-charcoal mb-2">No saved addresses</h2>
                    <p className="text-charcoal/60 mb-6">
                      Add addresses to make checkout faster next time.
                    </p>
                    <Button>
                      Add New Address
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
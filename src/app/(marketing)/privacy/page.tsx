import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'

/**
 * Privacy Policy Page Metadata
 */
export const metadata = {
  title: 'Privacy Policy | The Good Opal Co',
  description: 'Our privacy policy details how we collect, use, and protect your personal information.',
}

/**
 * Privacy Policy Page
 *
 * Details our privacy practices and data protection measures.
 * Follows SOLID principles with single responsibility.
 */
export default function PrivacyPage() {
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
              <h1 className="text-4xl font-bold text-charcoal mb-8">Privacy Policy</h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-charcoal/80 mb-8">
                  Last updated: April 2026
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Information We Collect</h2>
                  <p className="text-charcoal/70 mb-4">
                    We collect information you provide directly to us, such as when you create an account,
                    make a purchase, subscribe to our newsletter, or contact us.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">How We Use Your Information</h2>
                  <p className="text-charcoal/70 mb-4">
                    We use the information we collect to provide, maintain, and improve our services,
                    process transactions, and communicate with you.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Information Sharing</h2>
                  <p className="text-charcoal/70 mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties
                    without your consent, except as described in this policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Contact Us</h2>
                  <p className="text-charcoal/70">
                    If you have any questions about this Privacy Policy, please contact us at{' '}
                    <a href="mailto:privacy@goodopalco.com" className="text-opal-electric hover:text-opal-deep">
                      privacy@goodopalco.com
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </Container>
        </main>

        <Footer logoText="The Good Opal Co" />
      </div>
    </PageTransition>
  )
}
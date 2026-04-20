import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'

/**
 * Terms of Service Page Metadata
 */
export const metadata = {
  title: 'Terms of Service | The Good Opal Co',
  description: 'Our terms of service outline the rules and regulations for using our website and services.',
}

/**
 * Terms of Service Page
 *
 * Details our terms and conditions for using our services.
 * Follows SOLID principles with single responsibility.
 */
export default function TermsPage() {
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
              <h1 className="text-4xl font-bold text-charcoal mb-8">Terms of Service</h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-charcoal/80 mb-8">
                  Last updated: April 2026
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Acceptance of Terms</h2>
                  <p className="text-charcoal/70 mb-4">
                    By accessing and using this website, you accept and agree to be bound by the terms
                    and provision of this agreement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Use License</h2>
                  <p className="text-charcoal/70 mb-4">
                    Permission is granted to temporarily download one copy of the materials on
                    The Good Opal Co&apos;s website for personal, non-commercial transitory viewing only.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Disclaimer</h2>
                  <p className="text-charcoal/70 mb-4">
                    The materials on The Good Opal Co&apos;s website are provided on an &apos;as is&apos; basis.
                    The Good Opal Co makes no warranties, expressed or implied.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Governing Law</h2>
                  <p className="text-charcoal/70 mb-4">
                    These terms and conditions are governed by and construed in accordance with the
                    laws of Australia and you irrevocably submit to the exclusive jurisdiction of the
                    courts in that State or location.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4">Contact Information</h2>
                  <p className="text-charcoal/70">
                    If you have any questions about these Terms of Service, please contact us at{' '}
                    <a href="mailto:legal@goodopalco.com" className="text-opal-electric hover:text-opal-deep">
                      legal@goodopalco.com
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
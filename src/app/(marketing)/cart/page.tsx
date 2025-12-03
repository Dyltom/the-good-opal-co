import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { getCart } from '@/lib/cart'
import { CartPageContent } from './cart-content'

/**
 * Cart Page Metadata
 */
export const metadata = {
  title: 'Shopping Cart | The Good Opal Co',
  description: 'Review your shopping cart and proceed to checkout.',
}

/**
 * Cart Page
 *
 * Server Component that fetches cart from cookies.
 * Cart manipulation is handled by the client component.
 */
export default async function CartPage() {
  // Get cart from server (cookies)
  const cart = await getCart()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
      />

      <main className="flex-1">
        <Section padding="lg">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

              {cart.items.length === 0 ? (
                <EmptyCartState />
              ) : (
                <CartPageContent initialCart={cart} />
              )}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  )
}

/**
 * Empty cart state with visual appeal
 */
function EmptyCartState() {
  return (
    <>
      {/* Empty cart state - Stunning Visual */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero/opal-1.jpg"
            alt="Australian Opals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 via-charcoal/70 to-opal-blue/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 md:p-20 text-center text-white">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border-2 border-white/20">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Collection Awaits</h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Each Australian opal is a unique masterpiece formed over millions of years. Start your
              journey and discover the perfect piece today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-opal-blue hover:bg-cream font-semibold shadow-xl hover:scale-105 transition-all"
              >
                <Link href="/store">Explore Collection</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm font-semibold"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold mb-1">130+</div>
                  <div className="text-sm text-white/80">Unique Opals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">100%</div>
                  <div className="text-sm text-white/80">Australian</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">1 Year</div>
                  <div className="text-sm text-white/80">Warranty</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

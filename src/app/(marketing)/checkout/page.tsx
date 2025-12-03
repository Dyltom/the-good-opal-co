import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { getCart } from '@/lib/cart'
import { CheckoutForm } from './checkout-form'

/**
 * Checkout Page Metadata
 */
export const metadata = {
  title: 'Checkout | The Good Opal Co',
  description: 'Complete your purchase of authentic Australian opals.',
}

/**
 * Checkout Page
 *
 * Server Component that fetches cart and renders checkout form.
 * Redirects to cart if empty.
 */
export default async function CheckoutPage() {
  const cart = await getCart()

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    redirect('/cart')
  }

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
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Checkout</h1>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cart">Back to Cart</Link>
                </Button>
              </div>

              <CheckoutForm cart={cart} />
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  )
}

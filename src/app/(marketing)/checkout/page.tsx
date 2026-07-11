import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
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
    <MarketingShell>
        <Section padding="lg">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-opal-electric-accessible">Final step</p>
                  <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
                    Checkout
                  </h1>
                </div>
                <Button variant="link" size="sm" asChild>
                  <Link href="/cart">Return to cart</Link>
                </Button>
              </div>

              <CheckoutForm cart={cart} />
            </div>
          </Container>
        </Section>
    </MarketingShell>
  )
}

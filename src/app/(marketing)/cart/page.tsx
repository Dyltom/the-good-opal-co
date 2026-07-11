import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { getCart } from '@/lib/cart'
import { CartPageContent } from './cart-content'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

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
    <PageTransition>
      <MarketingShell className="bg-white">
          {cart.items.length === 0 ? (
            <Container className="py-20 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-charcoal/40" aria-hidden="true" />
              <h1 className="mt-5 font-serif text-4xl font-semibold text-charcoal">
                Your cart is empty
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal/65">
                Browse available opals and jewellery, then add a piece when you are ready.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-7 bg-opal-electric-accessible bg-none hover:bg-opal-deep"
              >
                <Link href="/store">Browse available pieces</Link>
              </Button>
            </Container>
          ) : (
            <CartPageContent initialCart={cart} />
          )}
      </MarketingShell>
    </PageTransition>
  )
}

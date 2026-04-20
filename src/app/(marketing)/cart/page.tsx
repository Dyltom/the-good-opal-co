import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { getCart } from '@/lib/cart'
import { CartPageContent } from './cart-content'
import { CartEmptyState } from '@/components/ui/EmptyStates'
import { PageTransition } from '@/components/layout/PageTransition'

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
          {cart.items.length === 0 ? (
            <Container>
              <CartEmptyState />
            </Container>
          ) : (
            <CartPageContent initialCart={cart} />
          )}
        </main>

        <Footer logoText="The Good Opal Co" />
      </div>
    </PageTransition>
  )
}

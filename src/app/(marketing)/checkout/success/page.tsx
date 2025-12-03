import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clearCart } from '@/lib/cart'

/**
 * Checkout Success Page Metadata
 */
export const metadata = {
  title: 'Order Confirmed | The Good Opal Co',
  description: 'Thank you for your order. Your opals are being prepared for shipping.',
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

/**
 * Checkout Success Page
 *
 * Server Component that verifies the Stripe session and displays order confirmation.
 * Clears the cart after successful payment verification.
 */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  // Redirect if no session ID
  if (!session_id) {
    redirect('/store')
  }

  // Verify the session with Stripe
  let session: Stripe.Checkout.Session | null = null
  let error: string | null = null

  if (process.env['STRIPE_SECRET_KEY']) {
    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
      apiVersion: '2025-09-30.clover',
    })

    try {
      session = await stripe.checkout.sessions.retrieve(session_id)

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        error = 'Payment was not completed. Please try again.'
      } else {
        // Clear the cart after successful payment
        await clearCart()
      }
    } catch (err) {
      console.error('Failed to verify Stripe session:', err)
      error = 'Failed to verify payment. Please contact support if you were charged.'
    }
  } else {
    // Development mode - clear cart anyway
    await clearCart()
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
            <div className="max-w-2xl mx-auto text-center">
              {error ? (
                <ErrorState error={error} />
              ) : (
                <SuccessState email={session?.customer_email ?? undefined} />
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
 * Success state component
 */
function SuccessState({ email }: { email?: string }) {
  return (
    <Card className="p-12">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-lg text-muted-foreground mb-2">Thank you for your order</p>

      {email && (
        <p className="text-sm text-muted-foreground mb-8">
          Confirmation sent to: <span className="font-medium">{email}</span>
        </p>
      )}

      {/* What's Next */}
      <div className="bg-muted rounded-lg p-6 mb-8 text-left">
        <h2 className="font-semibold mb-3">What happens next?</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Order confirmation email sent
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Payment processed successfully
          </li>
          <li className="flex items-center gap-2">
            <span className="text-opal-blue">→</span>
            Your order is being prepared
          </li>
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">○</span>
            Shipping notification coming soon
          </li>
        </ul>
      </div>

      {/* Shipping Info */}
      <div className="bg-opal-blue-pale rounded-lg p-4 mb-8">
        <p className="text-sm text-charcoal-80">
          Your opal will be carefully packaged and shipped within{' '}
          <span className="font-semibold">1-2 business days</span>. Expect delivery in{' '}
          <span className="font-semibold">3-7 business days</span> depending on your location.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link href="/store">Continue Shopping</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </Card>
  )
}

/**
 * Error state component
 */
function ErrorState({ error }: { error: string }) {
  return (
    <Card className="p-12">
      {/* Error Icon */}
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-bold mb-4">Verification Issue</h1>
      <p className="text-muted-foreground mb-8">{error}</p>

      {/* Contact Info */}
      <div className="bg-muted rounded-lg p-4 mb-8">
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact our support team at{' '}
          <a href="mailto:support@thegoodopal.co" className="text-opal-blue hover:underline">
            support@thegoodopal.co
          </a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link href="/checkout">Try Again</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/cart">Return to Cart</Link>
        </Button>
      </div>
    </Card>
  )
}

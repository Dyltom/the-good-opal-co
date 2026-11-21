import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import Stripe from 'stripe'
import { Container, Section } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClearCartOnSuccess } from './clear-cart'
import { OrderFinalizationRefresh } from './order-finalization-refresh'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import { getPayload } from '@/lib/payload'
import type { CartItem } from '@/lib/cart'
import { shouldFinalizeCheckout } from '@/lib/stripe-fulfillment'

/**
 * Checkout Success Page Metadata
 */
export const metadata = {
  title: 'Checkout Status | The Good Opal Co',
  description: 'Verify the status of your Good Opal Co checkout.',
  robots: { index: false, follow: false },
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
  let orderConfirmed = false

  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    error =
      'Payment verification is temporarily unavailable. Your cart has not been cleared. Please contact support if you were charged.'
  } else {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-06-24.dahlia',
    })

    try {
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items.data.price.product'],
      })

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        error = 'Payment was not completed. Please try again.'
      } else {
        try {
          const payload = await getPayload()
          const orderResult = await payload.find({
            collection: 'orders',
            where: { stripeSessionId: { equals: session.id } },
            limit: 1,
          })
          orderConfirmed = orderResult.docs.length > 0
        } catch (err) {
          // Payment remains authoritative. Avoid claiming order confirmation until
          // the webhook-created backend record can actually be verified.
          console.error('Failed to verify backend order:', err)
        }
      }
    } catch (err) {
      console.error('Failed to verify Stripe session:', err)
      error = 'Failed to verify payment. Please contact support if you were charged.'
    }
  }

  return (
    <MarketingShell>
        <Section padding="lg">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              {error || !session ? (
                <ErrorState
                  error={
                    error ??
                    'Payment verification is temporarily unavailable. Please contact support if you were charged.'
                  }
                />
              ) : (
                <>
                  <OrderFinalizationRefresh pending={!orderConfirmed} />
                  {shouldFinalizeCheckout(session.payment_status, orderConfirmed) && (
                    <ClearCartOnSuccess purchase={getPurchaseAnalytics(session)} />
                  )}
                  <SuccessState
                    email={session?.customer_details?.email ?? session?.customer_email ?? undefined}
                    orderConfirmed={orderConfirmed}
                  />
                </>
              )}
            </div>
          </Container>
        </Section>
    </MarketingShell>
  )
}

function getPurchaseAnalytics(session: Stripe.Checkout.Session) {
  const items: CartItem[] = (session.line_items?.data ?? []).map((lineItem) => {
    const quantity = lineItem.quantity ?? 1
    const product = lineItem.price?.product
    const metadata =
      product && typeof product === 'object' && !product.deleted ? product.metadata : null
    const unitAmount =
      lineItem.price?.unit_amount ?? Math.round(lineItem.amount_subtotal / quantity)

    return {
      productId: metadata?.productId || lineItem.price?.id || lineItem.id,
      slug: metadata?.slug || '',
      name: lineItem.description || 'Opal jewellery',
      price: unitAmount / 100,
      quantity,
    }
  })

  return {
    transactionId: session.id,
    items,
    total: (session.amount_total ?? 0) / 100,
    shipping: (session.total_details?.amount_shipping ?? 0) / 100,
    tax: (session.total_details?.amount_tax ?? 0) / 100,
  }
}

/**
 * Success state component
 */
function SuccessState({ email, orderConfirmed }: { email?: string; orderConfirmed: boolean }) {
  return (
    <Card className="p-12">
      {/* Success Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <Check className="h-10 w-10 text-success" aria-hidden="true" />
      </div>

      {/* Success Message */}
      <h1 className="mb-2 font-serif text-3xl font-semibold text-ink">
        {orderConfirmed ? 'Order confirmed' : 'Payment received'}
      </h1>
      <p className="mb-4 font-serif italic text-xl text-ink-2">
        {orderConfirmed ? 'Thank you for your order' : 'We are finalizing your order now'}
      </p>

      {email && orderConfirmed && (
        <p className="mb-8 text-sm text-ink-2">
          Confirmation sent to: <span className="font-medium">{email}</span>
        </p>
      )}

      {/* What's Next */}
      <div className="mb-8 rounded-sm bg-plinth p-6 text-left">
        <h2 className="mb-3 font-semibold">What happens next?</h2>
        <ul className="space-y-2 text-sm text-ink-2">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            {orderConfirmed ? 'Order confirmation is being emailed' : 'Payment received securely'}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            Payment processed successfully
          </li>
          <li className="flex items-center gap-2">
            <span className="text-accent">→</span>
            {orderConfirmed ? 'Your order is being prepared' : 'Order confirmation is processing'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-ink-2">○</span>
            Shipping notification on its way
          </li>
        </ul>
      </div>

      {/* Shipping Info */}
      <div className="mb-8 rounded-sm bg-accent/20 p-4">
        <p className="text-sm text-ink">
          We will email tracking after dispatch. Delivery timing depends on the destination and
          shipping estimate selected during checkout.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/store">Continue Shopping</Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
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
  const supportEmail = process.env.CONTACT_EMAIL ?? ''
  return (
    <Card className="p-12">
      {/* Error Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-10 w-10 text-amber-600"
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
      <h1 className="mb-4 text-3xl font-bold">Verification Issue</h1>
      <p className="mb-8 text-ink-2">{error}</p>

      {/* Contact Info */}
      <div className="mb-8 rounded-sm bg-plinth p-4">
        <p className="text-sm text-ink-2">
          If you believe this is an error, please contact our support team at{' '}
          <a href={`mailto:${supportEmail}`} className="text-accent hover:underline">
            {supportEmail}
          </a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/cart">Try again</Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link href="/cart">Return to Cart</Link>
        </Button>
      </div>
    </Card>
  )
}

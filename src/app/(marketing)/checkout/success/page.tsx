import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { ClearCartOnSuccess } from './clear-cart'
import { OrderFinalizationRefresh } from './order-finalization-refresh'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import { getPayload } from '@/lib/payload'
import type { CartItem } from '@/lib/cart'
import { shouldFinalizeCheckout } from '@/lib/stripe-fulfillment'

export const metadata = {
  title: 'Checkout Status | The Good Opal Co',
  description: 'Verify the status of your Good Opal Co checkout.',
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/store')
  }

  let session: Stripe.Checkout.Session | null = null
  let error: string | null = null
  let orderConfirmed = false

  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    error =
      'Payment verification is temporarily unavailable. Your bag has not been cleared. Please contact support if you were charged.'
  } else {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-06-24.dahlia',
    })

    try {
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items.data.price.product'],
      })

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
      <div className="px-gut pb-sec pt-8 md:pt-14">
        <div className="mx-auto max-w-[640px]">
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
      </div>
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

const headingClass = 'font-serif text-[clamp(32px,4vw,48px)] leading-[1.04] tracking-[-0.02em] text-ink'

function SuccessState({ email, orderConfirmed }: { email?: string; orderConfirmed: boolean }) {
  const steps = [
    orderConfirmed ? 'Order confirmation is being emailed' : 'Payment received securely',
    'Payment processed successfully',
    orderConfirmed ? 'Your order is being prepared' : 'Order confirmation is processing',
    'We will email tracking after dispatch. Delivery timing depends on the destination and shipping estimate selected during checkout.',
  ]
  return (
    <>
      <h1 className={headingClass}>{orderConfirmed ? 'Order confirmed' : 'Payment received'}</h1>
      <p className="mt-3 font-serif text-xl italic text-ink-2">
        {orderConfirmed ? 'Thank you for your order.' : 'We are finalizing your order now.'}
      </p>
      {email && orderConfirmed ? (
        <p className="mt-2 text-sm text-ink-2">
          Confirmation sent to <span className="text-ink">{email}</span>
        </p>
      ) : null}

      <h2 className="mt-8 border-b border-rule pb-2 text-sm font-medium text-ink">What happens next</h2>
      <ol className="text-sm text-ink-2">
        {steps.map((step, index) => (
          <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b border-rule py-2.5">
            <span className="text-ink-3">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/store">Continue shopping</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </>
  )
}

function ErrorState({ error }: { error: string }) {
  const supportEmail = process.env.CONTACT_EMAIL ?? ''
  return (
    <>
      <h1 className={headingClass}>Verification issue</h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">{error}</p>
      <p className="mt-4 border-y border-rule py-3 text-sm text-ink-2">
        If you believe this is an error, please contact our support team at{' '}
        <a href={`mailto:${supportEmail}`} className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink">
          {supportEmail}
        </a>
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/cart">Return to your bag</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </>
  )
}

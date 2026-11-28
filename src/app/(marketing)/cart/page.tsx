import { MarketingShell } from '@/components/marketing'
import { getCart } from '@/lib/cart'
import { CartPageContent } from './cart-content'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { isShippingCountry } from '@/lib/constants/shipping'
import { paypalConfigured } from '@/lib/paypal'
import { activeSale } from '@/lib/promotions'
import { isPayPalNotice, PAYPAL_NOTICES } from '@/lib/paypal-order'

export const metadata = {
  title: 'Your bag | The Good Opal Co',
  description: 'Review the pieces in your bag and proceed to checkout.',
  robots: { index: false, follow: false },
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ paypal?: string }>
}) {
  const { paypal } = await searchParams
  const notice = isPayPalNotice(paypal) ? PAYPAL_NOTICES[paypal] : null
  const cart = await getCart()
  const savedCountry = (await cookies()).get('shipping-country')?.value
  const initialCountry = isShippingCountry(savedCountry) ? savedCountry : 'AU'

  return (
    <div className="animate-fade-in">
      <MarketingShell>
        {cart.items.length === 0 ? (
          <div className="px-gut pb-sec pt-5 md:pt-8">
            <div className="mx-auto max-w-[90rem]">
              <h1 className="border-b border-rule pb-4 font-serif text-[clamp(30px,3.4vw,44px)] leading-[1.04] tracking-[-0.02em] text-ink">
                Your bag is empty
              </h1>
              {notice ? (
                <p
                  role="status"
                  className="mt-5 max-w-2xl bg-plinth px-4 py-3 text-sm leading-6 text-ink"
                >
                  {notice}
                </p>
              ) : null}
              <p className="mt-5 max-w-md text-[14.5px] leading-[1.6] text-ink-2">
                Browse available opals and jewellery, then add a piece when you are ready.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Button asChild>
                  <Link href="/store">Browse available pieces</Link>
                </Button>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center text-sm text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Need help choosing? Talk to us
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <CartPageContent
            initialCart={cart}
            initialCountry={initialCountry}
            paypalEnabled={paypalConfigured()}
            promoCodes={!activeSale()}
            notice={notice}
          />
        )}
      </MarketingShell>
    </div>
  )
}

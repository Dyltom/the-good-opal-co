'use client'

import { useCallback, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  CheckoutButton,
  ShippingCountrySelect,
  useShippingCountry,
} from '@/components/cart/CheckoutButton'
import {
  CheckoutFeedback,
  useCancelledCheckoutPrompt,
  type CheckoutFeedbackSource,
} from '@/components/cart/CheckoutFeedback'
import { GiftVoucherField, type AppliedGiftVoucher } from '@/components/cart/GiftVoucherField'
import { Button } from '@/components/ui/button'
import { CartClearConfirmDialog } from '@/components/ui/cart-clear-confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { trackRemoveFromCart } from '@/lib/analytics'
import { calculateCheckoutPricing, centsToDollars } from '@/lib/checkout-pricing'
import { giftVoucherAppliedCents } from '@/lib/gift-voucher-rules'
import type { Cart, CartItem } from '@/lib/cart'
import { extraCoverCents, type ShippingCountry } from '@/lib/constants/shipping'
import { formatCurrency } from '@/lib/utils'
import { clearCart, removeFromCart, updateQuantity } from './actions'

interface CartPageContentProps {
  initialCart: Cart
  initialCountry: ShippingCountry
}

export function CartPageContent({ initialCart, initialCountry }: CartPageContentProps) {
  const [cart, setCart] = useState(initialCart)
  const [isPending, startTransition] = useTransition()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [country, setCountry] = useShippingCountry(initialCountry)
  const [feedback, setFeedback] = useState<CheckoutFeedbackSource | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  useCancelledCheckoutPrompt(useCallback(() => setFeedback('cancelled'), []))
  const closeFeedback = () => setFeedback(null)
  const markFeedbackSent = () => setFeedbackSent(true)
  const pricing = calculateCheckoutPricing(cart.items, country)
  const coverCents = extraCoverCents(country, pricing.shippedSubtotal)
  const [voucher, setVoucher] = useState<AppliedGiftVoucher | null>(null)
  const voucherAmount = voucher
    ? centsToDollars(giftVoucherAppliedCents(Math.round(voucher.available * 100), pricing.totalCents))
    : 0
  const totalDue = pricing.total - voucherAmount

  const showMutationError = (description?: string) => {
    toast({
      title: 'Your bag could not be updated',
      description: description ?? 'Try again. Your bag has not changed.',
      variant: 'destructive',
    })
  }

  const handleRemoveItem = (productId: string, name: string) => {
    startTransition(async () => {
      const result = await removeFromCart(productId)
      if (!result.success || !result.data) {
        showMutationError(result.error)
        return
      }

      const removed = cart.items.find((item) => item.productId === productId)
      if (removed) trackRemoveFromCart(removed)
      setCart(result.data)
      window.dispatchEvent(new CustomEvent('cart-updated'))
      toast({ title: 'Removed from your bag', description: name })
      if (result.data.items.length === 0) router.refresh()
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    startTransition(async () => {
      const result = await updateQuantity(productId, quantity)
      if (!result.success || !result.data) {
        showMutationError(result.error)
        return
      }

      setCart(result.data)
      window.dispatchEvent(new CustomEvent('cart-updated'))
      if (result.data.items.length === 0) router.refresh()
    })
  }

  const handleConfirmClearCart = () => {
    startTransition(async () => {
      const result = await clearCart()
      if (!result.success) {
        showMutationError(result.error)
        return
      }

      window.dispatchEvent(new CustomEvent('cart-updated'))
      router.refresh()
    })
  }

  return (
    <div className="px-gut pb-sec pt-5 md:pt-8">
      <div className="mx-auto max-w-[90rem] pb-14 lg:pb-0" aria-busy={isPending}>
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-rule pb-4">
          <div>
            <h1 className="font-serif text-[clamp(30px,3.4vw,44px)] leading-[1.04] tracking-[-0.02em] text-ink">
              Your bag
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-2" aria-live="polite">
              {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'}, all prices in AUD
            </p>
          </div>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            disabled={isPending}
            className="-mr-2 px-2 text-ink-2 hover:text-destructive"
          >
            Clear bag
          </Button>
        </header>

        {feedback === 'cancelled' ? (
          <CheckoutFeedback
            source="cancelled"
            onClose={closeFeedback}
            onSent={markFeedbackSent}
            className="mt-5 max-w-2xl"
          />
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
          <section aria-label="Items in your bag" className="min-w-0 divide-y divide-rule border-b border-rule">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onRemove={() => handleRemoveItem(item.productId, item.name)}
                onUpdateQuantity={(quantity) => handleUpdateQuantity(item.productId, quantity)}
                isPending={isPending}
              />
            ))}
          </section>

          <aside className="min-w-0 lg:sticky lg:top-[80px] lg:mt-5" aria-labelledby="cart-summary-heading">
            <div className="bg-plinth p-5">
              <h2 id="cart-summary-heading" className="font-serif text-[22px] leading-tight text-ink">
                Summary
              </h2>

              <ShippingCountrySelect value={country} onChange={setCountry} className="mt-4" />

              <dl className="mt-4 text-sm text-ink">
                <div className="flex justify-between gap-4 border-b border-rule py-2">
                  <dt className="text-ink-2">Subtotal</dt>
                  <dd>{formatCurrency(pricing.subtotal, 'AUD')}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-rule py-2">
                  <dt className="text-ink-2">Shipping</dt>
                  <dd>
                    {pricing.shippedSubtotal === 0
                      ? 'None'
                      : `from ${formatCurrency(pricing.shipping, 'AUD')}`}
                  </dd>
                </div>
                {voucher ? (
                  <div className="flex justify-between gap-4 border-b border-rule py-2">
                    <dt className="text-ink-2">Gift voucher</dt>
                    <dd>-{formatCurrency(voucherAmount, 'AUD')}</dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <dt className="font-medium">Estimated total</dt>
                  <dd className="text-xl font-medium">{formatCurrency(totalDue, 'AUD')}</dd>
                </div>
              </dl>

              {coverCents > 0 ? (
                <p className="mt-2 text-[13px] leading-5 text-ink-2">
                  Shipping includes Australia Post Extra Cover for the order&apos;s value and a
                  signature on delivery: {formatCurrency(coverCents / 100, 'AUD')} of the price.
                </p>
              ) : null}

              <div className="mt-4">
                <GiftVoucherField applied={voucher} onChange={setVoucher} />
                {voucher ? null : (
                  <Link href="/gift-vouchers" className="mt-2 inline-flex min-h-11 items-center text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink">
                    Buying for someone else? Give a gift voucher
                  </Link>
                )}
              </div>

              <CheckoutButton
                cart={cart}
                country={country}
                giftVoucherCode={voucher?.code}
                className="mt-4 h-12 w-full text-[15px] max-lg:hidden"
              />
              <p className="mt-2.5 text-[12.5px] leading-5 text-ink-2">
                Pay by card, Apple Pay or Klarna on Stripe&apos;s secure checkout. Each piece stays available to other
                shoppers until payment is complete.
              </p>
              <Button asChild variant="ghost" className="mt-3 w-full">
                <Link href="/store">Continue shopping</Link>
              </Button>
            </div>

            {feedback === 'cart' ? (
              <CheckoutFeedback
                source="cart"
                onClose={closeFeedback}
                onSent={markFeedbackSent}
                className="mt-4"
              />
            ) : !feedbackSent && feedback === null ? (
              <button
                type="button"
                onClick={() => setFeedback('cart')}
                className="mt-2 inline-flex min-h-11 items-center text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Not ready yet? Tell us what would help
              </button>
            ) : null}
          </aside>
        </div>
      </div>
      <div
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-bg px-gut py-2.5 lg:hidden"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-screen-sm items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-ink-2">Estimated total</p>
            <p className="text-lg font-medium leading-6 text-ink">{formatCurrency(totalDue, 'AUD')}</p>
          </div>
          <div className="flex-1">
            <CheckoutButton
              cart={cart}
              country={country}
              giftVoucherCode={voucher?.code}
              className="h-12 w-full text-[15px]"
            />
          </div>
        </div>
      </div>

      <CartClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClearCart}
        itemCount={cart.itemCount}
      />
    </div>
  )
}

interface CartItemRowProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

const qtyButton =
  'flex h-11 w-11 items-center justify-center rounded-sm border border-rule-2 text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

function CartItemRow({ item, onRemove, onUpdateQuantity, isPending }: CartItemRowProps) {
  return (
    <article className="flex min-w-0 gap-4 py-5 sm:gap-5">
      <Link
        href={`/store/${item.slug}`}
        className="relative aspect-[4/5] w-[88px] shrink-0 overflow-hidden bg-plinth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-[112px]"
        aria-label={`View ${item.name}`}
      >
        {item.image ? <Image src={item.image} alt="" fill sizes="112px" className="object-cover" /> : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-baseline justify-between gap-4">
          <h2 className="min-w-0 break-words font-serif text-[17px] italic leading-[1.25] text-ink sm:text-[19px]">
            <Link
              href={`/store/${item.slug}`}
              className="hover:underline hover:decoration-rule-2 hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {item.name}
            </Link>
          </h2>
          <p className="shrink-0 text-[15px] font-medium text-ink">
            {formatCurrency(item.price * item.quantity, 'AUD')}
          </p>
        </div>
        <p className="mt-1 text-[12.5px] text-ink-2">
          {(item.maxQuantity ?? Infinity) > 1
            ? `${formatCurrency(item.price, 'AUD')} each`
            : 'Only one available'}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          {(item.maxQuantity ?? Infinity) > 1 ? (
            <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${item.name}`}>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isPending}
                aria-label={`Decrease quantity of ${item.name}`}
                className={qtyButton}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-8 text-center text-sm text-ink" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending || item.quantity >= (item.maxQuantity ?? Infinity)}
                aria-label={`Increase quantity of ${item.name}`}
                className={qtyButton}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onRemove}
            disabled={isPending}
            aria-label={`Remove ${item.name} from bag`}
            className="-ml-1 ml-auto inline-flex min-h-11 items-center px-1 text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 transition-colors hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

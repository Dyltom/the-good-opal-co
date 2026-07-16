'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout'
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress'
import { Button } from '@/components/ui/button'
import { CartClearConfirmDialog } from '@/components/ui/cart-clear-confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { calculateCheckoutPricing } from '@/lib/checkout-pricing'
import type { Cart, CartItem } from '@/lib/cart'
import { formatCurrency } from '@/lib/utils'
import { clearCart, removeFromCart, updateQuantity } from './actions'

interface CartPageContentProps {
  initialCart: Cart
}

export function CartPageContent({ initialCart }: CartPageContentProps) {
  const [cart, setCart] = useState(initialCart)
  const [isPending, startTransition] = useTransition()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pricing = calculateCheckoutPricing(cart.total)

  const showMutationError = (description?: string) => {
    toast({
      title: 'Cart could not be updated',
      description: description ?? 'Try again. Your existing cart has not changed.',
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

      setCart(result.data)
      window.dispatchEvent(new CustomEvent('cart-updated'))
      toast({ title: 'Removed from cart', description: name })
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
    <Container className="py-10 lg:py-14">
      <div className="pb-28 lg:pb-0" aria-busy={isPending}>
        <header className="mb-8 border-b border-warm-grey/50 pb-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-opal-electric-accessible">
            Your order
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
                Shopping cart
              </h1>
              <p className="mt-2 text-sm text-charcoal/65" aria-live="polite">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}, all prices in AUD
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              disabled={isPending}
              className="text-charcoal/65 hover:text-fire-coral"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear cart
            </Button>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section
            aria-label="Items in your cart"
            className="min-w-0 divide-y divide-warm-grey/50 border-y border-warm-grey/50"
          >
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

          <aside className="min-w-0 lg:sticky lg:top-24" aria-labelledby="cart-summary-heading">
            <div className="border border-warm-grey/60 bg-cream p-5 sm:p-6">
              <h2
                id="cart-summary-heading"
                className="font-serif text-2xl font-semibold text-charcoal"
              >
                Order summary
              </h2>

              <dl className="mt-5 space-y-3 text-sm text-charcoal">
                <div className="flex justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatCurrency(pricing.subtotal, 'AUD')}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">
                    {pricing.shipping === 0 ? 'Free' : formatCurrency(pricing.shipping, 'AUD')}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-warm-grey/50 pt-4 text-lg font-semibold">
                  <dt>Estimated total</dt>
                  <dd className="tabular-nums">{formatCurrency(pricing.total, 'AUD')}</dd>
                </div>
              </dl>

              <p className="mt-3 text-xs leading-5 text-charcoal/60">
                Delivery address and payment details are entered securely at checkout.
              </p>

              <FreeShippingProgress total={cart.total} className="mt-5 rounded-none bg-white" />

              <Button
                asChild
                size="lg"
                className="mt-6 w-full bg-opal-electric-accessible bg-none hover:bg-opal-deep"
              >
                <Link href="/checkout">Continue to checkout</Link>
              </Button>
              <Button asChild variant="link" className="mt-2 w-full">
                <Link href="/store">Continue shopping</Link>
              </Button>
            </div>

            <div className="mt-5 flex gap-3 text-sm leading-6 text-charcoal/65">
              <ShoppingBag className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Each piece remains available to other shoppers until payment is complete.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile checkout summary */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/50 bg-cream px-4 py-3 lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-screen-sm items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-charcoal/60">Estimated total</p>
            <p className="font-serif text-lg font-semibold tabular-nums text-charcoal">
              {formatCurrency(pricing.total, 'AUD')}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 flex-1 bg-opal-electric-accessible bg-none hover:bg-opal-deep"
          >
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>

      <CartClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClearCart}
        itemCount={cart.itemCount}
      />
    </Container>
  )
}

interface CartItemRowProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

function CartItemRow({ item, onRemove, onUpdateQuantity, isPending }: CartItemRowProps) {
  return (
    <article className="flex min-w-0 gap-4 py-6 sm:gap-6">
      <Link
        href={`/store/${item.slug}`}
        className="h-24 w-24 shrink-0 overflow-hidden bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible sm:h-32 sm:w-32"
        aria-label={`View ${item.name}`}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-charcoal/35"
            aria-hidden="true"
          >
            <ShoppingBag className="h-7 w-7" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <Link
              href={`/store/${item.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              <h2 className="break-words font-serif text-lg font-semibold leading-6 text-charcoal sm:text-xl">
                {item.name}
              </h2>
            </Link>
            <p className="mt-1 text-sm tabular-nums text-charcoal/60">
              {formatCurrency(item.price, 'AUD')} each
            </p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums text-charcoal">
            {formatCurrency(item.price * item.quantity, 'AUD')}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <div
            className="flex items-center border border-warm-grey/60 bg-white"
            aria-label={`Quantity for ${item.name}`}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={isPending}
              aria-label={`Decrease quantity of ${item.name}`}
              className="rounded-none"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span
              className="w-10 text-center text-sm font-semibold text-charcoal"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={isPending}
              aria-label={`Increase quantity of ${item.name}`}
              className="rounded-none"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={isPending}
            aria-label={`Remove ${item.name} from cart`}
            className="text-charcoal/65 hover:text-fire-coral"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  )
}

'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CartItemSkeleton } from '@/components/ui/LoadingStates'
import { CartEmptyState } from '@/components/ui/EmptyStates'
import {
  CheckoutButton,
  ShippingRegionToggle,
  useShippingRegion,
} from '@/components/cart/CheckoutButton'
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress'
import { formatCurrency } from '@/lib/utils'
import { trackRemoveFromCart } from '@/lib/analytics'
import { fetchCart, removeFromCart, updateQuantity } from '@/app/(marketing)/cart/actions'
import { Trash2, Plus, Minus } from 'lucide-react'
import type { Cart, CartItem } from '@/lib/cart'

export function AnimatedCartDrawer({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [region, setRegion] = useShippingRegion()
  const [isPending, startTransition] = useTransition()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const loadCart = useCallback(async () => {
    const result = await fetchCart()
    if (result.success && result.data) {
      setCart(result.data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadCart()
    }
  }, [isOpen, loadCart])

  useEffect(() => {
    const open = () => setIsOpen(true)
    window.addEventListener('cart-open', open)
    return () => window.removeEventListener('cart-open', open)
  }, [])

  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) {
        loadCart()
      }
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [isOpen, loadCart])

  const handleRemove = (productId: string) => {
    setRemovingItems(new Set(removingItems).add(productId))

    startTransition(async () => {
      const result = await removeFromCart(productId)
      if (result.success && result.data) {
        const removed = cart?.items.find((item) => item.productId === productId)
        if (removed) trackRemoveFromCart(removed)
        setCart(result.data)
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    })
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    startTransition(async () => {
      const result = await updateQuantity(productId, newQuantity)
      if (result.success && result.data) {
        setCart(result.data)
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    })
  }

  const items = cart?.items ?? []
  const itemCount = cart?.itemCount ?? 0
  const total = cart?.total ?? 0

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 bg-bg p-0 sm:max-w-md">
        <SheetHeader className="border-b border-rule px-5 py-4 pr-14 text-left">
          <SheetTitle className="font-serif text-xl font-normal">
            Your bag <span className="font-sans text-sm text-ink-3">({itemCount})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your cart items, update quantities, track free shipping progress, and continue to secure checkout.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-5">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <CartEmptyState />
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <CartDrawerItem
                  key={item.productId}
                  item={item}
                  onRemove={() => handleRemove(item.productId)}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty)}
                  isPending={isPending}
                  isRemoving={removingItems.has(item.productId)}
                />
              ))}
            </ul>
            <div className="space-y-3 border-t border-rule bg-plinth px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-ink-2">Subtotal</span>
                <span className="text-lg font-medium text-ink">{formatCurrency(total, 'AUD')}</span>
              </div>

              <FreeShippingProgress total={total} />
              <div className="space-y-2">
                {cart ? (
                  <>
                    <ShippingRegionToggle value={region} onChange={setRegion} />
                    <CheckoutButton cart={cart} region={region} className="h-12 w-full text-base" />
                  </>
                ) : null}

                <Button variant="ghost" className="w-full" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/cart">View bag</Link>
                </Button>

                <SheetClose asChild>
                  <Button variant="link" className="w-full text-ink-2 hover:text-ink">
                    Continue shopping
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface CartDrawerItemProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
  isRemoving: boolean
}

const qtyButton =
  'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-rule-2 text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50'

function CartDrawerItem({ item, onRemove, onUpdateQuantity, isPending, isRemoving }: CartDrawerItemProps) {
  return (
    <li
      className={`flex gap-4 border-b border-rule py-4 transition-opacity duration-300 last:border-0 ${isRemoving ? 'opacity-40' : ''}`}
    >
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-plinth">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h4 className="min-w-0 flex-1 truncate font-serif text-[15.5px] italic">{item.name}</h4>
          <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity, 'AUD')}</p>
        </div>
        <p className="mb-1 text-[12.5px] text-ink-2">
          {formatCurrency(item.price, 'AUD')}
          {item.quantity > 1 ? ' each' : ''}
        </p>
        <div className="flex items-center gap-2">
          {(item.maxQuantity ?? Infinity) > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                disabled={isPending || isRemoving}
                className={qtyButton}
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending || isRemoving || item.quantity >= (item.maxQuantity ?? Infinity)}
                className={qtyButton}
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </>
          ) : (
            <span className="text-[12.5px] text-ink-3">Only one available</span>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={isPending || isRemoving}
            className="ml-auto flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-ink-3 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

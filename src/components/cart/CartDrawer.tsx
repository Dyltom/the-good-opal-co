'use client'

/**
 * Cart Drawer Component
 *
 * Sliding drawer that shows cart contents without navigation.
 * Uses server actions for cart operations.
 * Modern e-commerce pattern (Shopify, Amazon-style)
 */

import { useEffect, useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CartItemSkeleton } from '@/components/ui/LoadingStates'
import { CartEmptyState } from '@/components/ui/EmptyStates'
import { formatCurrency } from '@/lib/utils'
import { fetchCart, removeFromCart, updateQuantity } from '@/app/(marketing)/cart/actions'
import { Gem } from 'lucide-react'
import type { Cart, CartItem } from '@/lib/cart'

interface CartDrawerProps {
  children: React.ReactNode
  onCartUpdate?: () => void
}

export function CartDrawer({ children, onCartUpdate }: CartDrawerProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadCart = useCallback(async () => {
    const result = await fetchCart()
    if (result.success && result.data) {
      setCart(result.data)
    }
    setIsLoading(false)
  }, [])

  // Load cart when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadCart()
    }
  }, [isOpen, loadCart])

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      const result = await removeFromCart(productId)
      if (result.success && result.data) {
        setCart(result.data)
        onCartUpdate?.()
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    })
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    startTransition(async () => {
      const result = await updateQuantity(productId, newQuantity)
      if (result.success && result.data) {
        setCart(result.data)
        onCartUpdate?.()
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
      <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-white/95 via-white/90 to-opal-electric/5 backdrop-blur-sm border-l border-warm-grey/20">
        <SheetHeader className="border-b border-warm-grey/20 pb-4 mb-6">
          <SheetTitle className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <span className="font-accent text-opal-electric">✨</span>
            Your Magical Cart
            <span className="font-accent text-opal-electric">✨</span>
          </SheetTitle>
          {!isLoading && (
            <p className="font-accent text-sm text-opal-electric/70 mt-1">
              ~ {itemCount === 0 ? 'Awaiting treasures' : `${itemCount} ${itemCount === 1 ? 'treasure' : 'treasures'} gathered`} ~
            </p>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="flex flex-col h-full mt-6">
            {/* Cart Items - Scrollable */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartDrawerItem
                    key={item.productId}
                    item={item}
                    onRemove={() => handleRemove(item.productId)}
                    onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Magical Cart Summary */}
            <div className="border-t border-warm-grey/20 pt-6 space-y-6 bg-gradient-to-r from-white/50 to-opal-electric/5 rounded-t-2xl p-4 -mx-6 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-serif text-lg font-semibold text-charcoal">
                  <span className="font-accent text-opal-electric">💎</span> Total:
                </span>
                <span className="font-serif text-xl font-bold text-charcoal">{formatCurrency(total, 'AUD')}</span>
              </div>

              {/* Magical Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-opal-electric to-opal-deep text-white hover:from-opal-deep hover:to-opal-electric shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-serif"
                  size="lg"
                  asChild
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <span className="font-accent mr-2">✨</span>
                    Claim Your Treasures
                    <span className="font-accent ml-2">✨</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-warm-grey/30 bg-white/50 hover:bg-opal-electric/10 hover:border-opal-electric/50 transition-all font-serif"
                  asChild
                >
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <span className="font-accent mr-2">🔍</span>
                    View Full Collection
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * Individual cart drawer item component
 */
interface CartDrawerItemProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

function CartDrawerItem({ item, onRemove, onUpdateQuantity, isPending }: CartDrawerItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-warm-grey/20 hover:bg-opal-electric/5 transition-all rounded-xl px-2 mx-2">
      {/* Magical Product Image */}
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg border border-warm-grey/20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <Gem size={32} className="text-opal-electric/60" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-sm font-semibold mb-1 truncate text-charcoal">{item.name}</h4>
        <p className="font-sans text-sm text-charcoal/60 mb-2">
          {formatCurrency(item.price, 'AUD')} each
        </p>

        {/* Magical Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-lg rounded-lg border-warm-grey/30 hover:border-opal-electric/50 hover:bg-opal-electric/10 transition-all"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            disabled={isPending}
            aria-label={`Decrease quantity of ${item.name}`}
          >
            −
          </Button>
          <span className="font-sans text-sm font-medium w-10 text-center text-charcoal">
            {item.quantity}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-lg rounded-lg border-warm-grey/30 hover:border-opal-electric/50 hover:bg-opal-electric/10 transition-all"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={isPending}
            aria-label={`Increase quantity of ${item.name}`}
          >
            +
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs ml-auto px-3 rounded-lg hover:bg-fire-pink/10 hover:text-fire-pink transition-colors font-sans"
            onClick={onRemove}
            disabled={isPending}
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Magical Item Total */}
      <div className="text-right">
        <p className="font-serif text-sm font-bold text-charcoal">
          {formatCurrency(item.price * item.quantity, 'AUD')}
        </p>
      </div>
    </div>
  )
}

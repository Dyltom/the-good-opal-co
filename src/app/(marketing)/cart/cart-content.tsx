'use client'

/**
 * Cart Page Content Client Component
 *
 * Handles cart item manipulation with server actions.
 * Receives initial cart data from server component.
 */

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { removeFromCart, updateQuantity, clearCart } from './actions'
import { CartClearConfirmDialog } from '@/components/ui/cart-clear-confirm-dialog'
import type { Cart, CartItem } from '@/lib/cart'

interface CartPageContentProps {
  initialCart: Cart
}

export function CartPageContent({ initialCart }: CartPageContentProps) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isPending, startTransition] = useTransition()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRemoveItem = (productId: string, name: string) => {
    startTransition(async () => {
      const result = await removeFromCart(productId)
      if (result.success && result.data) {
        setCart(result.data)
        window.dispatchEvent(new CustomEvent('cart-updated'))
        toast({
          title: 'Item removed',
          description: `${name} has been removed from your cart.`,
        })
        // Refresh if cart is empty
        if (result.data.items.length === 0) {
          router.refresh()
        }
      }
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number, name: string) => {
    startTransition(async () => {
      const result = await updateQuantity(productId, quantity)
      if (result.success && result.data) {
        setCart(result.data)
        window.dispatchEvent(new CustomEvent('cart-updated'))
        if (quantity > 0) {
          toast({
            title: 'Quantity updated',
            description: `${name} quantity updated to ${quantity}.`,
          })
        }
        // Refresh if cart is empty
        if (result.data.items.length === 0) {
          router.refresh()
        }
      }
    })
  }

  const handleClearCartClick = () => {
    setShowClearDialog(true)
  }

  const handleConfirmClearCart = () => {
    startTransition(async () => {
      const result = await clearCart()
      if (result.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        toast({
          title: 'Cart cleared',
          description: 'All items have been removed from your cart.',
          variant: 'destructive',
        })
        router.refresh()
      }
    })
  }

  return (
    <Container className="py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Your Magical Cart' },
        ]}
        className="mb-8"
      />

      {/* Magical Cart Header */}
      <div className="text-center mb-12">
        <span className="font-accent text-xl text-transparent bg-clip-text bg-gradient-to-r from-opal-electric to-fire-pink mb-4 block animate-sparkle">
          ✨ Your Collection ✨
        </span>
        <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">
          Magical <span className="font-accent text-opal-electric">Treasures</span>
        </h1>
        <p className="font-accent text-base text-opal-electric/70">
          ~ {cart.itemCount} {cart.itemCount === 1 ? 'treasure awaits' : 'treasures await'} your decision ~
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="font-sans text-charcoal/60">
          <span className="font-semibold text-opal-electric">{cart.itemCount}</span> {cart.itemCount === 1 ? 'item' : 'items'} in your magical collection
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCartClick}
          disabled={isPending}
          className="text-charcoal/60 hover:text-fire-pink hover:bg-fire-pink/10 transition-all rounded-xl"
        >
          <span className="font-accent mr-1">🗑️</span>
          Clear Cart
        </Button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onRemove={() => handleRemoveItem(item.productId, item.name)}
            onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty, item.name)}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Magical Cart Summary */}
      <Card className="p-8 bg-gradient-to-br from-white/95 via-white/90 to-opal-electric/5 backdrop-blur-sm border border-warm-grey/20 shadow-2xl rounded-3xl">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-2 flex items-center justify-center gap-2">
              <span className="font-accent text-opal-electric">💎</span>
              Order Summary
              <span className="font-accent text-opal-electric">💎</span>
            </h2>
            <p className="font-accent text-sm text-opal-electric/70">
              ~ Your magical collection total ~
            </p>
          </div>

          <div className="flex justify-between items-center text-lg border-b border-warm-grey/20 pb-4">
            <span className="font-serif text-charcoal">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'treasure' : 'treasures'}):</span>
            <span className="font-serif font-bold text-2xl text-charcoal">{formatCurrency(cart.total, 'AUD')}</span>
          </div>
          <p className="font-sans text-sm text-charcoal/60 text-center">
            ✨ Shipping calculated at checkout. Free shipping on orders over $500 AUD ✨
          </p>
          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="flex-1 h-12 rounded-xl border-warm-grey/30 bg-white/50 hover:bg-opal-electric/10 hover:border-opal-electric/50 transition-all font-serif"
            >
              <Link href="/store">
                <span className="font-accent mr-2">🛍️</span>
                Continue Shopping
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-opal-electric to-opal-deep text-white hover:from-opal-deep hover:to-opal-electric shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-serif"
            >
              <Link href="/checkout">
                <span className="font-accent mr-2">✨</span>
                Claim Your Treasures
                <span className="font-accent ml-2">✨</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </Container>

      <CartClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClearCart}
        itemCount={cart.itemCount}
      />
    </Container>
  )
}

/**
 * Individual cart item row
 */
interface CartItemRowProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

function CartItemRow({ item, onRemove, onUpdateQuantity, isPending }: CartItemRowProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white/95 via-white/90 to-opal-electric/5 backdrop-blur-sm border border-warm-grey/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex gap-6">
        {/* Magical Product Image */}
        <Link href={`/store/${item.slug}`} className="flex-shrink-0 group">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center shadow-lg border border-warm-grey/30">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={112}
                height={112}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-opal-electric/30 to-fire-pink/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-opal-electric/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Magical Product Info */}
        <div className="flex-1">
          <Link href={`/store/${item.slug}`} className="hover:text-opal-electric transition-colors">
            <h3 className="font-serif text-xl font-semibold mb-2 text-charcoal">{item.name}</h3>
          </Link>
          <p className="font-sans text-charcoal/60 text-sm mb-4">
            <span className="font-accent text-opal-electric">💎</span> {formatCurrency(item.price, 'AUD')} each
          </p>

          <div className="flex items-center gap-4">
            {/* Magical Quantity Controls */}
            <div className="flex items-center gap-2 bg-white/50 rounded-xl p-1 border border-warm-grey/20">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isPending}
                aria-label={`Decrease quantity of ${item.name}`}
                className="h-8 w-8 rounded-lg hover:bg-opal-electric/10 hover:text-opal-electric text-base transition-colors"
              >
                −
              </Button>
              <span className="w-12 text-center font-serif font-semibold text-charcoal">{item.quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending}
                aria-label={`Increase quantity of ${item.name}`}
                className="h-8 w-8 rounded-lg hover:bg-opal-electric/10 hover:text-opal-electric text-base transition-colors"
              >
                +
              </Button>
            </div>

            {/* Magical Remove Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              disabled={isPending}
              aria-label={`Remove ${item.name} from cart`}
              className="text-charcoal/60 hover:text-fire-pink hover:bg-fire-pink/10 transition-all rounded-xl font-sans"
            >
              <span className="font-accent mr-1">🗑️</span>
              Remove
            </Button>
          </div>
        </div>

        {/* Magical Item Total */}
        <div className="text-right">
          <p className="font-serif text-xl font-bold text-charcoal mb-1">{formatCurrency(item.price * item.quantity, 'AUD')}</p>
          <p className="font-sans text-sm text-charcoal/60">
            {item.quantity} × {formatCurrency(item.price, 'AUD')}
          </p>
        </div>
      </div>
    </Card>
  )
}

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
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { removeFromCart, updateQuantity, clearCart } from './actions'
import type { Cart, CartItem } from '@/lib/cart'

interface CartPageContentProps {
  initialCart: Cart
}

export function CartPageContent({ initialCart }: CartPageContentProps) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isPending, startTransition] = useTransition()
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

  const handleClearCart = () => {
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
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-charcoal/60">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
        <Button variant="ghost" size="sm" onClick={handleClearCart} disabled={isPending} className="text-charcoal/60 hover:text-fire-coral">
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

      {/* Cart Summary */}
      <Card className="p-8 bg-white border-gray-soft shadow-lg rounded-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center text-lg">
            <span className="text-charcoal">Subtotal ({cart.itemCount} items):</span>
            <span className="font-bold text-2xl text-opal-deep">{formatCurrency(cart.total, 'AUD')}</span>
          </div>
          <p className="text-sm text-charcoal/60">
            Shipping calculated at checkout. Free shipping on orders over $500 AUD.
          </p>
          <div className="flex gap-4 pt-2">
            <Button size="lg" variant="outline" asChild className="flex-1">
              <Link href="/store">Continue Shopping</Link>
            </Button>
            <Button size="lg" variant="shimmer" asChild className="flex-1">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </Card>
    </>
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
    <Card className="p-6 bg-white border-gray-soft rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-6">
        {/* Product Image */}
        <Link href={`/store/${item.slug}`} className="flex-shrink-0 group">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-black-rich flex items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={96}
                height={96}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1">
          <Link href={`/store/${item.slug}`} className="hover:text-opal-electric transition-colors">
            <h3 className="font-semibold text-lg mb-1 text-charcoal">{item.name}</h3>
          </Link>
          <p className="text-charcoal/60 text-sm mb-4">
            {formatCurrency(item.price, 'AUD')} each
          </p>

          <div className="flex items-center gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isPending}
                aria-label={`Decrease quantity of ${item.name}`}
                className="h-8 w-8 rounded-full hover:bg-gray-whisper"
              >
                −
              </Button>
              <span className="w-10 text-center font-medium text-charcoal">{item.quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending}
                aria-label={`Increase quantity of ${item.name}`}
                className="h-8 w-8 rounded-full hover:bg-gray-whisper"
              >
                +
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              disabled={isPending}
              aria-label={`Remove ${item.name} from cart`}
              className="text-charcoal/60 hover:text-fire-coral hover:bg-fire-coral/10"
            >
              Remove
            </Button>
          </div>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <p className="text-lg font-bold text-opal-deep">{formatCurrency(item.price * item.quantity, 'AUD')}</p>
          <p className="text-sm text-charcoal/60">
            {item.quantity} × {formatCurrency(item.price, 'AUD')}
          </p>
        </div>
      </div>
    </Card>
  )
}

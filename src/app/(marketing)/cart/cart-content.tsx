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
        <p className="text-muted-foreground">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
        <Button variant="outline" size="sm" onClick={handleClearCart} disabled={isPending}>
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
      <Card className="p-6 bg-muted">
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal ({cart.itemCount} items):</span>
            <span className="font-bold">{formatCurrency(cart.total, 'AUD')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Shipping calculated at checkout. Free shipping on orders over $500 AUD.
          </p>
          <div className="flex gap-4">
            <Button size="lg" variant="outline" asChild className="flex-1">
              <Link href="/store">Continue Shopping</Link>
            </Button>
            <Button size="lg" asChild className="flex-1">
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
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Product Image */}
        <Link href={`/store/${item.slug}`} className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">💎</span>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1">
          <Link href={`/store/${item.slug}`} className="hover:text-opal-blue transition-colors">
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          </Link>
          <p className="text-muted-foreground text-sm mb-4">
            {formatCurrency(item.price, 'AUD')} each
          </p>

          <div className="flex items-center gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isPending}
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </Button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending}
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              size="sm"
              variant="destructive"
              onClick={onRemove}
              disabled={isPending}
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </Button>
          </div>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <p className="text-lg font-bold">{formatCurrency(item.price * item.quantity, 'AUD')}</p>
          <p className="text-sm text-muted-foreground">
            {item.quantity} × {formatCurrency(item.price, 'AUD')}
          </p>
        </div>
      </div>
    </Card>
  )
}

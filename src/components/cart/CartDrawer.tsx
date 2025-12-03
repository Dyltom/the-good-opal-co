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
import { formatCurrency } from '@/lib/utils'
import { fetchCart, removeFromCart, updateQuantity } from '@/app/(marketing)/cart/actions'
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
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({isLoading ? '...' : itemCount} items)</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-full -mt-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full -mt-8 px-4">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-opal-blue to-opal-purple rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-charcoal">Start Your Collection</h3>
            <p className="text-charcoal-60 text-center mb-8 max-w-xs leading-relaxed">
              Discover one-of-a-kind Australian opals, each with its own unique play of color
            </p>
            <Button asChild size="lg" className="bg-opal-blue hover:bg-opal-blue-dark text-white shadow-lg w-full max-w-xs">
              <Link href="/store" onClick={() => setIsOpen(false)}>Explore Opals</Link>
            </Button>
          </div>
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

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total, 'AUD')}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/cart">View Full Cart</Link>
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
    <div className="flex gap-4 py-4 border-b">
      {/* Product Image */}
      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">💎</span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
        <p className="text-sm text-muted-foreground mb-2">
          {formatCurrency(item.price, 'AUD')} each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            disabled={isPending}
            aria-label={`Decrease quantity of ${item.name}`}
          >
            −
          </Button>
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={isPending}
            aria-label={`Increase quantity of ${item.name}`}
          >
            +
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs ml-auto"
            onClick={onRemove}
            disabled={isPending}
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="font-bold text-sm">
          {formatCurrency(item.price * item.quantity, 'AUD')}
        </p>
      </div>
    </div>
  )
}

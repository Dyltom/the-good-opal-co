'use client'

/**
 * Mobile-Optimized Cart Page Content
 * Better mobile UX with sticky summary and improved touch interactions
 */

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { removeFromCart, updateQuantity, clearCart } from './actions'
import type { Cart, CartItem } from '@/lib/cart'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { CartItemSkeleton } from '@/components/ui/LoadingStates'
import { useOptimisticCart, useCartItemAnimation } from '@/hooks/useOptimisticCart'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { mobileListItem, mobileStagger } from '@/lib/animations/mobile-variants'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface CartPageContentProps {
  initialCart: Cart
}

export function CartPageContentMobileOptimized({ initialCart }: CartPageContentProps) {
  const {
    cart,
    optimisticRemoveItem,
    optimisticUpdateQuantity
  } = useOptimisticCart(initialCart)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const { getItemAnimation } = useCartItemAnimation()
  const isMobile = useMediaQuery('(max-width: 1024px)')

  const handleRemoveItem = (productId: string, name: string) => {
    optimisticRemoveItem(productId, async () => {
      const result = await removeFromCart(productId)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        toast({
          title: 'Item removed',
          description: `${name} has been removed from your cart.`,
        })
        if (cart.items.length === 1) {
          router.refresh()
        }
      }
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      })
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number, name: string) => {
    if (quantity === 0) {
      handleRemoveItem(productId, name)
      return
    }

    optimisticUpdateQuantity(productId, quantity, async () => {
      const result = await updateQuantity(productId, quantity)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      })
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

  const shippingThreshold = 50000 // $500 AUD in cents
  const progressPercentage = Math.min((cart.total / shippingThreshold) * 100, 100)
  const remainingForFreeShipping = Math.max(shippingThreshold - cart.total, 0)

  // Mobile Summary Component
  const CartSummary = () => (
    <div className="bg-gray-whisper rounded-2xl p-6">
      <h2 className="text-xl font-display font-semibold text-charcoal mb-6">Order Summary</h2>

      <div className="space-y-4 pb-6 border-b border-gray-soft">
        <div className="flex justify-between text-sm">
          <span className="text-content-muted">Subtotal</span>
          <span className="font-medium text-charcoal">{formatCurrency(cart.total, 'AUD')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-content-muted">Shipping</span>
          <span className="font-medium text-charcoal">
            {cart.total >= shippingThreshold ? 'Free' : formatCurrency(1500, 'AUD')}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 mb-6">
        <span className="text-lg font-display font-medium text-charcoal">Total</span>
        <span className="text-2xl font-display font-bold text-opal-electric-accessible">
          {formatCurrency(
            cart.total + (cart.total >= shippingThreshold ? 0 : 1500),
            'AUD'
          )}
        </span>
      </div>

      <Button
        size="lg"
        asChild
        className="w-full bg-opal-electric hover:bg-opal-electric-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        disabled={cart.items.length === 0}
      >
        <Link href="/checkout">
          Proceed to Checkout
        </Link>
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Mobile Sticky Bottom Bar */}
      {isMobile && cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 lg:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold text-opal-electric-accessible">
              {formatCurrency(
                cart.total + (cart.total >= shippingThreshold ? 0 : 1500),
                'AUD'
              )}
            </span>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  View Summary
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                <CartSummary />
              </SheetContent>
            </Sheet>
            <Button asChild className="flex-1 bg-opal-electric hover:bg-opal-electric-dark">
              <Link href="/checkout">
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-display font-bold text-charcoal">Shopping Cart</h1>
                <p className="text-sm text-content-muted mt-1">
                  {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              {cart.items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={isPending}
                  className="text-content-muted hover:text-fire-pink-dark hidden sm:flex"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Free Shipping Progress - Mobile Optimized */}
            {cart.items.length > 0 && remainingForFreeShipping > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-opal-sky/10 rounded-xl border border-opal-electric-accessible/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                  <p className="text-sm font-medium text-charcoal">
                    Add {formatCurrency(remainingForFreeShipping, 'AUD')} more for free shipping!
                  </p>
                  <span className="text-xs text-content-muted">
                    Free shipping over $500
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-opal-electric to-opal-emerald"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Cart Items */}
            {isPending && cart.items.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={mobileStagger}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      variants={mobileListItem}
                      {...getItemAnimation('update')}
                    >
                      <CartItemRowMobile
                        item={item}
                        onRemove={() => handleRemoveItem(item.productId, item.name)}
                        onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty, item.name)}
                        isPending={isPending}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Continue Shopping */}
            <Link
              href="/store"
              className="inline-flex items-center gap-2 mt-6 text-opal-electric-accessible hover:text-opal-electric-accessible font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary Column - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile-optimized cart item row
 */
interface CartItemRowMobileProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

function CartItemRowMobile({ item, onRemove, onUpdateQuantity, isPending }: CartItemRowMobileProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex gap-3">
        {/* Product Image */}
        <Link href={`/store/${item.slug}`} className="flex-shrink-0 group">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white/60" />
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/store/${item.slug}`}
            className="text-sm font-semibold text-charcoal hover:text-opal-electric-accessible transition-colors line-clamp-2 mb-1"
          >
            {item.name}
          </Link>
          <p className="text-sm text-content-muted">
            {formatCurrency(item.price, 'AUD')}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isPending || item.quantity <= 1}
                aria-label={`Decrease quantity of ${item.name}`}
                className="h-8 w-8 rounded-none hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isPending}
                aria-label={`Increase quantity of ${item.name}`}
                className="h-8 w-8 rounded-none hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              disabled={isPending}
              aria-label={`Remove ${item.name} from cart`}
              className="h-8 w-8 text-content-muted hover:text-fire-pink-dark hover:bg-fire-pink/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-base font-bold text-opal-electric-accessible">
            {formatCurrency(item.price * item.quantity, 'AUD')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
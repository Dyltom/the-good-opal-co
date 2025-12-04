'use client'

/**
 * Improved Cart Page Content with Better Typography
 * Following 2025 UI/UX best practices
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

interface CartPageContentProps {
  initialCart: Cart
}

export function CartPageContent({ initialCart }: CartPageContentProps) {
  const {
    cart,
    optimisticRemoveItem,
    optimisticUpdateQuantity
  } = useOptimisticCart(initialCart)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const { getItemAnimation } = useCartItemAnimation()

  const handleRemoveItem = (productId: string, name: string) => {
    optimisticRemoveItem(productId, async () => {
      const result = await removeFromCart(productId)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        toast({
          title: 'Item removed',
          description: `${name} has been removed from your cart.`,
        })
        // Refresh if cart is empty
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
        toast({
          title: 'Quantity updated',
          description: `${name} quantity updated to ${quantity}.`,
        })
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="text-content-muted hover:text-fire-pink-dark"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Free Shipping Progress */}
          {cart.items.length > 0 && remainingForFreeShipping > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-opal-sky/10 rounded-xl border border-opal-electric/20"
            >
              <div className="flex items-center justify-between mb-2">
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
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  {...getItemAnimation('update')}
                  className="mb-4"
                >
                  <CartItemRow
                    item={item}
                    onRemove={() => handleRemoveItem(item.productId, item.name)}
                    onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty, item.name)}
                    isPending={isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Continue Shopping */}
          <Link
            href="/store"
            className="inline-flex items-center gap-2 mt-6 text-opal-electric-accessible hover:text-opal-electric font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-1">
          <div className="bg-gray-whisper rounded-2xl p-6 sticky top-24">
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

            {/* Security badges */}
            <div className="mt-6 pt-6 border-t border-gray-soft">
              <div className="flex items-center justify-center gap-4 text-xs text-content-muted">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Secure Checkout
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Improved cart item row with better visual hierarchy
 */
interface CartItemRowProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
}

function CartItemRow({ item, onRemove, onUpdateQuantity, isPending }: CartItemRowProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      <div className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/store/${item.slug}`} className="flex-shrink-0 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white/60" />
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 mr-4">
                <Link
                  href={`/store/${item.slug}`}
                  className="text-base sm:text-lg font-semibold text-charcoal hover:text-opal-electric-accessible transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-content-muted mt-1">
                  {formatCurrency(item.price, 'AUD')} each
                </p>
              </div>

              {/* Price on mobile */}
              <div className="sm:hidden text-right">
                <p className="text-lg font-bold text-opal-electric-accessible">
                  {formatCurrency(item.price * item.quantity, 'AUD')}
                </p>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onUpdateQuantity(item.quantity - 1)}
                    disabled={isPending || item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="h-8 w-8 rounded-none hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-charcoal select-none">
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
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRemove}
                  disabled={isPending}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-content-muted hover:text-fire-pink-dark hover:bg-fire-pink/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Price on desktop */}
              <div className="hidden sm:block text-right">
                <p className="text-xl font-bold text-opal-electric-accessible">
                  {formatCurrency(item.price * item.quantity, 'AUD')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
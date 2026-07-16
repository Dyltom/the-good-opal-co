'use client'

/**
 * Animated Cart Drawer Component
 *
 * Enhanced version with smooth animations and delightful interactions
 */

import { useEffect, useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CartItemSkeleton } from '@/components/ui/LoadingStates'
import { CartEmptyState } from '@/components/ui/EmptyStates'
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress'
import { formatCurrency } from '@/lib/utils'
import { fetchCart, removeFromCart, updateQuantity } from '@/app/(marketing)/cart/actions'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import type { Cart, CartItem } from '@/lib/cart'

interface AnimatedCartDrawerProps {
  children: React.ReactNode
  onCartUpdate?: () => void
}

export function AnimatedCartDrawer({ children, onCartUpdate }: AnimatedCartDrawerProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

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

  // Listen for cart updates
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
        setCart(result.data)
        onCartUpdate?.()
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
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Animated Header */}
        {/* pr-16 keeps the title clear of the close button */}
        <SheetHeader className="p-6 pb-4 pr-16 border-b">
          <SheetTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ repeat: isLoading ? Infinity : 0, duration: 2, ease: "linear" }}
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.div>
            <span>Your cart</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={itemCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-sm font-normal text-gray-500"
              >
                ({itemCount})
              </motion.span>
            </AnimatePresence>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your cart items, update quantities, track free shipping progress, and continue to secure checkout.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <CartEmptyState />
          </div>
        ) : (
          <>
            {/* Cart Items - Scrollable. Native overflow instead of Radix
                ScrollArea, whose display:table viewport defeats min-w-0
                truncation and lets rows overflow on narrow screens. */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <AnimatedCartItem
                    key={item.productId}
                    item={item}
                    onRemove={() => handleRemove(item.productId)}
                    onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty)}
                    isPending={isPending}
                    isRemoving={removingItems.has(item.productId)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Summary */}
            <div className="border-t bg-gradient-to-b from-gray-50 to-white p-6 space-y-4">
              {/* Total with animation */}
              <div className="relative">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-charcoal">
                    Subtotal
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={total}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-2xl font-semibold text-charcoal"
                    >
                      {formatCurrency(total, 'AUD')}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <FreeShippingProgress total={total} />

              {/* Actions with hover effects */}
              <div className="space-y-2 relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full h-12 text-base font-semibold bg-black hover:bg-gray-800"
                    size="lg"
                    asChild
                    onClick={() => {
                      setIsOpen(false)
                    }}
                  >
                    <Link href="/checkout">
                      Checkout securely
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/cart">View cart</Link>
                  </Button>
                </motion.div>

                <SheetClose asChild>
                  <Button variant="ghost" className="w-full h-10 text-charcoal/70 hover:text-charcoal">
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

/**
 * Individual animated cart item
 */
interface AnimatedCartItemProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
  isPending: boolean
  isRemoving: boolean
}

function AnimatedCartItem({
  item,
  onRemove,
  onUpdateQuantity,
  isPending,
  isRemoving
}: AnimatedCartItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        x: isRemoving ? 100 : 0,
        scale: isRemoving ? 0.8 : 1,
      }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex gap-4 py-4 border-b last:border-0"
    >
      {/* Product Image with hover effect */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 relative"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Shimmer effect on hover */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer-slide 1.5s ease-out infinite',
          }}
        />
      </motion.div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
        <p className="text-sm text-gray-500 mb-2">
          {formatCurrency(item.price, 'AUD')}
          {item.quantity > 1 ? ' each' : ''}
        </p>

        {/* Quantity Controls with animation */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            disabled={isPending || isRemoving}
            className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Decrease quantity of ${item.name}`}
          >
            <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.span
              key={item.quantity}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-sm font-medium w-8 text-center"
            >
              {item.quantity}
            </motion.span>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={isPending || isRemoving}
            className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Increase quantity of ${item.name}`}
          >
            <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRemove}
            disabled={isPending || isRemoving}
            className="ml-auto min-w-[44px] min-h-[44px] w-11 h-11 sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>

      {/* Item Total with animation */}
      <div className="text-right">
        <AnimatePresence mode="wait">
          <motion.p
            key={item.price * item.quantity}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="font-bold text-sm"
          >
            {formatCurrency(item.price * item.quantity, 'AUD')}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

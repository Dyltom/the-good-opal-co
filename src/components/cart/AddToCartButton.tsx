'use client'

/**
 * Unified Add to Cart Button
 *
 * Consolidates all AddToCart button variations into a single component.
 * Follows SOLID principles with configurable behavior through props.
 *
 * Features:
 * - Server Action integration with optimistic UI
 * - Multiple variants (default, icon, minimal)
 * - Optional animations
 * - Customizable sizes
 * - Success feedback states
 */

import { useState, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { addToCart, addToCartWithQuantity } from '@/app/(marketing)/cart/actions'
import { cn } from '@/lib/utils'
import { trackAddToCart } from '@/lib/analytics'
import type { ReactNode } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    image?: string
  }
  quantity?: number
  disabled?: boolean
  className?: string
  children?: ReactNode
  variant?: 'default' | 'icon' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  disabled,
  className,
  children,
  variant = 'default',
  size = 'md',
  animated = true,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const result = quantity > 1
        ? await addToCartWithQuantity({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
          }, quantity)
        : await addToCart({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
          })

      if (result.success) {
        setIsSuccess(true)

        trackAddToCart({
          id: product.id,
          name: product.name,
          price: product.price,
        }, quantity)

        // Dispatch custom event to update other cart components
        window.dispatchEvent(new CustomEvent('cart-updated'))

        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        })

        // Reset success state after animation
        setTimeout(() => setIsSuccess(false), 2000)
      } else {
        toast({
          title: 'Error',
          description: result.error ?? 'Failed to add item to cart.',
          variant: 'destructive',
        })
      }
    })
  }, [product, toast, quantity])

  const sizeClasses = {
    sm: 'min-h-[44px] h-11 px-4 text-sm sm:min-h-9 sm:h-9 sm:px-3',
    md: 'min-h-[44px] h-11 px-4 text-sm sm:min-h-10 sm:h-10',
    lg: 'h-12 px-6 text-base',
  }

  const iconSizeClasses = {
    sm: 'h-11 w-11 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9',
    md: 'h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-10 sm:min-w-10',
    lg: 'h-12 w-12',
  }

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  }

  // Icon variant
  if (variant === 'icon') {
    const button = (
      <button
        onClick={handleClick}
        disabled={disabled || isPending}
        aria-label={`Add ${product.name} to cart`}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-white text-charcoal shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          iconSizeClasses[size],
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 bg-green-500 flex items-center justify-center"
            >
              <Check className="text-white" size={iconSize[size]} />
            </motion.div>
          ) : isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="animate-spin" size={iconSize[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShoppingBag size={iconSize[size]} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    )

    return animated ? (
      <motion.div whileTap={{ scale: 0.95 }}>
        {button}
      </motion.div>
    ) : button
  }

  // Minimal variant
  if (variant === 'minimal') {
    const button = (
      <button
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative flex items-center gap-2 font-medium text-charcoal hover:text-opal-electric-accessible transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 text-green-600"
            >
              <Check size={iconSize[size]} />
              Added
            </motion.span>
          ) : isPending ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="animate-spin" size={iconSize[size]} />
              Adding...
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={iconSize[size]} />
              {children || 'Add to Cart'}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    )

    return animated ? (
      <motion.div whileTap={{ scale: 0.98 }}>
        {button}
      </motion.div>
    ) : button
  }

  // Default variant
  const button = (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold rounded-lg bg-charcoal text-white shadow-md hover:bg-charcoal/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {animated && (
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute inset-0 bg-green-500 flex items-center justify-center gap-2"
          >
            <Check size={iconSize[size]} />
            <span>Added to Cart!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={iconSize[size]} />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBag size={iconSize[size]} />
                <span>{children || 'Add to Cart'}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )

  return animated ? (
    <motion.div whileTap={{ scale: 0.98 }}>
      {button}
    </motion.div>
  ) : button
}

/**
 * Hook for custom add to cart implementations
 * Provides the core logic without UI components
 */
export function useAddToCart() {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const addToCartAction = useCallback(
    (product: AddToCartButtonProps['product']) => {
      startTransition(async () => {
        const result = await addToCart({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
        })

        if (result.success) {
          setIsSuccess(true)

          trackAddToCart({
            id: product.id,
            name: product.name,
            price: product.price,
          }, 1)

          setTimeout(() => setIsSuccess(false), 2000)
          window.dispatchEvent(new CustomEvent('cart-updated'))
          toast({
            title: 'Added to cart',
            description: `${product.name} has been added to your cart.`,
          })
        } else {
          toast({
            title: 'Error',
            description: result.error ?? 'Failed to add item to cart.',
            variant: 'destructive',
          })
        }
      })
    },
    [toast]
  )

  return {
    addToCart: addToCartAction,
    isPending,
    isSuccess,
  }
}

// For backwards compatibility with AnimatedAddToCartButton
export { AddToCartButton as AnimatedAddToCartButton }

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
 * - Optional animations and confetti
 * - Customizable sizes
 * - Success feedback states
 */

import { useState, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { addToCart } from '@/app/(marketing)/cart/actions'
import { cn } from '@/lib/utils'
import { trackAddToCart } from '@/lib/analytics'
import type { ReactNode } from 'react'

// Lazy load confetti only when needed
let confetti: typeof import('canvas-confetti').default | null = null

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    image?: string
  }
  disabled?: boolean
  className?: string
  children?: ReactNode
  variant?: 'default' | 'icon' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  showConfetti?: boolean
  animated?: boolean
}

export function AddToCartButton({
  product,
  disabled,
  className,
  children,
  variant = 'default',
  size = 'md',
  showConfetti = false,
  animated = true,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Load confetti on demand if needed
    if (showConfetti && !confetti) {
      confetti = (await import('canvas-confetti')).default
    }

    // Get button position for confetti origin
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

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

        // Track add to cart event
        // Create a minimal product object that satisfies the analytics tracking
        trackAddToCart({
          id: product.id,
          title: product.name,
          price: product.price,
          slug: product.slug
        } as any, 1) // TODO: Support quantity in future

        // Trigger confetti if enabled
        if (showConfetti && confetti) {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: {
              x: x / window.innerWidth,
              y: y / window.innerHeight
            },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
            disableForReducedMotion: true,
            startVelocity: 20,
            gravity: 0.5,
            ticks: 50
          })
        }

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
  }, [product, showConfetti, toast])

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
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

          // Track add to cart event
          trackAddToCart({
            id: product.id,
            title: product.name,
            price: product.price,
            slug: product.slug
          } as any, 1) // TODO: Support quantity in future

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
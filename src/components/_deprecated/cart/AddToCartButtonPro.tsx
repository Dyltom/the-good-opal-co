'use client'

/**
 * Professional Add to Cart Button
 * Clean design with better visual feedback
 */

import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'
import { addToCart } from '@/app/(marketing)/cart/actions'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  variant?: 'default' | 'icon' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

export function AddToCartButtonPro({
  product,
  disabled,
  className,
  variant = 'default',
  size = 'md',
  children,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = React.useState(false)
  const { toast } = useToast()

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCart({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      })

      if (result.success) {
        // Show success state
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)

        // Dispatch custom event to update other cart components
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
  }

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

  if (variant === 'icon') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-white text-charcoal shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          iconSizeClasses[size],
          className
        )}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
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
      </motion.button>
    )
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative flex items-center gap-2 font-medium text-charcoal hover:text-opal-electric-accessible transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          className
        )}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
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
      </motion.button>
    )
  }

  // Default variant
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold rounded-lg bg-charcoal text-white shadow-md hover:bg-charcoal/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
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
    </motion.button>
  )
}

// Export hook for custom implementations
export function useAddToCart() {
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = React.useState(false)
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
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 2000)
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
    showSuccess,
  }
}

import React, { useCallback } from 'react'
'use client'

/**
 * Animated Add to Cart Button
 *
 * Enhanced version with smooth animations and visual feedback
 */

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { addToCart } from '@/app/(marketing)/cart/actions'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import confetti from 'canvas-confetti'

interface AnimatedAddToCartButtonProps {
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
  variant?: 'default' | 'icon'
}

export function AnimatedAddToCartButton({
  product,
  disabled,
  className,
  children,
  variant = 'default'
}: AnimatedAddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

        // Trigger confetti
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

        // Dispatch custom event to update other cart components
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show toast with animation
        toast({
          title: (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Added to cart!</span>
            </motion.div>
          ),
          description: `${product.name} is now in your treasure chest.`,
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
  }

  if (variant === 'icon') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-all",
          "hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ scale: 1 }}
              animate={isPending ? {
                rotate: [0, -15, 15, -15, 15, 0],
                transition: { repeat: Infinity, duration: 0.5 }
              } : {}}
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        <AnimatePresence>
          {isPending && (
            <motion.span
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 rounded-full bg-white"
            />
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "relative px-6 py-3 bg-black text-white font-semibold rounded-full overflow-hidden",
        "hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {/* Background animation */}
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

      {/* Button content */}
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Added!</span>
          </motion.div>
        ) : isPending ? (
          <motion.div
            key="loading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.div>
            <span>Adding...</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{children || 'Add to Cart'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
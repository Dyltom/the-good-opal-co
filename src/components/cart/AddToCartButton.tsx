'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import {
  addToCart,
  addToCartFormAction,
  addToCartWithQuantity,
  fetchCart,
} from '@/app/(marketing)/cart/actions'
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
  onAdded?: () => void
}

async function bagLimitReached(productId: string): Promise<number | null> {
  const { data } = await fetchCart()
  const line = data?.items.find((item) => item.productId === productId)
  return line?.maxQuantity !== undefined && line.quantity >= line.maxQuantity ? line.maxQuantity : null
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
  onAdded,
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
        window.dispatchEvent(new CustomEvent('cart-updated'))
        onAdded?.()
        window.dispatchEvent(new CustomEvent('cart-open'))
        setTimeout(() => setIsSuccess(false), 2000)
      } else {
        const limit = await bagLimitReached(product.id)
        if (limit === null) {
          toast({
            title: "Couldn't add to bag",
            description: result.error ?? 'Please try again in a moment.',
            variant: 'destructive',
          })
          return
        }
        toast({
          title: 'Already in your bag',
          description:
            limit > 1
              ? `All ${limit} available of ${product.name} are already in your bag.`
              : `${product.name} is one of a kind and is already in your bag.`,
          action: (
            <ToastAction altText="View bag" asChild className="min-h-11">
              <Link href="/cart">View bag</Link>
            </ToastAction>
          ),
        })
      }
    })
  }, [product, toast, quantity, onAdded])

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

  const withForm = (button: ReactNode, tapScale: number) => {
    const form = (
      <form action={addToCartFormAction} className="contents">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="slug" value={product.slug} />
        <input type="hidden" name="name" value={product.name} />
        <input type="hidden" name="price" value={product.price} />
        {product.image ? <input type="hidden" name="image" value={product.image} /> : null}
        <input type="hidden" name="quantity" value={quantity} />
        {button}
      </form>
    )

    return animated ? <motion.div whileTap={{ scale: tapScale }}>{form}</motion.div> : form
  }

  if (variant === 'icon') {
    const button = (
      <button
        type="submit"
        onClick={handleClick}
        disabled={disabled || isPending}
        aria-label={`Add ${product.name} to bag`}
        className={cn(
          "relative flex items-center justify-center rounded-full border border-rule bg-bg text-ink shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
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
              className="absolute inset-0 bg-success flex items-center justify-center"
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

    return withForm(button, 0.95)
  }

  if (variant === 'minimal') {
    const button = (
      <button
        type="submit"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative flex items-center gap-2 font-medium text-ink hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
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
              className="flex items-center gap-2 text-success"
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
              Adding…
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={iconSize[size]} />
              {children || 'Add to bag'}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    )

    return withForm(button, 0.98)
  }

  const button = (
    <button
      type="submit"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold rounded-sm bg-ink text-bg shadow-md hover:bg-[#3a332b] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
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
            className="absolute inset-0 bg-success flex items-center justify-center gap-2"
          >
            <Check size={iconSize[size]} />
            <span>Added</span>
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
                <span>Adding…</span>
              </>
            ) : (
              <>
                <ShoppingBag size={iconSize[size]} />
                <span>{children || 'Add to bag'}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )

  return withForm(button, 0.98)
}

'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { addToCart, addToCartFormAction, fetchCart } from '@/app/(marketing)/cart/actions'
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
  return line?.maxQuantity !== undefined && line.quantity >= line.maxQuantity
    ? line.maxQuantity
    : null
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

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      startTransition(async () => {
        const result = await addToCart(product.id, quantity)

        if (result.success) {
          setIsSuccess(true)
          trackAddToCart(
            {
              id: product.id,
              name: product.name,
              price: product.price,
            },
            quantity
          )
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
    },
    [product, toast, quantity, onAdded]
  )

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

  const tapClass = animated && 'active:scale-[0.98]'

  const withForm = (button: ReactNode) => {
    return (
      <form action={addToCartFormAction} className="contents">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="quantity" value={quantity} />
        {button}
      </form>
    )
  }

  if (variant === 'icon') {
    const button = (
      <button
        type="submit"
        onClick={handleClick}
        disabled={disabled || isPending}
        aria-label={`Add ${product.name} to bag`}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full border border-rule bg-bg text-ink shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50',
          iconSizeClasses[size],
          animated && 'active:scale-95',
          className
        )}
      >
        {isSuccess ? (
          <div
            key="success"
            className="animate-fade-in absolute inset-0 flex items-center justify-center bg-success"
          >
            <Check className="text-white" size={iconSize[size]} />
          </div>
        ) : isPending ? (
          <div key="loading" className="animate-fade-in">
            <Loader2 className="animate-spin" size={iconSize[size]} />
          </div>
        ) : (
          <div key="default" className="animate-fade-in">
            <ShoppingBag size={iconSize[size]} />
          </div>
        )}
      </button>
    )

    return withForm(button)
  }

  if (variant === 'minimal') {
    const button = (
      <button
        type="submit"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          'relative flex items-center gap-2 font-medium text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          tapClass,
          className
        )}
      >
        {isSuccess ? (
          <span key="success" className="animate-fade-in flex items-center gap-2 text-success">
            <Check size={iconSize[size]} />
            Added
          </span>
        ) : isPending ? (
          <span key="loading" className="animate-fade-in flex items-center gap-2">
            <Loader2 className="animate-spin" size={iconSize[size]} />
            Adding…
          </span>
        ) : (
          <span key="default" className="animate-fade-in flex items-center gap-2">
            <ShoppingBag size={iconSize[size]} />
            {children || 'Add to bag'}
          </span>
        )}
      </button>
    )

    return withForm(button)
  }

  const button = (
    <button
      type="submit"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        'relative flex items-center justify-center gap-2 overflow-hidden rounded-sm bg-ink font-semibold text-bg shadow-md transition-all hover:bg-[#3a332b] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        tapClass,
        className
      )}
    >
      {animated && isPending && (
        <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {isSuccess ? (
        <div
          key="success"
          className="animate-rise-in absolute inset-0 flex items-center justify-center gap-2 bg-success"
        >
          <Check size={iconSize[size]} />
          <span>Added</span>
        </div>
      ) : (
        <div key="default" className="flex items-center gap-2">
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
        </div>
      )}
    </button>
  )

  return withForm(button)
}

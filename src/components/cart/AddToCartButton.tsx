'use client'

/**
 * Add to Cart Button
 *
 * Client component that adds product to cart using Server Actions.
 * Uses React 19's useTransition for optimistic UI updates.
 *
 * Benefits over Context-based approach:
 * - Works with SSR and Server Components
 * - No client-side state to sync
 * - Automatic revalidation
 */

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { addToCart } from '@/app/(marketing)/cart/actions'
import type { ReactNode } from 'react'

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
}

export function AddToCartButton({
  product,
  disabled,
  className,
  children,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
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

  return (
    <Button
      size="lg"
      className={className ?? 'flex-1'}
      disabled={disabled ?? isPending}
      onClick={handleClick}
    >
      {isPending ? 'Adding...' : (children ?? 'Add to Cart')}
    </Button>
  )
}

'use client'

import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
  }
  quantity?: number
  disabled?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Add to Cart Button
 *
 * Client component that adds product to cart with toast notification
 */
export function AddToCartButton({
  product,
  quantity = 1,
  disabled,
  className,
  children
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
    })

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Button
      size="lg"
      className={className || "flex-1"}
      disabled={disabled}
      onClick={handleAddToCart}
    >
      {children || 'Add to Cart'}
    </Button>
  )
}

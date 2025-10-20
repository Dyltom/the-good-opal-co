'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductActionsProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    stock: number
  }
}

/**
 * Product Actions Component
 *
 * Client component that handles quantity selection and add to cart
 */
export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)

  const isOutOfStock = product.stock === 0

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            min={1}
            max={Math.min(product.stock, 99)}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {isOutOfStock ? (
          <Button size="lg" className="flex-1" disabled>
            Out of Stock
          </Button>
        ) : (
          <AddToCartButton product={product} quantity={quantity} />
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/store">← Back to Store</Link>
        </Button>
      </div>
    </div>
  )
}

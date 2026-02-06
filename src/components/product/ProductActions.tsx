'use client'

/**
 * Product Actions Component
 *
 * Client component that handles quantity selection and add to cart.
 * Works with the new cookie-based cart system.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { QuantitySelector } from '@/components/ui/quantity-selector'

interface ProductActionsProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    stock: number
    image?: string
  }
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const isOutOfStock = product.stock === 0

  return (
    <div className="space-y-6">
      {/* Stock Status */}
      {product.stock > 0 && product.stock <= 5 && (
        <p className="text-sm text-amber-600 font-medium">
          Only {product.stock} left in stock - order soon!
        </p>
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            max={Math.min(product.stock, 99)}
            disabled={isOutOfStock}
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
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
            }}
            quantity={quantity}
          />
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    </div>
  )
}

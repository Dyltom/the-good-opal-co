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
import { formatCurrency } from '@/lib/utils'

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
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {isOutOfStock ? (
          <Button size="lg" className="w-full sm:flex-1" disabled>
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
            size="lg"
            animated={false}
            className="w-full sm:flex-1"
          />
        )}
        <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>

      <div className="h-24 lg:hidden" aria-hidden="true" />

      {/* Mobile sticky purchase bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/30 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-screen-sm items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-xs font-medium text-charcoal/55">
              {isOutOfStock ? 'Currently unavailable' : 'Ready to add'}
            </p>
            <p className="truncate font-serif text-lg font-semibold text-charcoal">
              {formatCurrency(product.price, 'AUD')}
            </p>
          </div>
          {isOutOfStock ? (
            <Button size="lg" className="h-12 flex-1 rounded-xl" disabled>
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
              size="lg"
              animated={false}
              className="h-12 flex-1 rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  )
}

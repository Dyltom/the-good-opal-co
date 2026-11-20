'use client'

import { useEffect, useRef, useState } from 'react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Button } from '@/components/ui/button'
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
  const [showStickyPurchaseBar, setShowStickyPurchaseBar] = useState(false)
  const inlineActionsRef = useRef<HTMLDivElement>(null)
  const isOutOfStock = product.stock === 0
  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
  }

  useEffect(() => {
    const actions = inlineActionsRef.current
    if (!actions || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyPurchaseBar(Boolean(entry && !entry.isIntersecting))
      },
      { rootMargin: '0px 0px -96px 0px', threshold: 0.1 }
    )

    observer.observe(actions)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="space-y-4">
      {!isOutOfStock && product.stock > 1 ? (
        <div>
          <label className="mb-2 block text-sm font-medium">Quantity</label>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            max={Math.min(product.stock, 99)}
          />
        </div>
      ) : null}

      <div ref={inlineActionsRef} data-testid="inline-product-actions">
        {isOutOfStock ? (
          <Button size="lg" className="h-14 w-full" disabled>
            Collected
          </Button>
        ) : (
          <AddToCartButton
            product={cartProduct}
            quantity={quantity}
            size="lg"
            animated={false}
            className="h-14 w-full text-base"
          />
        )}
      </div>

      {showStickyPurchaseBar ? (
        <div
          role="region"
          aria-label="Quick purchase"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/50 bg-cream px-4 py-3 lg:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-screen-sm items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-xs text-charcoal/60">{product.name}</p>
              <p className="font-serif text-lg font-semibold tabular-nums text-charcoal">
                {formatCurrency(product.price, 'AUD')}
              </p>
            </div>
            {isOutOfStock ? (
              <Button size="lg" className="h-12 flex-1" disabled>
                Collected
              </Button>
            ) : (
              <AddToCartButton
                product={cartProduct}
                quantity={quantity}
                size="lg"
                animated={false}
                className="h-12 flex-1"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  children?: ReactNode
}

const addButtonClass = 'rounded-sm font-medium shadow-none hover:shadow-none'

export function ProductActions({ product, children }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [showStickyPurchaseBar, setShowStickyPurchaseBar] = useState(false)
  const inlineActionsRef = useRef<HTMLDivElement>(null)
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
    <div>
      {product.stock > 1 ? (
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[13px] text-ink-2">Quantity</span>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            max={Math.min(product.stock, 99)}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div ref={inlineActionsRef} data-testid="inline-product-actions">
          <AddToCartButton
            product={cartProduct}
            quantity={quantity}
            size="lg"
            animated={false}
            className={`h-[50px] w-full text-[15px] md:h-12 ${addButtonClass}`}
          >
            Add to bag
          </AddToCartButton>
        </div>
        {children}
      </div>

      {showStickyPurchaseBar ? (
        <div
          role="region"
          aria-label="Quick purchase"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-bg px-gut py-2.5 lg:hidden"
          style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-screen-sm items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-[15px] italic leading-5 text-ink">{product.name}</p>
              <p className="text-sm font-medium text-ink">{formatCurrency(product.price, 'AUD')}</p>
            </div>
            <AddToCartButton
              product={cartProduct}
              quantity={quantity}
              size="lg"
              animated={false}
              className={`h-12 flex-none px-5 text-[15px] ${addButtonClass}`}
            >
              Add to bag
            </AddToCartButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}

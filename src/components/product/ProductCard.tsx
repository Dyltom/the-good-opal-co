'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    description: string
    price: number
    compareAtPrice?: number
    stock: number
    featured?: boolean
    category?: string
    image?: string
  }
}

/**
 * Clean Premium Product Card
 * Image-first, minimal framing, maximum visual space
 */
export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stock > 0

  return (
    <div className={`group ${!isAvailable ? 'opacity-60' : ''}`}>
      {/* Image Container - Maximum Space */}
      <Link href={`/store/${product.slug}`} className="block relative mb-3.5">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-500">
          {/* Product Image - Full Coverage */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || '/images/placeholder-opal.jpg'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
              isAvailable ? 'group-hover:scale-[1.03]' : 'grayscale'
            }`}
          />

          {/* Sold Overlay - Much More Obvious */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-charcoal/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide">Already Collected</span>
              <span className="text-xs text-white/80 font-medium">This treasure has found its home</span>
            </div>
          )}

          {/* Hover: Quick Add */}
          {isAvailable && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                }}
                className="w-full bg-opal-blue text-white hover:bg-opal-blue-dark font-medium py-3 rounded-lg transition-all duration-200 text-sm tracking-wide shadow-lg"
              >
                Add to Pouch
              </AddToCartButton>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <Link href={`/store/${product.slug}`}>
          <h3 className={`font-semibold text-base leading-snug transition-colors duration-200 line-clamp-2 min-h-[2.75rem] ${
            isAvailable ? 'text-charcoal group-hover:text-opal-blue' : 'text-charcoal-60'
          }`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          {isAvailable ? (
            <>
              <p className="text-lg font-bold text-opal-blue">
                {formatCurrency(product.price, 'USD')}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-sm text-charcoal-60 line-through">
                  {formatCurrency(product.compareAtPrice, 'USD')}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-medium text-charcoal-60">
              No longer available
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

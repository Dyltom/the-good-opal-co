'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, ShoppingBag } from 'lucide-react'

/**
 * Product interface following Interface Segregation Principle
 * Only includes properties needed for card display
 */
interface ProductCardProduct {
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

interface ProductCardProps {
  product: ProductCardProduct
  index?: number
  /** Use 'dark' when card is on dark backgrounds */
  variant?: 'light' | 'dark'
}

/**
 * Enhanced ProductCard Component
 *
 * Features:
 * - Dark background for opal color pop
 * - Gradient border on hover
 * - Staggered fade-up animation
 * - Quick add to cart overlay
 * - Wishlist button
 * - Featured/category badges
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only handles product card display
 * - Open/Closed: Extendable via props without modification
 * - Interface Segregation: Uses focused ProductCardProduct interface
 */
export function ProductCard({ product, index = 0, variant = 'light' }: ProductCardProps) {
  const isAvailable = product.stock > 0
  const isDark = variant === 'dark'

  return (
    <div
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <Link href={`/store/${product.slug}`} className="block">
        {/* Image Container - DARK background for opal pop */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black-rich mb-4 shadow-lg group-hover:shadow-glow transition-all duration-500">
          {/* Gradient Border on Hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-pink to-opal-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
            <div className="absolute inset-[1px] rounded-2xl bg-black-rich" />
          </div>

          {/* Product Image */}
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-700 ease-out ${
                  isAvailable
                    ? 'group-hover:scale-105'
                    : 'grayscale opacity-60'
                }`}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/placeholder-opal.jpg"
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                  isAvailable
                    ? 'group-hover:scale-105'
                    : 'grayscale opacity-60'
                }`}
              />
            )}
          </div>

          {/* Sold Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black-rich/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-white font-medium tracking-wide text-sm">Collected</span>
              </div>
            </div>
          )}

          {/* Quick Actions on Hover */}
          {isAvailable && (
            <div
              className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="flex gap-2">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                  }}
                  className="flex-1 bg-white text-charcoal hover:bg-opal-electric hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </AddToCartButton>
                <button
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-fire-pink hover:text-white shadow-lg transition-all duration-200"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-3 right-3 z-10">
              <div className="px-3 py-1.5 bg-gradient-to-r from-opal-electric to-fire-pink rounded-lg shadow-lg">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Featured</span>
              </div>
            </div>
          )}

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-3 left-3 z-10">
              <div className="px-3 py-1.5 bg-black-rich/80 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{product.category.replace(/-/g, ' ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 px-1 py-3">
          <h3 className={`font-medium text-base leading-snug transition-colors duration-200 line-clamp-2 ${
            isAvailable
              ? isDark
                ? 'text-white group-hover:text-opal-light'
                : 'text-charcoal group-hover:text-opal-electric'
              : isDark ? 'text-white/50' : 'text-charcoal/50'
          }`}>
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            {isAvailable ? (
              <>
                <span className={`text-lg font-bold ${isDark ? 'text-opal-light' : 'text-opal-deep'}`}>
                  {formatCurrency(product.price, 'AUD')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className={`text-sm line-through ${isDark ? 'text-white/40' : 'text-charcoal/50'}`}>
                    {formatCurrency(product.compareAtPrice, 'AUD')}
                  </span>
                )}
              </>
            ) : (
              <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-charcoal/50'}`}>
                Sold
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

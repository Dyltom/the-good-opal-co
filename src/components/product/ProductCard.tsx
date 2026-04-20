'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatCurrency, cn } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, Eye } from 'lucide-react'
import { ProductQuickViewModal } from './ProductQuickViewModal'

/**
 * Unified Product Card Component
 *
 * Consolidates all product card variations into a single, flexible component.
 * Supports multiple display variants while following SOLID principles.
 *
 * Features:
 * - Multiple variants: default (dark bg), museum (clean white), minimal
 * - Framer Motion animations with performance optimization
 * - Smart badge logic (discount thresholds, new arrivals)
 * - Optional metadata display (stone origin/type)
 * - Wishlist functionality
 * - Accessible with proper focus management
 * - Performance optimized with lazy loading
 */

interface ProductCardProduct {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
  image?: string
  // Optional metadata for museum variant
  stoneOrigin?: string
  stoneType?: string
  createdAt?: string
}

interface ProductCardProps {
  product: ProductCardProduct
  index?: number
  /** Visual style variant */
  variant?: 'default' | 'museum' | 'minimal'
  /** Enable wishlist functionality */
  showWishlist?: boolean
  /** Show stone metadata (origin/type) */
  showMetadata?: boolean
  /** Enable entrance animations */
  animated?: boolean
  /** For dark backgrounds */
  darkBackground?: boolean
}

// Animation variants
const cardAnimations = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
}

const hoverLift = {
  // Removed hover lift animation for performance
}

export function ProductCard({
  product,
  index = 0,
  variant = 'default',
  showWishlist = true,
  showMetadata = false,
  animated = true,
  darkBackground = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const isAvailable = product.stock > 0

  // Calculate discount percentage
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // Check if product is new (created in last 7 days)
  const isNew = product.createdAt &&
    new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  // Base container with conditional animations
  const Container = animated ? motion.div : 'div'
  const containerProps = animated ? {
    ...cardAnimations,
    ...(variant === 'default' && darkBackground ? hoverLift : {}),
    transition: {
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.21, 1.02, 0.73, 1],
    },
  } : {}

  return (
    <>
      <Container {...containerProps} className="group">
        <div className={cn(
          "relative h-full",
          variant === 'museum' && "bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
        )}>
          {/* Badges */}
          {isAvailable && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isNew && (
              <span className="px-3 py-1 bg-black-rich text-white text-xs font-medium rounded-full">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="px-3 py-1 bg-fire-coral text-white text-xs font-medium rounded-full">
                {discount}% Off
              </span>
            )}
          </div>
        )}

        <Link
          href={`/store/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 rounded-lg"
        >
          {/* Image Container */}
          <div className={cn(
          "relative aspect-[4/5] overflow-hidden transition-all duration-500",
          variant === 'default' && !darkBackground && "bg-gradient-to-br from-gray-50 to-white",
          variant === 'default' && darkBackground && "bg-black-rich shadow-lg group-hover:shadow-glow rounded-2xl",
          variant === 'museum' && "bg-gray-50 group-hover:bg-gray-100",
          variant === 'minimal' && "bg-gray-100"
        )}>


          {/* Product Image */}
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-105",
                  !isAvailable && "grayscale opacity-60"
                )}
                style={variant === 'museum' && isAvailable ? {
                  filter: 'brightness(1.01) contrast(1.02) saturate(1.01)',
                } : undefined}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              </div>
            )}
          </div>

          {/* Sold Overlay */}
          {!isAvailable && (
            <motion.div
              initial={animated ? { opacity: 0, scale: 0.8 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className={cn(
                variant === 'museum'
                  ? "bg-black/70 backdrop-blur-sm text-center"
                  : "bg-black-rich/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10"
              )}>
                <span className={cn(
                  "text-white font-medium",
                  variant === 'museum' ? "text-sm tracking-[0.3em] uppercase" : "tracking-wide text-sm"
                )}>
                  {variant === 'museum' ? 'Claimed' : 'Collected'}
                </span>
                {variant === 'museum' && <div className="mt-1 h-px w-16 bg-white/30 mx-auto" />}
              </div>
            </motion.div>
          )}


          {/* Quick Actions on Hover */}
          {isAvailable && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300",
                variant === 'museum' ? "bg-gradient-to-t from-white/95 to-transparent" : "bg-gradient-to-t from-black/80 to-transparent"
              )}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="flex items-center gap-2">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  }}
                  variant="minimal"
                  size="sm"
                  className={cn(
                    "flex-1 rounded-full",
                    variant === 'museum'
                      ? "bg-black-rich text-white hover:bg-black-rich/90"
                      : "bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900"
                  )}
                  showConfetti
                />

                {/* Quick View */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowQuickView(true)
                  }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    variant === 'museum'
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700"
                  )}
                  aria-label="Quick view"
                >
                  <Eye size={18} />
                </button>

                {/* Wishlist */}
                {showWishlist && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsWishlisted(!isWishlisted)
                    }}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      isWishlisted
                        ? "bg-fire-coral text-white"
                        : variant === 'museum'
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700"
                    )}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} className={cn(isWishlisted && "fill-current")} />
                  </button>
                )}
              </div>
            </div>
          )}
          </div>
        </Link>

        {/* Product Info */}
        {variant === 'museum' ? (
          // Museum style info - Refined luxury
          <div className="p-4">
            <Link href={`/store/${product.slug}`}>
              <h3 className={cn(
                "font-serif text-base font-medium text-gray-900 mb-1 hover:text-opal-electric-accessible transition-colors",
                !isAvailable && "text-gray-400"
              )}>
                {product.name}
              </h3>
            </Link>

            {/* Metadata */}
            {showMetadata && (product.stoneOrigin || product.stoneType) && (
              <p className="text-sm text-gray-600 mb-2">
                {[product.stoneType, product.stoneOrigin].filter(Boolean).join(' • ')}
              </p>
            )}


            {/* Price and Actions */}
            <div className="flex items-end justify-between">
              {isAvailable ? (
                <div>
                  <span className="font-sans text-lg font-semibold text-gray-900">
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="ml-2 text-sm line-through text-gray-400">
                      {formatCurrency(product.compareAtPrice, 'AUD')}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  Sold
                </span>
              )}

            </div>
          </div>
        ) : (
          // Default style info
          <div className="p-4">
            <h3 className={cn(
              "font-serif text-lg mb-2 leading-tight",
              isAvailable
                ? darkBackground
                  ? "text-white group-hover:text-opal-deep"
                  : "text-charcoal"
                : darkBackground ? "text-content-secondary" : "text-gray-400"
            )}>
              {product.name}
            </h3>

            <div className="space-y-2">
              {isAvailable ? (
                <div>
                  <span className={cn(
                    "font-sans text-xl font-semibold",
                    darkBackground ? "text-white" : "text-charcoal"
                  )}>
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-sm line-through",
                        darkBackground ? "text-white/40" : "text-gray-400"
                      )}>
                        {formatCurrency(product.compareAtPrice, 'AUD')}
                      </span>
                      <span className="text-xs font-medium text-fire-coral">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  darkBackground ? "text-white/50" : "text-gray-400"
                )}>
                  Sold Out
                </span>
              )}
            </div>

            {/* Metadata for default variant */}
            {showMetadata && (product.stoneOrigin || product.stoneType) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.stoneOrigin && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    darkBackground
                      ? "bg-white/10 text-white/70"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  )}>
                    {product.stoneOrigin}
                  </span>
                )}
                {product.stoneType && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    darkBackground
                      ? "bg-white/10 text-white/70"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  )}>
                    {product.stoneType}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </Container>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  )
}
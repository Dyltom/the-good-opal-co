'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { formatCurrency, cn } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, ShoppingBag } from 'lucide-react'

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
  whileHover: { y: -8, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
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
    <Container {...containerProps} className="group">
      {/* Museum variant glow effect */}
      {variant === 'museum' && (
        <>
          {/* Base subtle gradient */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-gray-200/50 via-transparent to-gray-200/50 opacity-50" />

          {/* Hover gradient */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-opal-electric/40 via-fire-gold/20 to-opal-deep/40 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
        </>
      )}

      <Link
        href={`/store/${product.slug}`}
        className={cn(
          "block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 transition-all",
          variant === 'default' && !darkBackground && "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        )}
      >
        {/* Image Container */}
        <div className={cn(
          "relative aspect-[4/5] overflow-hidden transition-all duration-500",
          variant === 'default' && !darkBackground && "bg-gradient-to-br from-gray-50 to-white",
          variant === 'default' && darkBackground && "bg-black-rich shadow-lg group-hover:shadow-glow rounded-2xl",
          variant === 'museum' && "bg-gray-50",
          variant === 'minimal' && "bg-gray-100"
        )}>

          {/* Shimmer effect for museum variant */}
          {variant === 'museum' && animated && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 1.2, ease: 'linear' }}
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)',
              }}
            />
          )}

          {/* Product Image */}
          <motion.div
            className="relative w-full h-full"
            whileHover={animated ? { scale: 1.05 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-700",
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
          </motion.div>

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
          {isAvailable && variant === 'default' && (
            <motion.div
              initial={animated ? { opacity: 0, y: 20 } : {}}
              whileHover={animated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3 }}
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
                    image: product.image,
                  }}
                  className="flex-1 bg-white text-charcoal hover:bg-opal-electric hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </AddToCartButton>
                {showWishlist && (
                  <motion.button
                    whileTap={animated ? { scale: 0.95 } : {}}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-fire-pink hover:text-white shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-pink focus-visible:ring-offset-2"
                    aria-label="Add to wishlist"
                  >
                    <motion.div
                      animate={animated && isWishlisted ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        {variant === 'museum' ? (
          // Museum style info - Minimal luxury
          <div className="pt-4">
            <h3 className={cn(
              "text-sm font-medium text-charcoal mb-2",
              !isAvailable && "text-gray-400"
            )}>
              {product.name}
            </h3>

            {/* Metadata */}
            {showMetadata && (product.stoneOrigin || product.stoneType) && (
              <p className="text-xs text-gray-500 mb-3">
                {[product.stoneType, product.stoneOrigin].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline justify-between">
              {isAvailable ? (
                <span className="text-base text-charcoal">
                  {formatCurrency(product.price, 'AUD')}
                </span>
              ) : (
                <span className="text-sm text-gray-400">
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
                    "text-xl font-semibold",
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
      </Link>
    </Container>
  )
}
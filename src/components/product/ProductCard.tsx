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
    ...(variant === 'default' ? hoverLift : {}),
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
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-opal-electric/20 via-fire-gold/20 to-opal-deep/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      <Link
        href={`/store/${product.slug}`}
        className="block relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 transition-all"
      >
        {/* Image Container */}
        <div className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-2xl mb-4 transition-all duration-500",
          variant === 'default' && "bg-black-rich shadow-lg group-hover:shadow-glow",
          variant === 'museum' && "bg-white border border-gray-100 group-hover:shadow-xl",
          variant === 'minimal' && "bg-gray-100"
        )}>
          {/* Gradient border for default variant */}
          {variant === 'default' && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-pink to-opal-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
              <div className="absolute inset-[1px] rounded-2xl bg-black-rich" />
            </div>
          )}

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
            ) : product.image === undefined ? (
              <OptimizedImage
                src="/images/placeholder-opal.jpg"
                alt={product.name}
                aspectRatio="4:3"
                className={cn(
                  "transition-all duration-700",
                  !isAvailable && "grayscale opacity-60"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-300" />
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

          {/* Smart Badges */}
          <AnimatePresence>
            {/* Discount badge - only for 20%+ */}
            {discount >= 20 && isAvailable && (
              <motion.div
                initial={animated ? { opacity: 0, scale: 0, x: -20 } : {}}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-3 left-3 z-20"
              >
                <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-md">
                  -{discount}%
                </span>
              </motion.div>
            )}

            {/* New arrival badge */}
            {isNew && isAvailable && !discount && (
              <motion.div
                initial={animated ? { opacity: 0, scale: 0, x: -20 } : {}}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-3 left-3 z-20"
              >
                <span className="bg-black text-white text-xs font-medium px-2.5 py-1 rounded-md">
                  NEW
                </span>
              </motion.div>
            )}

            {/* Featured badge */}
            {product.featured && (
              <motion.div
                initial={animated ? { opacity: 0, scale: 0, rotate: -180 } : {}}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={animated ? { delay: 0.3, type: 'spring', stiffness: 200, damping: 15 } : {}}
                className="absolute top-3 right-3 z-20"
              >
                <div className="px-3 py-1.5 bg-gradient-to-r from-opal-electric to-fire-pink rounded-lg shadow-lg">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Featured</span>
                </div>
              </motion.div>
            )}

            {/* Category badge */}
            {product.category && variant === 'default' && (
              <motion.div
                initial={animated ? { opacity: 0, scale: 0 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 left-3 z-10"
              >
                <div className="px-3 py-1.5 bg-black-rich/80 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                    {product.category.replace(/-/g, ' ')}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
          // Museum style info
          <div className="space-y-4 px-1">
            {/* Name with divider */}
            <div>
              <h3 className={cn(
                "font-light text-lg leading-tight line-clamp-2 transition-all duration-500 tracking-wide",
                "text-charcoal group-hover:text-black",
                !isAvailable && "text-gray-500"
              )}>
                {product.name}
              </h3>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

            {/* Price section */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                Acquisition Value
              </p>
              <div className="flex items-baseline gap-3">
                {isAvailable ? (
                  <>
                    <span className="text-2xl font-light text-black tracking-tight">
                      {formatCurrency(product.price, 'AUD')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm line-through text-gray-400 font-light">
                        {formatCurrency(product.compareAtPrice, 'AUD')}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-light italic text-gray-500">
                    In Private Collection
                  </span>
                )}
              </div>
            </div>

            {/* Metadata */}
            {showMetadata && (product.stoneOrigin || product.stoneType) && (
              <div className="flex flex-wrap gap-3 text-[11px]">
                {product.stoneOrigin && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-opal-electric/30 to-opal-deep/30" />
                    <span className="font-light text-gray-600">{product.stoneOrigin}</span>
                  </div>
                )}
                {product.stoneType && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-fire-gold to-fire-orange opacity-50" />
                    <span className="font-light text-gray-600">{product.stoneType}</span>
                  </div>
                )}
              </div>
            )}

            {/* View Details CTA */}
            {isAvailable && (
              <motion.div
                initial={animated ? { opacity: 0 } : {}}
                whileHover={animated ? { opacity: 1 } : {}}
                className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <span className="text-xs font-medium text-opal-electric-accessible-dark-accessible tracking-wide flex items-center gap-1">
                  Examine Specimen
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </motion.div>
            )}
          </div>
        ) : (
          // Default style info
          <div className="space-y-2 px-1 py-3">
            <h3 className={cn(
              "font-medium text-base leading-snug transition-colors duration-200 line-clamp-2",
              isAvailable
                ? darkBackground
                  ? "text-white group-hover:text-opal-deep"
                  : "text-charcoal group-hover:text-opal-electric-accessible-dark-accessible"
                : darkBackground ? "text-content-secondary" : "text-content-muted"
            )}>
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2">
              {isAvailable ? (
                <>
                  <span className={cn(
                    "text-lg font-bold",
                    darkBackground ? "text-opal-deep" : "text-opal-deep"
                  )}>
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className={cn(
                      "text-sm line-through",
                      darkBackground ? "text-white/40" : "text-charcoal/50"
                    )}>
                      {formatCurrency(product.compareAtPrice, 'AUD')}
                    </span>
                  )}
                </>
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  darkBackground ? "text-white/50" : "text-charcoal/50"
                )}>
                  Sold
                </span>
              )}
            </div>

            {/* Metadata for default variant */}
            {showMetadata && (product.stoneOrigin || product.stoneType) && (
              <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                {product.stoneOrigin && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full",
                    darkBackground
                      ? "bg-white/10 text-white/70"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {product.stoneOrigin}
                  </span>
                )}
                {product.stoneType && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full",
                    darkBackground
                      ? "bg-white/10 text-white/70"
                      : "bg-gray-100 text-gray-600"
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
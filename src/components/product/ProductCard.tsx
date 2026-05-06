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
 * Gallery Product Card Component
 *
 * Image-first commerce surface for Australian opals.
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
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
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
  const stockStatus = isAvailable
    ? product.stock <= 3
      ? `Only ${product.stock} left`
      : 'In stock'
    : 'Sold out'

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
          variant === 'default' && !darkBackground && "overflow-hidden rounded-lg border border-warm-grey/30 bg-white shadow-sm transition-colors duration-300 hover:border-opal-electric-accessible/30",
          variant === 'default' && darkBackground && "overflow-hidden rounded-lg border border-white/10 bg-charcoal-dark transition-colors duration-300 hover:border-white/25",
          variant === 'museum' && "overflow-hidden rounded-lg border border-warm-grey/30 bg-white shadow-sm transition-colors duration-300 hover:border-opal-electric-accessible/25"
        )}>
          {/* Badges */}
          {isAvailable && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isNew && (
              <span className="px-3 py-1 bg-charcoal text-white text-xs font-medium rounded-full">
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
          "relative aspect-[3/4] overflow-hidden transition-all duration-500",
          variant === 'default' && !darkBackground && "bg-cream",
          variant === 'default' && darkBackground && "bg-charcoal-dark",
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
                priority={index < 4}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                className={cn(
                  "object-cover transition-opacity duration-500 group-hover:opacity-95",
                  !isAvailable && "grayscale opacity-60"
                )}
                style={variant === 'museum' && isAvailable ? {
                  filter: 'brightness(1.01) contrast(1.02) saturate(1.01)',
                } : undefined}
              />
            ) : (
              <div className="w-full h-full bg-cream flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-warm-grey/50 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              </div>
            )}
          </div>

          {/* Sold Overlay */}
          {!isAvailable && (
            <motion.div
              initial={animated ? { opacity: 0 } : {}}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="bg-charcoal/85 px-4 py-2 text-center">
                <span className={cn(
                  "text-white font-medium",
                  variant === 'museum' ? "text-sm uppercase" : "text-sm"
                )}>
                  {variant === 'museum' ? 'Claimed' : 'Collected'}
                </span>
                {variant === 'museum' && <div className="mt-1 h-px w-16 bg-white/30 mx-auto" />}
              </div>
            </motion.div>
          )}


          {/* Quick Actions */}
          {isAvailable && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-3 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 transition-all duration-300",
                variant === 'museum' ? "bg-white/95" : "bg-charcoal/80"
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
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 rounded-lg",
                    variant === 'museum'
                      ? "bg-charcoal text-white hover:bg-charcoal/90"
                      : "bg-white/95 hover:bg-white text-gray-900"
                  )}
                >
                  Quick add
                </AddToCartButton>

                {/* Quick view */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowQuickView(true)
                  }}
                  title="Quick view"
                  className={cn(
                    "min-h-[44px] min-w-[44px] rounded-lg p-3 transition-colors sm:min-h-9 sm:min-w-9 sm:p-2",
                    variant === 'museum'
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-white/95 hover:bg-white text-gray-700"
                  )}
                  aria-label={`Open quick view for ${product.name}`}
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
                      "min-h-[44px] min-w-[44px] rounded-full p-3 transition-all sm:min-h-9 sm:min-w-9 sm:p-2",
                      isWishlisted
                        ? "bg-fire-coral text-white"
                      : variant === 'museum'
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-white/95 hover:bg-white text-gray-700"
                    )}
                    aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
                    aria-pressed={isWishlisted}
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
            <p className={cn(
              "mt-2 font-sans text-xs font-medium",
              isAvailable ? "text-opal-emerald-dark" : "text-gray-500"
            )}>
              {stockStatus}
            </p>
          </div>
        ) : (
          // Default style info
          <div className="p-3">
            <h3 className={cn(
              "font-serif text-base mb-2 leading-tight",
              isAvailable
                ? darkBackground
                  ? "text-white group-hover:text-opal-light"
                  : "text-charcoal"
                : darkBackground ? "text-content-secondary" : "text-gray-400"
            )}>
              {product.name}
            </h3>

            <div className="space-y-2">
              {isAvailable ? (
                <div>
                  <span className={cn(
                    "font-sans text-lg font-semibold",
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
            <p className={cn(
              "font-sans text-xs font-medium",
              isAvailable
                ? darkBackground ? "text-opal-light" : "text-opal-emerald-dark"
                : darkBackground ? "text-white/50" : "text-gray-500"
            )}>
              {stockStatus}
            </p>

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

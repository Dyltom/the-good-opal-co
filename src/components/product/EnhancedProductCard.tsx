'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { formatCurrency, cn } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, ShoppingBag, Eye, Plus, Check } from 'lucide-react'
import { ProductQuickView } from './ProductQuickView'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/app/(marketing)/store/page'

interface EnhancedProductCardProps {
  product: Product
  index?: number
  variant?: 'default' | 'museum' | 'minimal'
  showWishlist?: boolean
  showMetadata?: boolean
  showQuickView?: boolean
  showCompare?: boolean
  animated?: boolean
  darkBackground?: boolean
  showRating?: boolean
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

/**
 * Enhanced Product Card with Micro-interactions
 * Phase 2.2 implementation with image hover preview and quick actions
 */
export function EnhancedProductCard({
  product,
  index = 0,
  variant = 'default',
  showWishlist = true,
  showMetadata = false,
  showQuickView = true,
  showCompare = true,
  animated = true,
  darkBackground = false,
  showRating = true,
}: EnhancedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [showQuickViewModal, setShowQuickViewModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const isAvailable = product.stock > 0
  const images = product.images || []
  const hasMultipleImages = images.length > 1

  // Calculate discount percentage
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // Check if product is new (created in last 7 days)
  const isNew = product.createdAt &&
    new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  // Handle image preview on hover
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasMultipleImages || !isHovering) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const segmentWidth = rect.width / images.length
    const newIndex = Math.floor(x / segmentWidth)

    if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentImageIndex(newIndex)
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setCurrentImageIndex(0)
  }

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
      <Container {...containerProps} className="group relative">
        {/* Museum variant glow effect */}
        {variant === 'museum' && (
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-opal-electric/20 via-fire-gold/20 to-opal-deep/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        )}

        {/* Compare Checkbox */}
        {showCompare && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering || isComparing ? 1 : 0 }}
            className={cn(
              "absolute top-2 left-2 z-20 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center transition-colors",
              isComparing ? "bg-opal-electric text-white" : "hover:bg-gray-100"
            )}
            onClick={(e) => {
              e.preventDefault()
              setIsComparing(!isComparing)
            }}
          >
            {isComparing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </motion.button>
        )}

        <div
          className={cn(
            "block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 transition-all",
            variant === 'default' && !darkBackground && "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          )}
        >
          {/* Image Container with hover preview */}
          <div
            className={cn(
              "relative aspect-[4/5] overflow-hidden transition-all duration-500 cursor-pointer",
              variant === 'default' && !darkBackground && "bg-gradient-to-br from-gray-50 to-white",
              variant === 'default' && darkBackground && "bg-black-rich shadow-lg group-hover:shadow-glow rounded-2xl",
              variant === 'museum' && "bg-gray-50",
              variant === 'minimal' && "bg-gray-100"
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              if (showQuickView && isHovering) {
                e.preventDefault()
                setShowQuickViewModal(true)
              }
            }}
          >
            {/* Image preview indicator dots */}
            {hasMultipleImages && isHovering && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      idx === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Product Images with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={animated && isHovering ? { opacity: 0 } : undefined}
                animate={{ opacity: 1 }}
                exit={animated && isHovering ? { opacity: 0 } : undefined}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
                whileHover={animated ? { scale: 1.05 } : {}}
                style={{ transitionDuration: '0.7s' }}
              >
                {images[currentImageIndex]?.image?.url ? (
                  <Image
                    src={images[currentImageIndex].image.url}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={cn(
                      "object-cover transition-all duration-700",
                      !isAvailable && "grayscale opacity-60"
                    )}
                    priority={index < 4}
                  />
                ) : (
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
                )}
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              {discount >= 20 && (
                <Badge className="bg-red-500 text-white shadow-md">
                  {discount}% OFF
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-gradient-to-r from-fire-gold to-fire-orange text-white shadow-md">
                  New
                </Badge>
              )}
              {product.stock > 0 && product.stock <= 3 && (
                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                  Only {product.stock} left
                </Badge>
              )}
            </div>

            {/* Sold Overlay */}
            {!isAvailable && (
              <motion.div
                initial={animated ? { opacity: 0, scale: 0.8 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <div className="bg-black-rich/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                  <span className="text-white font-medium tracking-wide text-sm">Collected</span>
                </div>
              </motion.div>
            )}

            {/* Quick Actions on Hover */}
            {isAvailable && (
              <motion.div
                initial={animated ? { opacity: 0, y: 20 } : {}}
                animate={animated ? { opacity: isHovering ? 1 : 0, y: isHovering ? 0 : 20 } : {}}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      image: product.images?.[0]?.image?.url,
                    }}
                    className="flex-1 bg-white text-charcoal hover:bg-opal-electric hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </AddToCartButton>
                  {showQuickView && (
                    <motion.button
                      whileTap={animated ? { scale: 0.95 } : {}}
                      onClick={(e) => {
                        e.preventDefault()
                        setShowQuickViewModal(true)
                      }}
                      className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-gray-100 shadow-lg transition-all duration-200"
                      aria-label="Quick view"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  )}
                  {showWishlist && (
                    <motion.button
                      whileTap={animated ? { scale: 0.95 } : {}}
                      onClick={(e) => {
                        e.preventDefault()
                        setIsWishlisted(!isWishlisted)
                      }}
                      className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-fire-pink hover:text-white shadow-lg transition-all duration-200"
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

            {/* Quick view hint */}
            {showQuickView && isHovering && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Quick View</span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <Link href={`/store/${product.slug}`} className="block">
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

              {/* Rating (placeholder for Phase 2.3) */}
              {showRating && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-sm",
                          i < 4 ? "bg-fire-gold" : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">(24)</span>
                </div>
              )}

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

              {/* Metadata */}
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
          </Link>
        </div>
      </Container>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={showQuickViewModal}
        onClose={() => setShowQuickViewModal(false)}
      />
    </>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { formatCurrency, cn } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, Eye } from 'lucide-react'

const ProductQuickViewModal = dynamic(() =>
  import('./ProductQuickViewModal').then((mod) => mod.ProductQuickViewModal)
)

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
  /** Preload the image; only set from above-the-fold call sites */
  priority?: boolean
}

export function ProductCard({
  product,
  index = 0,
  variant = 'default',
  showWishlist = false,
  showMetadata = false,
  animated = true,
  darkBackground = false,
  priority = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const isAvailable = product.stock > 0
  const stockStatus = isAvailable
    ? product.stock <= 3
      ? `Only ${product.stock} left`
      : 'In stock'
    : 'Collected'

  // Calculate discount percentage
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // Check if product is new (created in last 7 days)
  const isNew = product.createdAt &&
    new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  const productHref = `/store/${product.slug}`

  return (
    <>
      <div
        className={cn(
          'group',
          animated && 'animate-fade-in motion-reduce:animate-none'
        )}
      >
        <div className={cn(
          "relative h-full",
          variant === 'default' && !darkBackground && "overflow-hidden rounded-lg border border-warm-grey/30 bg-white shadow-sm transition-colors duration-300 hover:border-opal-electric-accessible/30",
          variant === 'default' && darkBackground && "overflow-hidden rounded-lg border border-white/10 bg-charcoal-dark transition-colors duration-300 hover:border-white/25",
          variant === 'museum' && "overflow-hidden rounded-lg border border-warm-grey/30 bg-white shadow-sm transition-colors duration-300 hover:border-opal-electric-accessible/25"
        )}>
          {/* Badges */}
          {isAvailable && isNew && (
            <div className="pointer-events-none absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-charcoal text-white text-xs font-medium rounded-full">
                New
              </span>
            </div>
          )}

          <div className="relative">
            <Link
              href={productHref}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 rounded-lg"
            >
              {/* Image Container */}
              <div className={cn(
                "relative aspect-[3/4] overflow-hidden transition-all duration-500",
                variant === 'default' && !darkBackground && "bg-cream",
                variant === 'default' && darkBackground && "bg-charcoal-dark",
                variant === 'museum' && "bg-cream group-hover:bg-cream-dark",
                variant === 'minimal' && "bg-cream-dark"
              )}>
                {/* Product Image */}
                <div className="relative w-full h-full">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      priority={priority && index < 4}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
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
                        <p className="text-xs text-charcoal/50">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sold Overlay */}
                {!isAvailable && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-charcoal/85 px-4 py-2 text-center">
                      <span className={cn(
                        "text-white font-medium",
                        variant === 'museum' ? "text-sm uppercase" : "text-sm"
                      )}>
                        Collected
                      </span>
                      {variant === 'museum' && <div className="mt-1 h-px w-16 bg-white/30 mx-auto" />}
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Quick Actions */}
            {isAvailable && (
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-3 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 transition-all duration-300",
                  variant === 'museum'
                    ? "bg-white/95"
                    : "bg-gradient-to-t from-charcoal/75 via-charcoal/40 to-transparent pt-8"
                )}
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
                        : "bg-white/95 hover:bg-white text-charcoal"
                    )}
                  >
                    Quick add
                  </AddToCartButton>

                  {/* Quick view */}
                  <button
                    onClick={() => setShowQuickView(true)}
                    title="Quick view"
                    className={cn(
                      "min-h-[44px] min-w-[44px] rounded-lg p-3 transition-colors sm:min-h-9 sm:min-w-9 sm:p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible",
                      variant === 'museum'
                        ? "bg-cream-dark hover:bg-warm-grey text-charcoal/80"
                        : "bg-white/95 hover:bg-white text-charcoal/80"
                    )}
                    aria-label={`Open quick view for ${product.name}`}
                  >
                    <Eye size={18} />
                  </button>

                  {/* Wishlist */}
                  {showWishlist && (
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={cn(
                        "min-h-[44px] min-w-[44px] rounded-full p-3 transition-all sm:min-h-9 sm:min-w-9 sm:p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible",
                        isWishlisted
                          ? "bg-fire-coral text-white"
                          : variant === 'museum'
                            ? "bg-cream-dark hover:bg-warm-grey text-charcoal/80"
                            : "bg-white/95 hover:bg-white text-charcoal/80"
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

          {/* Product Info */}
          {variant === 'museum' ? (
            <div className="p-4">
              <h3 className={cn(
                "font-serif text-base font-medium mb-1",
                isAvailable ? "text-charcoal" : "text-charcoal/45"
              )}>
                <Link
                  href={productHref}
                  className="rounded-sm transition-colors hover:text-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                >
                  {product.name}
                </Link>
              </h3>

              {/* Metadata */}
              {showMetadata && (product.stoneOrigin || product.stoneType) && (
                <p className="text-sm text-charcoal/70 mb-2">
                  {[product.stoneType, product.stoneOrigin].filter(Boolean).join(' • ')}
                </p>
              )}

              {/* Price and Actions */}
              <div className="flex items-end justify-between">
                {isAvailable ? (
                  <div>
                    <span className="font-sans text-lg font-semibold tabular-nums text-charcoal">
                      {formatCurrency(product.price, 'AUD')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="ml-2 text-sm line-through tabular-nums text-charcoal/45">
                        {formatCurrency(product.compareAtPrice, 'AUD')}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-charcoal/60">
                    Collected
                  </span>
                )}
              </div>
              <p className={cn(
                "mt-2 font-sans text-xs font-medium",
                isAvailable ? "text-opal-emerald-dark" : "text-charcoal/60"
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
                    ? "text-white"
                    : "text-charcoal"
                  : darkBackground ? "text-content-secondary" : "text-charcoal/45"
              )}>
                <Link
                  href={productHref}
                  className={cn(
                    "rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
                    darkBackground
                      ? "hover:text-opal-light focus-visible:ring-opal-light"
                      : "hover:text-opal-electric-accessible focus-visible:ring-opal-electric-accessible"
                  )}
                >
                  {product.name}
                </Link>
              </h3>

              <div className="space-y-2">
                {isAvailable ? (
                  <div>
                    <span className={cn(
                      "font-sans text-lg font-semibold tabular-nums",
                      darkBackground ? "text-white" : "text-charcoal"
                    )}>
                      {formatCurrency(product.price, 'AUD')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-sm line-through tabular-nums",
                          darkBackground ? "text-white/40" : "text-charcoal/45"
                        )}>
                          {formatCurrency(product.compareAtPrice, 'AUD')}
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          darkBackground ? "text-fire-pink" : "text-fire-pink-dark"
                        )}>
                          Save {discount}%
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={cn(
                    "text-sm font-medium",
                    darkBackground ? "text-white/50" : "text-charcoal/60"
                  )}>
                    Collected
                  </span>
                )}
              </div>
              <p className={cn(
                "font-sans text-xs font-medium",
                isAvailable
                  ? darkBackground ? "text-opal-light" : "text-opal-emerald-dark"
                  : darkBackground ? "text-white/50" : "text-charcoal/60"
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
                        : "bg-cream text-charcoal/70 border border-warm-grey/60"
                    )}>
                      {product.stoneOrigin}
                    </span>
                  )}
                  {product.stoneType && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-md",
                      darkBackground
                        ? "bg-white/10 text-white/70"
                        : "bg-cream text-charcoal/70 border border-warm-grey/60"
                    )}>
                      {product.stoneType}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <ProductQuickViewModal
          product={product}
          isOpen
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  )
}

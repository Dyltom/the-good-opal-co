'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Product interface for professional card display
 */
interface ProductCardProduct {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  category?: string
  image?: string
  stoneOrigin?: string
  stoneType?: string
  createdAt?: string
}

interface ProductCardProps {
  product: ProductCardProduct
  index?: number
  variant?: 'light' | 'dark'
}

/**
 * Professional Product Card Component
 * Clean, minimal design focused on the product
 */
export function ProductCardPro({ product, index = 0, variant = 'light' }: ProductCardProps) {
  const isAvailable = product.stock > 0
  const isDark = variant === 'dark'
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.02, 0.73, 1],
        scale: { duration: 0.5 }
      }}
      className="group relative"
    >
      {/* Treasure glow effect */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-opal-electric/20 via-fire-gold/20 to-opal-deep/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <Link
        href={`/store/${product.slug}`}
        className="block relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 transition-all"
      >
        {/* Image Container - Clean white background */}
        <div className={cn(
          "relative aspect-square overflow-hidden rounded-2xl mb-4",
          "bg-white",
          "transition-all duration-500",
          "group-hover:shadow-xl",
          "border border-gray-100"
        )}>
          {/* Beautiful shimmer effect overlay */}
          <div
            className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer-slide 2s ease-out infinite',
            }}
          />

          {/* Product Image - Smart enhancement */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-all duration-700 z-10",
                isAvailable && "group-hover:scale-105",
                !isAvailable && "opacity-60 grayscale"
              )}
              style={{
                // Very subtle enhancement - focusing on quality
                filter: isAvailable ? `
                  brightness(1.01)
                  contrast(1.02)
                  saturate(1.01)
                `.replace(/\s+/g, ' ').trim() : undefined,
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="w-16 h-16 rounded-full bg-gray-300" />
            </div>
          )}


          {/* Sold Out Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center">
                <span className="text-white/90 font-light text-sm tracking-[0.3em] uppercase">
                  Claimed
                </span>
                <div className="mt-1 h-px w-16 bg-white/30 mx-auto" />
              </div>
            </div>
          )}

          {/* Price reduction badge - only show for significant discounts */}
          {discount >= 20 && isAvailable && (
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-md">
                -{discount}%
              </span>
            </div>
          )}

          {/* New arrival badge - if product was created in last 7 days */}
          {isAvailable && !discount && product.createdAt && new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-black text-white text-xs font-medium px-2.5 py-1 rounded-md">
                NEW
              </span>
            </div>
          )}


        </div>

        {/* Product Info - Museum card style */}
        <div className="space-y-4 px-1">
          {/* Name - Like a specimen label */}
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

          {/* Magical origin and type */}
          <div className="space-y-3">
            {(product.stoneOrigin || product.stoneType) && (
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

          </div>

          {/* View Details CTA */}
          {isAvailable && (
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-xs font-medium text-opal-electric-accessible-dark-accessible tracking-wide flex items-center gap-1">
                Examine Specimen
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
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

      <Link href={`/store/${product.slug}`} className="block relative">
        {/* Image Container - Enchanted display */}
        <div className={cn(
          "relative aspect-square overflow-hidden rounded-3xl mb-5",
          "bg-gradient-to-br from-charcoal via-black-rich to-charcoal",
          "transition-all duration-1000",
          "group-hover:shadow-[0_0_50px_rgba(0,180,216,0.3)]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-opal-electric/5 before:to-transparent",
          "before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-1000"
        )}>
          {/* Mystical light effects */}
          <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Shimmer effect overlay */}
          <div
            className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer-slide 2s ease-out infinite',
            }}
          />

          {/* Product Image - Enchanted stone */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-all duration-1000 z-10",
                isAvailable && "group-hover:scale-105 brightness-100 contrast-110",
                !isAvailable && "opacity-40 grayscale blur-[0.5px]"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={cn(
                "w-24 h-24 rounded-full",
                isDark ? "bg-white/10" : "bg-gray-200"
              )} />
            </div>
          )}

          {/* Magical sparkles */}
          {isAvailable && (
            <>
              <div className="absolute top-6 left-8 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100">
                <div className="w-3 h-3">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping" />
                  <div className="relative w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="absolute bottom-10 right-6 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300">
                <div className="w-2 h-2">
                  <div className="absolute inset-0 bg-opal-light rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-opal-light rounded-full" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/3 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500">
                <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            </>
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

          {/* Rare find badge */}
          {discount > 0 && isAvailable && (
            <div className="absolute top-4 left-4 z-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-fire-gold to-fire-orange blur-md opacity-70" />
                <span className="relative bg-gradient-to-r from-fire-gold to-fire-orange text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                  <span className="text-[10px]">✦</span> RARE FIND
                </span>
              </div>
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

            {/* One of a kind indicator */}
            {isAvailable && (
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-3 h-3 text-opal-electric/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <p className="text-[11px] font-light italic text-gray-600 tracking-wider">
                  One of a Kind Specimen
                </p>
                <svg className="w-3 h-3 text-opal-electric/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            )}
          </div>

          {/* View Details CTA */}
          {isAvailable && (
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-xs font-medium text-opal-electric-dark-accessible tracking-wide flex items-center gap-1">
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
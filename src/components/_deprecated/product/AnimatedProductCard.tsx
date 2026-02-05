'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, ShoppingBag } from 'lucide-react'
import { hoverLift, fadeInUp, buttonPress, focusRing } from '@/lib/animations/microInteractions'
import { useState } from 'react'

interface AnimatedProductCardProps {
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
  index?: number
}

/**
 * Enhanced Product Card with micro-interactions
 * Features smooth hover effects, staggered animations, and interactive feedback
 */
export function AnimatedProductCard({ product, index = 0 }: AnimatedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const isAvailable = product.stock > 0

  return (
    <motion.div
      {...fadeInUp}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link href={`/store/${product.slug}`} className="block">
        {/* Image Container with hover effects */}
        <motion.div
          {...hoverLift}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black-rich mb-4"
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 pointer-events-none"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.7, ease: 'linear' }}
          />

          {/* Product Image with scale effect */}
          <motion.div
            className="relative w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover ${!isAvailable && 'grayscale opacity-60'}`}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20" />
            )}
          </motion.div>

          {/* Sold Overlay */}
          {!isAvailable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="bg-black-rich/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-white font-medium tracking-wide text-sm">Collected</span>
              </div>
            </motion.div>
          )}

          {/* Quick Actions - Animated on hover */}
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 right-4 z-10"
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
                  className="flex-1 bg-white text-opal-electric-accessible hover:bg-opal-electric hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </AddToCartButton>
                <motion.button
                  {...buttonPress}
                  {...focusRing}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-fire-pink hover:text-white shadow-lg transition-all duration-200"
                  aria-label="Add to wishlist"
                >
                  <motion.div
                    animate={{ scale: isWishlisted ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                    />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute top-3 right-3 z-10"
            >
              <div className="px-3 py-1.5 bg-gradient-to-r from-opal-electric to-fire-pink rounded-lg shadow-lg">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Featured</span>
              </div>
            </motion.div>
          )}

          {/* Category Badge */}
          {product.category && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 left-3 z-10"
            >
              <div className="px-3 py-1.5 bg-black-rich/80 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                  {product.category.replace(/-/g, ' ')}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          className="space-y-2 px-1 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <h3 className={`font-medium text-base leading-snug transition-colors duration-200 line-clamp-2 ${
            isAvailable
              ? 'text-charcoal group-hover:text-opal-electric-accessible'
              : 'text-content-muted'
          }`}>
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            {isAvailable ? (
              <>
                <motion.span
                  className="text-lg font-bold text-opal-deep"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {formatCurrency(product.price, 'AUD')}
                </motion.span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm line-through text-charcoal/50"
                  >
                    {formatCurrency(product.compareAtPrice, 'AUD')}
                  </motion.span>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-charcoal/50">
                Sold
              </span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
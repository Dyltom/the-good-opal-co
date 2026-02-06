'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { Heart } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/animations/motion'

interface MobileProductCardProduct {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  image?: string
  createdAt?: string
}

interface MobileProductCardProps {
  product: MobileProductCardProduct
  index?: number
  onQuickAdd?: (productId: string) => void
}

export function MobileProductCard({ product, index = 0, onQuickAdd }: MobileProductCardProps) {
  const [liked, setLiked] = useState(false)
  const isAvailable = product.stock > 0
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0
  const prefersReducedMotion = usePrefersReducedMotion()

  // Touch interactions
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10])
  const opacity = useTransform(x, [-100, -50, 0, 50, 100], [0.5, 1, 1, 1, 0.5])

  // Animations
  const controls = useAnimation()
  const scaleAnimation = useAnimation()

  const handleTap = () => {
    // Haptic feedback simulation with scale
    scaleAnimation.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3 }
    })
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Heart animation
    await controls.start({
      scale: [1, 1.3, 0.8, 1.2, 1],
      transition: { duration: 0.4 }
    })

    setLiked(!liked)

    // Trigger haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 1.02, 0.73, 1]
      }}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onTap={handleTap}
      animate={scaleAnimation}
      className="relative touch-manipulation"
    >
      <Link href={`/store/${product.slug}`} className="block">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image Container with parallax effect */}
          <motion.div
            className="relative aspect-[4/3] overflow-hidden bg-gray-50"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {/* Discount Badge */}
            {discount >= 20 && isAvailable && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20"
              >
                -{discount}%
              </motion.span>
            )}

            {/* Product Image with Ken Burns effect */}
            {product.image ? (
              <motion.div
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.1, 1],
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute inset-0"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
              </div>
            )}

            {/* Shimmer effect on tap */}
            <motion.div
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              whileTap={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)',
              }}
            />

            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                <span className="text-white font-medium text-sm">Sold Out</span>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <div className="p-4">
            {/* Name */}
            <h3 className="font-medium text-lg line-clamp-1 text-gray-900 mb-2">
              {product.name}
            </h3>

            {/* Price with animation */}
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-baseline gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isAvailable ? (
                  <>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(product.price, 'AUD')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm line-through text-gray-400">
                        {formatCurrency(product.compareAtPrice, 'AUD')}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-base text-gray-500">Sold</span>
                )}
              </motion.div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <motion.button
                  onClick={handleLike}
                  animate={controls}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    liked ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Heart className={cn("w-5 h-5", liked && "fill-current")} />
                </motion.button>

                {/* Quick Add Button */}
                {isAvailable && (
                  <AddToCartButton
                    product={product}
                    variant="icon"
                    animated={true}
                    showConfetti={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
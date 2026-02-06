'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { cn } from '@/lib/utils'

/**
 * Enhanced Product interface with magical properties
 */
interface MagicalProductCardProduct {
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

interface MagicalProductCardProps {
  product: MagicalProductCardProduct
  index?: number
  variant?: 'light' | 'dark'
}

/**
 * Magical Product Card with 3D effects, rainbow refraction, and particle effects
 */
export function MagicalProductCard({ product, index = 0, variant = 'light' }: MagicalProductCardProps) {
  const isAvailable = product.stock > 0
  const [isHovered, setIsHovered] = useState(false)
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // Mouse position for effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 25, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 25, stiffness: 300 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.02, 0.73, 1],
      }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Magical aura effect */}
      <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-opal-electric via-fire-gold to-opal-deep blur-3xl animate-gradient-shift" />
      </div>

      <Tilt
        className="relative block"
        tiltMaxAngleX={12}
        tiltMaxAngleY={12}
        perspective={1000}
        scale={1.02}
        transitionSpeed={2000}
        glareEnable={true}
        glareMaxOpacity={0.3}
        glareColor="lightblue"
        glarePosition="all"
      >
        <Link href={`/store/${product.slug}`} className="block relative">
          {/* Image Container with magical effects */}
          <div className="relative aspect-square overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-black-rich to-charcoal">
            {/* Prismatic rainbow overlay */}
            <motion.div
              className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-1000"
              style={{
                background: `linear-gradient(
                  ${springX.get() * 360}deg,
                  rgba(255, 0, 0, 0.3),
                  rgba(255, 127, 0, 0.3),
                  rgba(255, 255, 0, 0.3),
                  rgba(0, 255, 0, 0.3),
                  rgba(0, 0, 255, 0.3),
                  rgba(75, 0, 130, 0.3),
                  rgba(148, 0, 211, 0.3)
                )`,
              }}
            />

            {/* Dynamic lighting effect */}
            <motion.div
              className="absolute inset-0 z-25"
              style={{
                background: `radial-gradient(
                  circle at ${springX.get() * 100}% ${springY.get() * 100}%,
                  rgba(255, 255, 255, 0.3),
                  transparent 50%
                )`,
              }}
            />

            {/* Holographic shimmer */}
            <div
              className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.1) 10px,
                    rgba(255, 255, 255, 0.1) 20px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 10px,
                    rgba(0, 180, 216, 0.1) 10px,
                    rgba(0, 180, 216, 0.1) 20px
                  )
                `,
                backgroundSize: '200% 200%',
                animation: 'shimmer-slide 3s linear infinite',
              }}
            />

            {/* Product Image with enhanced filters */}
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-all duration-1000 z-10",
                  isAvailable && isHovered && "scale-110 brightness-110 contrast-125 saturate-125",
                  !isAvailable && "opacity-40 grayscale blur-sm"
                )}
                style={{
                  filter: isHovered && isAvailable ? 'drop-shadow(0 0 30px rgba(0, 180, 216, 0.5))' : undefined,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
              </div>
            )}

            {/* Floating particles */}
            {isAvailable && isHovered && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full z-40"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-20, -100],
                      x: [0, (Math.random() - 0.5) * 50],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    style={{
                      left: `${20 + i * 12}%`,
                      bottom: '10%',
                      filter: 'blur(0.5px)',
                      boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                    }}
                  />
                ))}
              </>
            )}

            {/* Magnifying glass effect on hover */}
            {isHovered && isAvailable && (
              <motion.div
                className="absolute w-32 h-32 rounded-full z-35 pointer-events-none"
                style={{
                  left: `${springX.get() * 100}%`,
                  top: `${springY.get() * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
                  backdropFilter: 'blur(2px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="absolute inset-2 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${product.image})`,
                      backgroundSize: '300%',
                      backgroundPosition: `${springX.get() * 100}% ${springY.get() * 100}%`,
                      filter: 'brightness(1.2) contrast(1.3) saturate(1.3)',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Sold Out Overlay */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                  <span className="text-white/90 font-light text-sm tracking-[0.3em] uppercase">
                    In Private Collection
                  </span>
                  <div className="mt-1 h-px w-16 bg-white/30 mx-auto" />
                </div>
              </div>
            )}

            {/* Rare find badge with glow */}
            {discount > 0 && isAvailable && (
              <div className="absolute top-4 left-4 z-50">
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fire-gold to-fire-orange blur-lg opacity-70" />
                  <span className="relative bg-gradient-to-r from-fire-gold to-fire-orange text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                    <span className="text-[10px]">✦</span> RARE FIND
                  </span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 px-1">
            <div>
              <h3 className="font-light text-lg leading-tight line-clamp-2 text-charcoal group-hover:text-black transition-colors duration-500">
                {product.name}
              </h3>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

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

            {/* Origin and type with magical styling */}
            <div className="space-y-3">
              {(product.stoneOrigin || product.stoneType) && (
                <div className="flex flex-wrap gap-3 text-[11px]">
                  {product.stoneOrigin && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-opal-electric/30 to-opal-deep/30 animate-pulse" />
                      <span className="font-light text-gray-600">{product.stoneOrigin}</span>
                    </div>
                  )}
                  {product.stoneType && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-fire-gold to-fire-orange opacity-50 animate-pulse" />
                      <span className="font-light text-gray-600">{product.stoneType}</span>
                    </div>
                  )}
                </div>
              )}

              {/* One of a kind with sparkle */}
              {isAvailable && (
                <div className="flex items-center gap-2 justify-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="w-3 h-3 text-opal-electric-accessible/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </motion.div>
                  <p className="text-[11px] font-light italic text-gray-600 tracking-wider">
                    One of a Kind Specimen
                  </p>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="w-3 h-3 text-opal-electric-accessible/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Examine CTA with glow */}
            {isAvailable && (
              <motion.div
                className="pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs font-medium text-opal-electric tracking-wide flex items-center gap-1">
                  Examine Specimen
                  <motion.svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </span>
              </motion.div>
            )}
          </div>
        </Link>
      </Tilt>
    </motion.div>
  )
}
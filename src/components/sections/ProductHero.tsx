'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  originalPrice?: string | null
  image: string
  badge: { text: string; type: 'featured' | 'sale' | 'limited' | 'new' }
  rating?: number // Made optional to handle removal of fake ratings
  sold?: number // Made optional to handle removal of fake sold counts
  description?: string
}

interface ProductHeroProps {
  products: Product[]
}

function formatBadgeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
}

export function ProductHero({ products }: ProductHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)

  // Auto-advance slideshow
  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  const goToPrevious = () => {
    setImageLoading(true)
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const goToNext = () => {
    setImageLoading(true)
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  if (products.length === 0) {
    return null
  }

  const currentProduct = products[currentIndex]

  if (!currentProduct) return null

  return (
    <section className="relative overflow-hidden bg-charcoal-dark pt-[84px]">
      {/* Screen reader announcement for slide changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentProduct && `Now showing ${currentProduct.name}, ${currentIndex + 1} of ${products.length}`}
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-opal-light/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(144,224,239,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_48%)]" />

      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Editorial badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85"
            >
              <span className="font-medium">Handmade Australian opals</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 font-serif text-4xl font-semibold leading-[1.05] text-balance text-white sm:text-5xl md:text-6xl"
            >
              Authentic Australian
              <span className="block text-opal-light">Opal Jewellery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mb-10 leading-relaxed"
            >
              From Lightning Ridge to your jewellery box. A storybook colour palette, hand-shaped settings,
              and one-of-a-kind stones with a quieter kind of magic.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 max-w-xl border-y border-white/15 py-4 text-sm leading-relaxed text-white/70"
            >
              Trusted details, clear care, and one-of-a-kind stones. Product details, shipping, returns, and care guidance stay close to the buying decision.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="px-8 py-3 shadow-sm"
                asChild
              >
                <Link href="/store">Shop Collection</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/blog">Learn More</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Product Showcase */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[calc(100vw-2rem)] sm:max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Link
                    href={`/store/${currentProduct.slug}`}
                    className="block relative w-full h-full group"
                  >
                    {/* Product Card */}
                    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/15 bg-white shadow-md transition-colors duration-300 group-hover:border-opal-light/45">
                      {/* Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                          currentProduct.badge.type === 'featured'
                            ? 'bg-charcoal-dark/85 text-white'
                            : currentProduct.badge.type === 'sale'
                            ? 'bg-fire-gold text-charcoal'
                            : currentProduct.badge.type === 'limited'
                            ? 'bg-fire-pink-dark text-white'
                            : 'bg-opal-emerald-dark text-white'
                        }`}>
                          {formatBadgeText(currentProduct.badge.text)}
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="relative h-3/5 overflow-hidden bg-gray-100">
                        {imageLoading && (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
                        )}
                        <Image
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          fill
                          className={`object-cover transition-opacity duration-500 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                          onLoad={() => setImageLoading(false)}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-charcoal mb-3 line-clamp-2">
                          {currentProduct.name}
                        </h3>

                        {/* Rating & Sold - Only show if real data exists */}
                        {(currentProduct.rating !== undefined || currentProduct.sold !== undefined) && (
                          <div className="flex items-center gap-3 mb-3 text-sm">
                            {currentProduct.rating !== undefined && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-current text-opal-gold" />
                                  <span className="text-charcoal/70">{currentProduct.rating.toFixed(1)}</span>
                                </div>
                                {currentProduct.sold !== undefined && <span className="text-charcoal/50">•</span>}
                              </>
                            )}
                            {currentProduct.sold !== undefined && (
                              <span className="text-charcoal/70">{currentProduct.sold} sold</span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-charcoal">{currentProduct.price}</span>
                          {currentProduct.originalPrice && (
                            <span className="text-lg text-charcoal/50 line-through">
                              {currentProduct.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {products.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 z-20 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-opal-electric focus:ring-offset-2 focus:ring-offset-charcoal-dark group"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 z-20 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-opal-electric focus:ring-offset-2 focus:ring-offset-charcoal-dark group"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Product Indicators */}
              {products.length > 1 && (
                <div className="flex flex-wrap justify-center gap-1 mt-6">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-dark"
                      aria-label={`Go to product ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : undefined}
                    >
                      <span
                        className={`block transition-all duration-300 rounded-full ${
                          index === currentIndex
                            ? 'w-8 h-2 bg-white'
                            : 'w-2 h-2 bg-white/40 group-hover:bg-white/60'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Badges */}
      <div className="relative pb-8 pt-6">
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border border-white/15 bg-white/[0.08] flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/80">100% Authentic</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border border-white/15 bg-white/[0.08] flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/80">Free Express Shipping</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border border-white/15 bg-white/[0.08] flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/80">30-Day Returns</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border border-white/15 bg-white/[0.08] flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/80">Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

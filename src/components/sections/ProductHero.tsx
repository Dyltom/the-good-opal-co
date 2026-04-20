'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  originalPrice?: string | null
  image: string
  badge: string
  rating: number
  sold: number
  description?: string
}

interface ProductHeroProps {
  products: Product[]
}

export function ProductHero({ products }: ProductHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Parallax effect for background
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <section className="relative bg-black-rich overflow-hidden pt-[84px]">
      {/* Screen reader announcement for slide changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentProduct && `Now showing ${currentProduct.name}, ${currentIndex + 1} of ${products.length}`}
      </div>
      {/* Background texture - subtle opal pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300B4D8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient overlay with parallax */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-opal-electric/20 to-transparent blur-3xl transition-transform duration-0"
          style={{ transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-fire-pink/20 to-transparent blur-3xl transition-transform duration-0"
          style={{ transform: reducedMotion ? 'none' : `translateY(${scrollY * -0.2}px)` }}
        />
      </div>

      <div className="container relative z-10 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Limited Time Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fire-pink to-fire-coral text-white rounded-full mb-6 text-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Limited Time: Up to 25% OFF</span>
              <Sparkles className="w-4 h-4" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
            >
              Authentic Australian
              <span className="block text-gradient-prismatic">Opal Jewellery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-xl mb-8"
            >
              From Lightning Ridge to your jewellery box. Each piece handcrafted, ethically sourced, and
              absolutely breathtaking.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mb-8"
            >
              <div className="text-center lg:text-left">
                <p className="font-accent text-2xl font-bold text-white">15K+</p>
                <p className="font-sans text-xs text-white/60">Happy Customers</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <p className="font-accent text-2xl font-bold text-white">4.9★</p>
                <p className="font-sans text-xs text-white/60">Average Rating</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <p className="font-accent text-2xl font-bold text-white">100%</p>
                <p className="font-sans text-xs text-white/60">Authentic</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="px-8 py-3 shadow-2xl hover:shadow-3xl"
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
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Link
                    href={`/store/${currentProduct.slug}`}
                    className="block relative w-full h-full group"
                  >
                    {/* Product Card */}
                    <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,180,216,0.3)] transition-all duration-300 group">
                      {/* Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="px-4 py-2 bg-gradient-to-r from-fire-pink to-fire-coral text-white text-sm font-bold rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          {currentProduct.badge}
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
                          className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
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

                        {/* Rating & Sold */}
                        <div className="flex items-center gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-opal-gold" />
                            <span className="text-charcoal/70">{currentProduct.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-charcoal/50">•</span>
                          <span className="text-charcoal/70">{currentProduct.sold} sold</span>
                        </div>

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
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-opal-electric focus:ring-offset-2 focus:ring-offset-black-rich transition-all duration-300 group"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-opal-electric focus:ring-offset-2 focus:ring-offset-black-rich transition-all duration-300 group"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Product Indicators */}
              {products.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-8 h-2 bg-white'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                      } rounded-full`}
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Badges */}
      <div className="relative pb-8 pt-6">
        <div className="container">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
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
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
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
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
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
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
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
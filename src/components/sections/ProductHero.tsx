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

  // Auto-advance slideshow
  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  if (products.length === 0) {
    return null
  }

  const currentProduct = products[currentIndex]

  return (
    <section className="relative min-h-screen bg-black-rich overflow-hidden">
      {/* Background texture - subtle opal pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300B4D8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-opal-electric/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-fire-pink/20 to-transparent blur-3xl" />
      </div>

      <div className="container relative z-10 min-h-screen flex items-center py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Limited Time Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fire-pink to-fire-coral text-white rounded-full mb-8 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">FLASH SALE: Up to 25% OFF + Free Express Shipping</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Authentic Australian
              <span className="block text-gradient-prismatic">Opal Jewelry</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mb-8"
            >
              From Lightning Ridge to your jewelry box. Each piece handcrafted, ethically sourced, and
              absolutely breathtaking.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center lg:justify-start gap-8 mb-12"
            >
              <div className="text-center lg:text-left">
                <p className="text-4xl font-bold text-white">15K+</p>
                <p className="text-base text-white/60 mt-1">Happy Customers</p>
              </div>
              <div className="h-14 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <p className="text-4xl font-bold text-white">4.9★</p>
                <p className="text-base text-white/60 mt-1">Average Rating</p>
              </div>
              <div className="h-14 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <p className="text-4xl font-bold text-white">100%</p>
                <p className="text-base text-white/60 mt-1">Authentic</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="xl"
                className="px-12 py-6 text-lg shadow-2xl hover:shadow-3xl"
                asChild
              >
                <Link href="/store">Shop Collection</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="px-12 py-6 text-lg bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/blog">Learn More</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Product Showcase */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] max-w-lg mx-auto">
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
                    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                      {/* Badge */}
                      <div className="absolute top-6 left-6 z-20">
                        <div className="px-5 py-2.5 bg-gradient-to-r from-fire-pink to-fire-coral text-white text-base font-bold rounded-full shadow-lg">
                          {currentProduct.badge}
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="relative h-3/5 overflow-hidden bg-gray-100">
                        <Image
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-charcoal mb-4 line-clamp-2">
                          {currentProduct.name}
                        </h3>

                        {/* Rating & Sold */}
                        <div className="flex items-center gap-4 mb-4 text-base">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-current text-opal-gold" />
                            <span className="text-charcoal/70">{currentProduct.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-charcoal/50">•</span>
                          <span className="text-charcoal/70">{currentProduct.sold} sold</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4">
                          <span className="text-3xl font-bold text-charcoal">{currentProduct.price}</span>
                          {currentProduct.originalPrice && (
                            <span className="text-xl text-charcoal/50 line-through">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Product Indicators */}
              {products.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
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
      <div className="absolute bottom-8 left-0 right-0">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-base text-white/80">100% Authentic</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-base text-white/80">Free Express Shipping</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <p className="text-base text-white/80">30-Day Returns</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-base text-white/80">Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
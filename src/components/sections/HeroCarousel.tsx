'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface Slide {
  id: number
  badge: string
  title: string
  description: string
  cta: {
    label: string
    href: string
  }
  backgroundImage?: string
  gradient: string
}
const slides: Slide[] = [
  {
    id: 1,
    badge: 'OUR COLLECTION',
    title: 'Opals',
    description:
      'Our high-quality opals are sourced from all corners of Australia and meticulously handcrafted in-house. Each piece is unique—explore our extensive collection to find the perfect opal to collect or set in jewellery.',
    cta: {
      label: 'SHOP OPALS',
      href: '/store?category=opals',
    },
    backgroundImage: '/images/hero/opal-1.jpg',
    gradient: 'from-black/30 via-black/20 to-black/40',
  },
  {
    id: 2,
    badge: 'OUR COURSES',
    title: 'Learn How to Cut Opal',
    description:
      "Explore Steph's public outline for learning opal cutting and valuation, then send an interest enquiry to hear when the format, timing, and availability are confirmed.",
    cta: {
      label: 'EXPLORE COURSES',
      href: '/courses',
    },
    backgroundImage: '/images/hero/opal-2.jpg',
    gradient: 'from-black/30 via-black/20 to-black/40',
  },
  {
    id: 3,
    badge: 'TRENDING',
    title: 'Jewellery',
    description:
      'Explore our jewellery collection or design a one-of-a-kind piece to treat yourself or gift to someone special.',
    cta: {
      label: 'SHOP JEWELLERY',
      href: '/store?category=jewellery',
    },
    backgroundImage: '/images/hero/opal-3.jpg',
    gradient: 'from-black/30 via-black/20 to-black/40',
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="relative h-[500px] overflow-hidden bg-charcoal md:h-[600px] lg:h-[650px]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'translate-x-0 opacity-100'
              : index < currentSlide
                ? '-translate-x-full opacity-0'
                : 'translate-x-full opacity-0'
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          {slide.backgroundImage && (
            <>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 h-full w-full">
                  <OptimizedImage
                    src={slide.backgroundImage}
                    alt={slide.title}
                    fill={false}
                    width={1920}
                    height={800}
                    priority={index === 0}
                    quality={90}
                    className={`h-full w-full object-cover transition-transform duration-[8000ms] ease-out ${
                      index === currentSlide ? 'scale-110' : 'scale-100'
                    }`}
                    sizes="100vw"
                  />
                </div>
              </div>
              {/* Lighter overlay to show opal colors */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            </>
          )}

          {/* Fallback gradient if no image */}
          {!slide.backgroundImage && (
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          )}

          {/* Subtle shimmer overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div
              className={`absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[3000ms] ${
                index === currentSlide ? 'translate-x-full' : '-translate-x-full'
              }`}
              style={{
                transform: index === currentSlide ? 'translateX(100%)' : 'translateX(-100%)',
              }}
            />
          </div>

          {/* Content with Entrance Animations */}
          <div className="relative z-10 flex h-full items-center">
            <div className="mx-auto w-full max-w-screen-xl px-6">
              <div className="max-w-3xl">
                {/* Slide Counter - Fade in */}
                <div
                  className={`mb-6 flex items-center gap-4 transition-all delay-100 duration-700 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span className="text-7xl font-bold text-white/40 md:text-8xl">0{slide.id}</span>
                  <span className="text-2xl font-bold text-white/60 md:text-3xl">/ 03</span>
                </div>

                {/* Badge - Fade in with delay */}
                <p
                  className={`mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/90 transition-all delay-200 duration-700 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {slide.badge}
                </p>

                {/* Title - Slide in from left */}
                <h1
                  className={`mb-6 font-serif text-5xl font-bold leading-none text-white transition-all delay-300 duration-700 md:text-7xl lg:text-8xl ${
                    index === currentSlide
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-8 opacity-0'
                  }`}
                >
                  {slide.title}
                </h1>

                {/* Description - Fade in with delay */}
                <p
                  className={`mb-10 max-w-2xl text-lg leading-relaxed text-white/90 transition-all delay-500 duration-700 md:text-xl ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {slide.description}
                </p>

                {/* CTA - Pop in with delay */}
                <div
                  className={`transition-all delay-700 duration-700 ${
                    index === currentSlide ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                  }`}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-opal-electric px-10 py-6 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-opal-deep"
                  >
                    <Link href={slide.cta.href}>{slide.cta.label}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="group absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:h-14 md:w-14"
        aria-label="Previous slide"
      >
        <svg
          className="h-6 w-6 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="group absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:h-14 md:w-14"
        aria-label="Next slide"
      >
        <svg
          className="h-6 w-6 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide ? 'h-3 w-12 bg-white' : 'h-3 w-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

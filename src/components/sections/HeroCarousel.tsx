'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    description: 'Our high-quality opals are sourced from all corners of Australia and meticulously handcrafted in-house. Each piece is unique—explore our extensive collection to find the perfect opal to collect or set in jewellery.',
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
    description: 'Join one of our guided courses to learn how to cut opal. Benefit from our years of expertise and receive 1:1 guidance as you practice cutting and valuing opal.',
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
    description: 'Explore our jewellery collection or design a one-of-a-kind piece to treat yourself or gift to someone special.',
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
    <section className="relative h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden bg-charcoal">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
              ? 'opacity-0 -translate-x-full'
              : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          {slide.backgroundImage && (
            <>
              <div className="absolute inset-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.backgroundImage}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                    index === currentSlide ? 'scale-110' : 'scale-100'
                  }`}
                />
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
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[3000ms] ${
                index === currentSlide ? 'translate-x-full' : '-translate-x-full'
              }`}
              style={{ transform: index === currentSlide ? 'translateX(100%)' : 'translateX(-100%)' }}
            />
          </div>

          {/* Content with Entrance Animations */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-screen-xl mx-auto px-6 w-full">
              <div className="max-w-3xl">
                {/* Slide Counter - Fade in */}
                <div className={`flex items-center gap-4 mb-6 transition-all duration-700 delay-100 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <span className="text-7xl md:text-8xl font-bold text-white/40">
                    0{slide.id}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-white/60">
                    / 03
                  </span>
                </div>

                {/* Badge - Fade in with delay */}
                <p className={`text-sm uppercase tracking-[0.3em] text-white/90 font-bold mb-4 transition-all duration-700 delay-200 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {slide.badge}
                </p>

                {/* Title - Slide in from left */}
                <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none transition-all duration-700 delay-300 ${
                  index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  {slide.title}
                </h1>

                {/* Description - Fade in with delay */}
                <p className={`text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl transition-all duration-700 delay-500 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {slide.description}
                </p>

                {/* CTA - Pop in with delay */}
                <div className={`transition-all duration-700 delay-700 ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                  <Button
                    asChild
                    size="lg"
                    className="bg-opal-blue text-white hover:bg-opal-blue-dark hover:scale-105 font-bold px-10 py-6 text-base shadow-xl transition-all duration-300"
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
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-white'
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

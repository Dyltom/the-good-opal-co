'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

/**
 * HomeHero Component
 *
 * Immersive full-screen hero section for the homepage featuring:
 * - Animated gradient orbs (opal play-of-color effect)
 * - Dark background for luxury feel
 * - Prismatic animated gradient text
 * - Shimmer CTA button
 * - Scroll indicator
 *
 * Follows SOLID principles:
 * - Single Responsibility: Homepage hero display only
 * - Open/Closed: Can be extended via props without modification
 */
export function HomeHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black-rich pt-24">
      {/* Animated Gradient Orbs - Opal play-of-color effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #00B4D8 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #FF8FAB 0%, transparent 70%)',
            animationDelay: '-3s',
          }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #2ECC71 0%, transparent 70%)',
            animationDelay: '-6s',
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Eyebrow */}
        <p
          className="text-opal-deep uppercase tracking-[0.3em] text-sm mb-6 transition-all duration-700 delay-200"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          Australian Opal That Doesn&apos;t Cost The Earth
        </p>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-[1.05] tracking-tight">
          <span className="block">Discover the</span>
          <span className="text-gradient-prismatic font-normal">Magic of Opal</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          Handcrafted Australian opals, ethically sourced and transformed into
          wearable art. Each piece is one-of-a-kind, just like you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="shimmer" asChild>
            <Link href="/store">Shop Collection</Link>
          </Button>
          <Button size="xl" variant="glass" asChild>
            <Link href="/blog">Our Story</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-10 h-16 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <ChevronDown className="w-5 h-5 text-white/50" />
        </div>
      </div>
    </section>
  )
}

'use client'

import { Container } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface HeroButton {
  href: string
  label: string
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

interface HeroWithImageProps {
  badge?: string
  title: string
  subtitle?: string
  description: string
  buttons: HeroButton[]
  className?: string
}

// Minimal product type for hero image selection
interface ProductForHero {
  featured?: boolean
  image?: string
}

/**
 * Hero Section with Product Image Background
 * Premium visual hero showcasing actual products
 */
export function HeroWithImage({
  badge,
  title,
  subtitle,
  description,
  buttons,
  className = '',
}: HeroWithImageProps) {
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)

  useEffect(() => {
    // Fetch a featured product to use as hero background
    fetch('/api/store-products')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Product feed failed with ${response.status}`)
        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error('Product feed returned an invalid response')
        return data as ProductForHero[]
      })
      .then((data) => {
        const featured = data.find((p: ProductForHero) => p.featured && p.image)
        if (featured?.image) {
          setFeaturedImage(featured.image)
        }
      })
      .catch((err) => console.error('Failed to fetch hero image:', err))
  }, [])

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background with Product Image */}
      <div className="absolute inset-0 z-0">
        {featuredImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt="Featured Opal"
              className="h-full w-full scale-105 object-cover blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-opal-electric/95 via-fire-pink/90 to-opal-electric/95" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-opal-electric via-fire-pink to-opal-light" />
        )}
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 py-24 md:py-32 lg:py-40">
        <Container className="text-center text-white">
          {badge && (
            <Badge className="mb-6 border-white/30 bg-white/20 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {badge}
            </Badge>
          )}

          {subtitle && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/90">
              {subtitle}
            </p>
          )}

          <h1 className="mx-auto mb-6 max-w-5xl text-balance font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
            {description}
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {buttons.map((button, index) => (
              <Button
                key={index}
                asChild
                size="lg"
                variant={button.variant || 'default'}
                className={
                  button.className ||
                  (button.variant === 'default'
                    ? 'bg-white px-8 font-semibold text-opal-electric-accessible shadow-xl hover:bg-white/90'
                    : 'border-white/50 text-white backdrop-blur-sm hover:bg-white/10')
                }
              >
                <Link href={button.href}>{button.label}</Link>
              </Button>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

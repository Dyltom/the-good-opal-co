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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const featured = data.find((p: any) => p.featured && p.image)
        if (featured?.image) {
          setFeaturedImage(featured.image)
        }
      })
      .catch(err => console.error('Failed to fetch hero image:', err))
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
              className="w-full h-full object-cover scale-105 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-opal-blue/95 via-opal-purple/90 to-opal-blue/95" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-opal-blue via-opal-purple to-opal-pink" />
        )}
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 py-24 md:py-32 lg:py-40">
        <Container className="text-center text-white">
          {badge && (
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5 backdrop-blur-sm">
              {badge}
            </Badge>
          )}

          {subtitle && (
            <p className="text-sm uppercase tracking-widest text-white/90 font-semibold mb-4">
              {subtitle}
            </p>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance max-w-5xl mx-auto leading-tight">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((button, index) => (
              <Button
                key={index}
                asChild
                size="lg"
                variant={button.variant || 'default'}
                className={
                  button.className ||
                  (button.variant === 'default'
                    ? 'bg-white text-opal-blue hover:bg-white/90 font-semibold px-8 shadow-xl'
                    : 'border-white/50 text-white hover:bg-white/10 backdrop-blur-sm')
                }
              >
                <Link href={button.href}>{button.label}</Link>
              </Button>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
    </section>
  )
}

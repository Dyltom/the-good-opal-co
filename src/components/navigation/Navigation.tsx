'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavigationProps } from '@/types'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/CartButton'
import { SearchInput } from '@/components/search/SearchInput'

/**
 * Navigation Component
 *
 * Main site navigation with:
 * - Opal-inspired prismatic accent line
 * - Glassmorphism effect on scroll
 * - Context-aware text colors (light on dark hero, dark when scrolled)
 * - Refined luxury hover effects
 * - Mobile menu with opal aesthetics
 *
 * Follows SOLID principles:
 * - Single Responsibility: Navigation display and state
 * - Open/Closed: Extendable via props
 * - Dependency Inversion: Uses NavigationProps interface
 */
export function Navigation({
  logo,
  logoText = 'The Good Opal Co',
  items = [],
  cta,
  sticky = true,
  transparent = false,
  className,
}: NavigationProps) {
  // Use logoText as brand name display
  const brandName = logoText
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const pathname = usePathname()
  const collectionsRef = useRef<HTMLDivElement>(null)

  // Collections data
  const collections = [
    { name: 'Raw Opals', href: '/store?category=raw', count: 12 },
    { name: 'Rings', href: '/store?category=rings', count: 8 },
    { name: 'Pendants', href: '/store?category=pendants', count: 15 },
    { name: 'Earrings', href: '/store?category=earrings', count: 6 }
  ]

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Track scroll position for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close collections dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Determine if we're on a dark background (transparent mode = dark hero)
  const onDarkBackground = transparent && !scrolled

  return (
    <nav
      className={cn(
        'w-full transition-all duration-500',
        sticky && 'fixed top-0 left-0 right-0 z-50',
        className
      )}
    >
      {/* Opal Electric Accent Line - Always visible at top */}
      <div className="h-1 w-full bg-opal-electric" />

      {/* Main Nav Bar */}
      <div
        className={cn(
          'transition-all duration-500',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg'
            : transparent
              ? 'bg-gradient-to-b from-black-rich/40 to-transparent backdrop-blur-sm'
              : 'bg-white border-b border-gray-soft'
        )}
      >
        <Container>
          <div className="flex h-20 items-center justify-between">
            {/* Logo with Opal Glow on Hover */}
            <Link
              href="/"
              className="flex items-center gap-3 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2"
            >
              {logo ? (
                <div className="relative">
                  {/* Glow effect behind logo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-opal-electric to-fire-pink opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-full scale-150" />
                  <Image
                    src={logo.url}
                    alt={logo.alt}
                    width={logo.width || 48}
                    height={logo.height || 48}
                    className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-col">
                <span className={cn(
                  'font-serif text-lg font-semibold tracking-tight transition-colors duration-300',
                  onDarkBackground ? 'text-white' : 'text-charcoal'
                )}>
                  {brandName}
                </span>
                <span className={cn(
                  'font-accent text-xs tracking-wider uppercase transition-colors duration-300',
                  onDarkBackground ? 'text-white/60' : 'text-charcoal-light'
                )}>
                  Australian Opals
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {/* Home Link */}
              <Link
                href="/"
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2',
                  isActive('/')
                    ? onDarkBackground
                      ? 'text-white'
                      : 'text-opal-electric-accessible'
                    : onDarkBackground
                      ? 'text-white/90 hover:text-white'
                      : 'text-charcoal hover:text-opal-electric-accessible'
                )}
              >
                Home
                {/* Active/Hover underline with single color */}
                <span className={cn(
                  'absolute bottom-1 left-4 right-4 h-0.5 bg-opal-electric transition-transform duration-300 origin-left rounded-full',
                  isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )} />
              </Link>

              {/* Collections Dropdown */}
              <div className="relative" ref={collectionsRef}>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2',
                    onDarkBackground
                      ? 'text-white/90 hover:text-white'
                      : 'text-charcoal hover:text-opal-electric-accessible'
                  )}
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  aria-expanded={collectionsOpen}
                  aria-haspopup="true"
                >
                  Collections
                  <svg
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      collectionsOpen ? 'rotate-180' : 'rotate-0'
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {/* Hover underline */}
                  <span className={cn(
                    'absolute bottom-1 left-4 right-4 h-0.5 bg-opal-electric transition-transform duration-300 origin-left rounded-full',
                    'scale-x-0 group-hover:scale-x-100'
                  )} />
                </button>

                {/* Dropdown Menu */}
                {collectionsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-soft py-2 z-50">
                    {collections.map((collection) => (
                      <Link
                        key={collection.href}
                        href={collection.href}
                        className="flex items-center justify-between px-4 py-3 text-sm text-charcoal hover:bg-opal-electric/10 hover:text-opal-electric-accessible transition-colors duration-200"
                        onClick={() => setCollectionsOpen(false)}
                      >
                        <span>{collection.name}</span>
                        <span className="text-xs text-charcoal-light">({collection.count})</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2',
                    isActive(item.href)
                      ? onDarkBackground
                        ? 'text-white'
                        : 'text-opal-electric-accessible'
                      : onDarkBackground
                        ? 'text-white/90 hover:text-white'
                        : 'text-charcoal hover:text-opal-electric-accessible'
                  )}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                  {/* Active/Hover underline with single color */}
                  <span className={cn(
                    'absolute bottom-1 left-4 right-4 h-0.5 bg-opal-electric transition-transform duration-300 origin-left rounded-full',
                    isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )} />
                </Link>
              ))}

              {/* Search Input - Desktop */}
              <div className="ml-4">
                <SearchInput variant="default" />
              </div>

              {cta && (
                <Button asChild size="sm" className="ml-2">
                  <Link href={cta.href} target={cta.external ? '_blank' : undefined}>
                    {cta.label}
                  </Link>
                </Button>
              )}

              {/* Cart with contextual styling */}
              <div className={cn(
                'ml-2 transition-colors duration-300',
                onDarkBackground && '[&_button]:text-white [&_button]:hover:bg-white/10'
              )}>
                <CartButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <div className={cn(
                'transition-colors duration-300',
                onDarkBackground && '[&_button]:text-white [&_button]:hover:bg-white/10'
              )}>
                <CartButton />
              </div>
              <button
                type="button"
                className={cn(
                  'rounded-full p-2.5 transition-all duration-300',
                  onDarkBackground
                    ? 'text-white hover:bg-white/10'
                    : 'text-charcoal hover:bg-gray-whisper'
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Menu with Opal Styling */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 ease-out transform origin-top',
          mobileMenuOpen
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-soft shadow-xl">
          <Container>
            <div className="py-6 space-y-2">
              {/* Search Input - Mobile */}
              <div className="px-4 pb-4">
                <SearchInput variant="mobile" onClose={() => setMobileMenuOpen(false)} />
              </div>

              {/* Home Link - Mobile */}
              <Link
                href="/"
                className={cn(
                  'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 group',
                  isActive('/')
                    ? 'text-opal-electric-accessible bg-gradient-to-r from-opal-electric/10 to-fire-pink/10'
                    : 'text-charcoal hover:bg-gradient-to-r hover:from-opal-electric/10 hover:to-fire-pink/10'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {/* Opal dot indicator */}
                <span className={cn(
                  'w-2 h-2 rounded-full bg-opal-electric mr-3 transition-opacity duration-300',
                  isActive('/') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )} />
                Home
              </Link>

              {/* Collections - Mobile */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-charcoal-light uppercase tracking-wider">
                  Collections
                </div>
                {collections.map((collection, index) => (
                  <Link
                    key={collection.href}
                    href={collection.href}
                    className="flex items-center justify-between px-6 py-2 text-base font-medium rounded-xl transition-all duration-300 group text-charcoal hover:bg-gradient-to-r hover:from-opal-electric/10 hover:to-fire-pink/10"
                    style={{
                      animationDelay: `${(index + 1) * 50}ms`,
                      animation: mobileMenuOpen ? 'fade-up 0.3s ease-out forwards' : 'none'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{collection.name}</span>
                    <span className="text-xs text-charcoal-light">({collection.count})</span>
                  </Link>
                ))}
              </div>

              {items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 group',
                    isActive(item.href)
                      ? 'text-opal-electric-accessible bg-gradient-to-r from-opal-electric/10 to-fire-pink/10'
                      : 'text-charcoal hover:bg-gradient-to-r hover:from-opal-electric/10 hover:to-fire-pink/10'
                  )}
                  style={{
                    animationDelay: `${(index + collections.length + 2) * 50}ms`,
                    animation: mobileMenuOpen ? 'fade-up 0.3s ease-out forwards' : 'none'
                  }}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {/* Opal dot indicator */}
                  <span className={cn(
                    'w-2 h-2 rounded-full bg-opal-electric mr-3 transition-opacity duration-300',
                    isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )} />
                  {item.label}
                </Link>
              ))}

              {cta && (
                <div className="pt-4 px-4">
                  <Button asChild className="w-full" size="lg">
                    <Link
                      href={cta.href}
                      target={cta.external ? '_blank' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cta.label}
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu footer with tagline */}
              <div className="pt-6 px-4 border-t border-gray-soft mt-4">
                <p className="text-xs text-charcoal-light text-center tracking-wider uppercase">
                  Australian Opal That Doesn&apos;t Cost The Earth
                </p>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </nav>
  )
}

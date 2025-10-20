'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { NavigationProps } from '@/types'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/CartButton'

/**
 * Navigation Component
 * Main site navigation with mobile menu support
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className={cn(
        'w-full border-b',
        sticky && 'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        transparent && 'bg-transparent border-transparent',
        className
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {logo ? (
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width || 120}
                height={logo.height || 32}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-bold">{logoText}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            ))}

            {cta && (
              <Button asChild size="sm">
                <Link href={cta.href} target={cta.external ? '_blank' : undefined}>
                  {cta.label}
                </Link>
              </Button>
            )}
            <CartButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 hover:bg-muted"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium rounded-md hover:bg-muted transition-colors"
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {cta && (
                <Button asChild className="w-full">
                  <Link href={cta.href} target={cta.external ? '_blank' : undefined}>
                    {cta.label}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}

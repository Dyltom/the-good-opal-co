'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { CartButton } from '@/components/cart/CartButton'
import { Container } from '@/components/layout'
import { SearchInput } from '@/components/search/SearchInput'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/utils'
import type { NavigationProps } from '@/types'

export function Navigation({
  logo,
  logoText = 'The Good Opal Co',
  items = [],
  cta,
  sticky = true,
  className,
}: NavigationProps) {
  const [hydrated, setHydrated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useFocusTrap<HTMLDivElement>({
    active: mobileMenuOpen,
    onEscape: () => setMobileMenuOpen(false),
  })

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'w-full border-b border-warm-grey/55 bg-cream text-charcoal',
        sticky && 'fixed inset-x-0 top-0 z-50',
        className
      )}
    >
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-charcoal px-4 py-3 text-cream focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>

      <Container className="max-w-[96rem]">
        <div className="flex h-20 items-center gap-5">
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
            aria-label="The Good Opal Co home"
          >
            {logo ? (
              <Image
                src={logo.url}
                alt=""
                width={logo.width || 48}
                height={logo.height || 48}
                className="h-11 w-11 rounded-full object-contain"
                priority
              />
            ) : null}
            <span className="hidden sm:block">
              <span className="block font-serif text-lg font-semibold leading-5">{logoText}</span>
              <span className="mt-1 block font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-charcoal/70">
                Australian opals
              </span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-7 lg:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-11 items-center font-sans text-sm font-semibold text-charcoal/75 transition-colors duration-150 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2',
                  isActive(item.href) &&
                    'text-charcoal after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-charcoal'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto hidden w-full max-w-[19rem] xl:block">
            <Suspense fallback={<div aria-hidden="true" className="h-11 rounded-md bg-white/65" />}>
              <SearchInput variant="default" />
            </Suspense>
          </div>

          {cta ? (
            <Link
              href={cta.href}
              className="hidden min-h-11 items-center rounded-md bg-charcoal px-4 font-sans text-sm font-semibold text-cream transition-colors duration-150 hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 xl:inline-flex"
            >
              {cta.label}
            </Link>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
            <CartButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              disabled={!hydrated}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-charcoal transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible disabled:cursor-wait disabled:opacity-60 lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 top-0 z-[70] bg-charcoal/35 lg:hidden"
          onMouseDown={closeMenu}
        >
          <div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="ml-auto flex h-full w-[min(92vw,27rem)] flex-col bg-cream px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-warm-grey/55 pb-5">
              <span className="font-serif text-xl font-semibold">Browse</span>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="py-5">
              <Suspense
                fallback={<div aria-hidden="true" className="h-11 rounded-md bg-white/65" />}
              >
                <SearchInput variant="mobile" onClose={closeMenu} />
              </Suspense>
            </div>

            <div className="flex flex-col border-t border-warm-grey/55">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex min-h-14 items-center justify-between border-b border-warm-grey/55 font-serif text-2xl text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-opal-electric-accessible"
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-charcoal/45" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-warm-grey/55 pt-6">
              <Link
                href="/contact"
                onClick={closeMenu}
                className="font-sans text-sm font-semibold text-opal-electric-accessible"
              >
                Need help choosing? Talk to us
              </Link>
              <p className="mt-3 max-w-[28ch] font-sans text-xs leading-5 text-charcoal/70">
                Personal guidance for gifts, first opals, collectors, and custom pieces.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

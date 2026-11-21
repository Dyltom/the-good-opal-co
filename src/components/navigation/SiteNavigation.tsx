'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CartButton } from '@/components/cart/CartButton'
import { SearchInput } from '@/components/search/SearchInput'
import { Wordmark } from '@/components/brand/Wordmark'
import { NAVIGATION_ITEMS } from '@/lib/constants/navigation'

type Panel = 'menu' | 'search' | null

const iconClass =
  'h-[18px] w-[18px] flex-none fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]'

export function SiteNavigation() {
  const [hydrated, setHydrated] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setHydrated(true), [])

  useEffect(() => setPanel(null), [pathname])

  useEffect(() => {
    if (!panel) return
    const opener = panel === 'menu' ? menuButtonRef.current : searchButtonRef.current
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setPanel(null)
      opener?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && headerRef.current?.contains(event.target)) return
      setPanel(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [panel])

  const toggle = (next: Exclude<Panel, null>) => setPanel((current) => (current === next ? null : next))
  const close = () => setPanel(null)
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-rule bg-bg/[0.88] backdrop-blur-[14px] [view-transition-name:mast]"
    >
      <a
        href="#main-content"
        className="sr-only bg-ink px-3.5 py-2.5 text-bg focus-visible:not-sr-only focus-visible:fixed focus-visible:left-3 focus-visible:top-2 focus-visible:z-50"
      >
        Skip to main content
      </a>

      <div className="flex h-[52px] items-center gap-3 px-gut md:h-mast md:gap-7">
        <Link href="/" className="text-[18px] text-ink no-underline md:text-[20px]" aria-label="The Good Opal Co home">
          <Wordmark />
        </Link>

        <nav aria-label="Primary navigation" className="ml-auto hidden gap-4 whitespace-nowrap text-[13.5px] tracking-[0.01em] md:flex lg:gap-[26px]">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="border-b border-transparent py-1.5 text-ink-2 no-underline transition-colors hover:text-ink aria-[current=page]:border-accent aria-[current=page]:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:gap-2">
          <button
            ref={searchButtonRef}
            type="button"
            onClick={() => toggle('search')}
            disabled={!hydrated}
            aria-label="Search"
            aria-expanded={panel === 'search'}
            aria-controls="site-search"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink-2 transition-colors hover:text-ink disabled:cursor-wait"
          >
            <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          </button>
          <CartButton />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => toggle('menu')}
            disabled={!hydrated}
            aria-label="Menu"
            aria-expanded={panel === 'menu'}
            aria-controls="site-menu"
            className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center text-ink disabled:cursor-wait md:hidden"
          >
            <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
              {panel === 'menu' ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {panel === 'menu' ? (
        <nav
          id="site-menu"
          aria-label="Site menu"
          className="absolute inset-x-0 top-full flex flex-col border-b border-rule bg-plinth px-gut pb-3.5 pt-1.5 text-[17px] md:hidden"
        >
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="border-b border-rule py-3 text-ink no-underline aria-[current=page]:text-accent"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={close} className="pt-3 text-[13.5px] text-ink-2">
            Need help choosing? Talk to us
          </Link>
        </nav>
      ) : null}

      {panel === 'search' ? (
        <div
          id="site-search"
          role="search"
          className="absolute inset-x-0 top-full border-b border-rule bg-plinth px-gut py-3"
        >
          <Suspense fallback={<div aria-hidden="true" className="mx-auto h-12 max-w-2xl bg-bg" />}>
            <SearchInput autoFocus onClose={close} className="mx-auto max-w-2xl" />
          </Suspense>
        </div>
      ) : null}
    </header>
  )
}

import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getShippingMessage } from '@/lib/constants/shipping'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('buying flow UI/UX safeguards', () => {
  test('shipping feedback is calm and exposes progress data', () => {
    const source = read('src/lib/constants/shipping.ts')

    expect(getShippingMessage(500)).toBe('Your order qualifies for free express shipping!')
    expect(source).toContain('export function getFreeShippingProgress')
  })

  test('product cards expose purchase actions on touch and keyboard focus', () => {
    const source = read('src/components/product/ProductCard.tsx')

    expect(source).toContain('opacity-100 sm:opacity-0')
    expect(source).toContain('sm:group-focus-within:opacity-100')
    expect(source).toContain('Quick add')
    expect(source).toContain('aria-pressed={isWishlisted}')
    expect(source).toContain('priority={index < 4}')
    expect(source).toContain('disabled={product.stock === 0}')
    expect(source).not.toContain('tracking-[0.3em]')
    expect(source).not.toContain('tracking-wide')
  })

  test('store results show active filter state and live result count', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('activeFilterCount')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('Selected filters')
    expect(source).toContain('Remove filter')
    expect(source).toContain('pagedProducts.map((product, index)')
    expect(source).toContain('index={index}')
  })

  test('store discovery controls are compact and scan-friendly on mobile', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('aria-label="Store search and refinement"')
    expect(source).toContain('type="search"')
    expect(source).toContain('inputMode="search"')
    expect(source).toContain('Showing {resultRangeStart}-{resultRangeEnd} of {sortedProducts.length}')
    expect(source).toContain('grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]')
    expect(source).toContain('w-full sm:w-[190px]')
    expect(source).toContain('min-h-[44px] min-w-[44px]')
    expect(source).toContain('min-h-[44px] rounded-full')
  })

  test('store search URL sync does not remount controls while typing', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('window.history.replaceState(null')
    expect(source).not.toContain('router.push(newUrl')
  })

  test('quick view modal behaves as a mobile safe-area purchase sheet', () => {
    const source = read('src/components/product/ProductQuickViewModal.tsx')

    expect(source).toContain('aria-modal="true"')
    expect(source).toContain('aria-labelledby="quick-view-title"')
    expect(source).toContain('items-end justify-center sm:items-center')
    expect(source).toContain('max-h-[92dvh]')
    expect(source).toContain('sticky bottom-0')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain('min-h-[44px] min-w-[44px]')
    expect(source).toContain('h-11 w-11 min-h-[44px] min-w-[44px]')
    expect(source).toContain('flex flex-col gap-3 sm:flex-row')
    expect(source).not.toContain('scale:')
  })

  test('cart drawer uses plain checkout language and free-shipping progress', () => {
    const source = read('src/components/cart/AnimatedCartDrawer.tsx')

    expect(source).toContain('FreeShippingProgress')
    expect(source).toContain('SheetDescription')
    expect(source).toContain('Checkout securely')
    expect(source).not.toContain('Treasure Chest')
    expect(source).not.toContain('Secure Your Treasures')
    expect(source).not.toContain('Sparkles')
  })

  test('product detail page presents purchase confidence without overtracked labels', () => {
    const source = read('src/app/(marketing)/store/[slug]/page.tsx')

    expect(source).toContain('Purchase confidence')
    expect(source).toContain('This piece qualifies for free express shipping')
    expect(source).not.toContain('tracking-[0.2em]')
  })

  test('cart actions avoid celebratory dependencies and narrow analytics types', () => {
    const buttonSource = read('src/components/cart/AddToCartButton.tsx')
    const packageSource = read('package.json')
    const quickAddSources = [
      read('src/components/product/ProductCard.tsx'),
      read('src/components/product/ProductQuickView.tsx'),
      read('src/components/product/ProductQuickViewModal.tsx'),
      read('src/components/mobile/MobileProductCard.tsx'),
    ].join('\n')

    expect(buttonSource).not.toContain('canvas-confetti')
    expect(buttonSource).not.toContain('showConfetti')
    expect(buttonSource).not.toContain('as Product')
    expect(quickAddSources).not.toContain('showConfetti')
    expect(packageSource).not.toContain('canvas-confetti')
  })

  test('store page query and typography stay deploy-safe', () => {
    const source = read('src/app/(marketing)/store/page.tsx')

    expect(source).toContain("import type { Where } from 'payload'")
    expect(source).not.toContain('as any')
    expect(source).not.toContain('tracking-[0.2em]')
    expect(source).not.toContain('tracking-tight')
  })

  test('mobile store does not keep placeholder quick-add logging', () => {
    const mobileStoreSource = read('src/components/mobile/MobileStoreContent.tsx')
    const mobileCardSource = read('src/components/mobile/MobileProductCard.tsx')

    expect(mobileStoreSource).not.toContain('console.log')
    expect(mobileStoreSource).not.toContain('onQuickAdd')
    expect(mobileCardSource).not.toContain('onQuickAdd')
  })

  test('mobile store uses a compact filter drawer before the desktop sidebar', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('isMobileFiltersOpen')
    expect(source).toContain('Filter & refine')
    expect(source).toContain('role="dialog"')
    expect(source).toContain('aria-modal="true"')
    expect(source).toContain('aria-label="Filter & refine"')
    expect(source).toContain('hidden lg:block')
    expect(source).toContain('lg:hidden')
    expect(source).toContain('idPrefix="mobile"')
    expect(source).toContain('idPrefix="desktop"')
    expect(source).toContain('Show {sortedProducts.length}')
  })

  test('mobile filter drawer has distinct close targets and a 44px icon close', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('aria-label="Dismiss filter panel"')
    expect(source).toContain('aria-label="Close filters"')
    expect(source).toContain('flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-warm-grey/30')
  })

  test('product filters support prefixed ids for mobile and desktop instances', () => {
    const source = read('src/components/store/ProductFilters.tsx')

    expect(source).toContain('idPrefix?: string')
    expect(source).toContain('const fieldId')
    expect(source).toContain('id={fieldId(')
    expect(source).toContain('htmlFor={fieldId(')
    expect(source).not.toContain('tracking-[0.15em]')
  })

  test('closed mobile navigation does not reserve page-height hit area', () => {
    const source = read('src/components/navigation/Navigation.tsx')

    expect(source).toContain('aria-hidden={!mobileMenuOpen}')
    expect(source).toContain('overflow-hidden')
    expect(source).toContain('max-h-0')
    expect(source).toContain('max-h-[calc(100vh-5rem)]')
  })

  test('product detail exposes a safe-area mobile purchase bar', () => {
    const source = read('src/components/product/ProductActions.tsx')

    expect(source).toContain('Mobile sticky purchase bar')
    expect(source).toContain('fixed inset-x-0 bottom-0')
    expect(source).toContain('lg:hidden')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain("formatCurrency(product.price, 'AUD')")
    expect(source).toContain('className="w-full sm:flex-1"')
  })

  test('cart page exposes a mobile sticky checkout summary and stacks rows', () => {
    const source = read('src/app/(marketing)/cart/cart-content.tsx')

    expect(source).toContain('Mobile checkout summary')
    expect(source).toContain('fixed inset-x-0 bottom-0')
    expect(source).toContain('lg:hidden')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain('Mobile checkout total')
    expect(source).toContain('pb-28 lg:pb-0')
    expect(source).toContain('flex-col gap-4 sm:flex-row')
  })

  test('mobile decorative hero content stays bounded within the viewport', () => {
    const productHeroSource = read('src/components/sections/ProductHero.tsx')
    const homeSource = read('src/app/(marketing)/page.tsx')
    const blogSource = read('src/app/(marketing)/blog/page.tsx')

    expect(productHeroSource).toContain('max-w-screen-xl px-4')
    expect(productHeroSource).toContain('max-w-[calc(100vw-2rem)]')
    expect(productHeroSource).toContain('flex flex-wrap justify-center gap-1')
    expect(homeSource).toContain('bg-charcoal-dark py-24')
    expect(homeSource).toContain('rounded-xl border border-warm-grey/30 bg-white shadow-sm')
    expect(homeSource).not.toContain('hidden sm:block absolute left-1/4 top-0')
    expect(homeSource).not.toContain('hidden sm:block absolute top-1/2')
    expect(homeSource).not.toContain('hidden sm:block absolute -top-40 -right-40')
    expect(homeSource).not.toContain('hidden sm:block absolute -bottom-40 -left-40')
    expect(blogSource).toContain('hidden sm:block absolute -top-40')
    expect(blogSource).toContain('hidden sm:block absolute -bottom-40')
    expect(blogSource).toContain('hidden sm:block absolute top-1/2')
  })

  test('homepage hero keeps the fairytale tone without sales-template chrome', () => {
    const source = read('src/components/sections/ProductHero.tsx')

    expect(source).toContain('Handmade Australian opals')
    expect(source).toContain('storybook')
    expect(source).toContain('formatBadgeText(currentProduct.badge.text)')
    expect(source).not.toContain('Limited Time: Up to')
    expect(source).not.toContain('Sparkles')
    expect(source).not.toContain('text-gradient-prismatic')
    expect(source).not.toContain('hover:scale-[1.02]')
  })

  test('product gallery uses editorial framing instead of gradient glow chrome', () => {
    const source = read('src/components/product/ProductImageGallery.tsx')

    expect(source).toContain('border border-warm-grey/40 bg-white shadow-sm')
    expect(source).toContain('Featured')
    expect(source).not.toContain('FEATURED')
    expect(source).not.toContain('shadow-2xl')
    expect(source).not.toContain('bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep')
  })

  test('mobile product sticky purchase bar waits until inline actions scroll away', () => {
    const source = read('src/components/product/ProductActions.tsx')

    expect(source).toContain('showStickyPurchaseBar')
    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('entry.boundingClientRect.top < 0')
    expect(source).toContain('data-testid="inline-product-actions"')
    expect(source).not.toContain('fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/30 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden')
  })

  test('cart and search language stays warm without magical treasure wording', () => {
    const searchSource = read('src/components/search/SearchInput.tsx')
    const emptyStateSource = read('src/components/ui/EmptyStates.tsx')

    expect(searchSource).toContain("import { Search, X, Loader2 } from 'lucide-react'")
    expect(searchSource).toContain('placeholder="Search opals, rings, parcels"')
    expect(searchSource).not.toContain('Sparkles')
    expect(searchSource).not.toContain('magical')
    expect(emptyStateSource).toContain("description=\"Looks like you haven't added any pieces yet. Explore our collection of unique Australian opals.\"")
    expect(emptyStateSource).not.toContain('treasures')
  })

  test('product cards read as gallery pieces instead of generated action cards', () => {
    const source = read('src/components/product/ProductCard.tsx')

    expect(source).toContain('border border-warm-grey/30 bg-white shadow-sm')
    expect(source).toContain('Quick view')
    expect(source).not.toContain('group-hover:scale-105')
    expect(source).not.toContain('hover:shadow-glow')
  })

  test('featured product fetches do not log errors for route-change aborts', () => {
    const source = read('src/components/sections/FeaturedProducts.tsx')

    expect(source).toContain('new AbortController()')
    expect(source).toContain("error instanceof DOMException && error.name === 'AbortError'")
    expect(source).toContain('return () => controller.abort()')
  })

  test('homepage collection sections use gallery restraint instead of template glow', () => {
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).toContain('rounded-xl border border-warm-grey/30 bg-white shadow-sm')
    expect(source).toContain('group-hover:opacity-95')
    expect(source).toContain('Every order includes practical support before and after purchase.')
    expect(source).not.toContain('text-gradient-prismatic')
    expect(source).not.toContain('bg-clip-text')
    expect(source).not.toContain('Sparkles')
    expect(source).not.toContain('shadow-2xl')
    expect(source).not.toContain('group-hover:scale-110')
    expect(source).not.toContain('absolute -inset-1 rounded-3xl bg-gradient-to-r')
  })

  test('product detail page keeps commerce hierarchy solid and mobile-friendly', () => {
    const source = read('src/app/(marketing)/store/[slug]/page.tsx')

    expect(source).toContain('text-opal-electric-accessible')
    expect(source).toContain('flex flex-col gap-3 text-sm sm:flex-row sm:items-center')
    expect(source).toContain('mt-20 border-t border-warm-grey/40 pt-12')
    expect(source).not.toContain('bg-clip-text')
    expect(source).not.toContain('text-transparent')
    expect(source).not.toContain('mt-20 bg-gradient-to-b from-white via-gray-50 to-white rounded-3xl p-12')
  })

  test('core UI controls use motion restraint without hover scaling', () => {
    const buttonSource = read('src/components/ui/button.tsx')
    const gallerySource = read('src/components/product/ProductImageGallery.tsx')

    expect(buttonSource).toContain('hover:shadow-opal-electric/30')
    expect(buttonSource).not.toContain('hover:scale')
    expect(buttonSource).not.toContain('active:scale')
    expect(gallerySource).toContain('ring-2 ring-opal-electric-accessible ring-offset-2')
    expect(gallerySource).not.toContain('scale-105')
  })

  test('footer closes the site like a quiet gallery note', () => {
    const source = read('src/components/navigation/Footer.tsx')

    expect(source).toContain('bg-charcoal-dark text-white')
    expect(source).toContain('border-t border-warm-grey/20')
    expect(source).toContain('From the gallery')
    expect(source).toContain('Australian opal that doesn&apos;t cost the earth.')
    expect(source).not.toContain('Prismatic Top Border')
    expect(source).not.toContain('bg-gradient-to-r from-opal-electric via-fire-pink')
    expect(source).not.toContain('hover:bg-gradient-to-r')
    expect(source).not.toContain('blur-xl')
    expect(source).not.toContain('font-accent')
    expect(source).not.toContain('tracking-wider')
  })

  test('hero relies on product-led editorial cues instead of generated atmosphere', () => {
    const source = read('src/components/sections/ProductHero.tsx')

    expect(source).toContain('bg-charcoal-dark')
    expect(source).toContain('Trusted details, clear care, and one-of-a-kind stones.')
    expect(source).toContain('Authenticity, express shipping, returns, and care guidance are kept close to the buying decision.')
    expect(source).not.toContain('scrollY')
    expect(source).not.toContain('blur-3xl')
    expect(source).not.toContain('Quick Stats')
    expect(source).not.toContain('shadow-luxury-lg')
    expect(source).not.toContain('bg-black-rich')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('scale:')
  })

  test('product cards share one gallery vocabulary without blur overlays or scale entrances', () => {
    const source = read('src/components/product/ProductCard.tsx')

    expect(source).toContain('Gallery Product Card Component')
    expect(source).toContain('rounded-lg border border-warm-grey/30 bg-white shadow-sm')
    expect(source).toContain('bg-charcoal/85 px-4 py-2 text-center')
    expect(source).not.toContain('SOLID')
    expect(source).not.toContain('Multiple variants')
    expect(source).not.toContain('Museum style info')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('bg-black')
    expect(source).not.toContain('scale:')
  })

  test('homepage language avoids leftover template phrases in feature sections', () => {
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).toContain('bg-charcoal-dark py-24')
    expect(source).toContain('Newly finished pieces from the workshop.')
    expect(source).not.toContain('Where dreams become reality.')
    expect(source).not.toContain('Fresh from our workshop - discover new masterpieces crafted with passion')
    expect(source).not.toContain('bg-black-rich')
    expect(source).not.toContain('blur-3xl')
    expect(source).not.toContain('Magical sparkle effects')
    expect(source).not.toContain('from-black/80')
  })
})

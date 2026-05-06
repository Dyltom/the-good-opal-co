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
    expect(homeSource).toContain('hidden sm:block absolute top-0 left-1/4 w-96')
    expect(homeSource).toContain('hidden sm:block absolute bottom-0 right-1/4 w-96')
    expect(homeSource).toContain('hidden sm:block absolute left-1/4 top-0')
    expect(homeSource).toContain('hidden sm:block absolute bottom-0 right-1/4')
    expect(homeSource).toContain('hidden sm:block absolute top-1/2')
    expect(homeSource).toContain('hidden sm:block absolute -top-40 -right-40')
    expect(homeSource).toContain('hidden sm:block absolute -bottom-40 -left-40')
    expect(blogSource).toContain('hidden sm:block absolute -top-40')
    expect(blogSource).toContain('hidden sm:block absolute -bottom-40')
    expect(blogSource).toContain('hidden sm:block absolute top-1/2')
  })
})

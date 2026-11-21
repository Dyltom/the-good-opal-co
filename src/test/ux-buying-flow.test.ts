import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getShippingMessage } from '@/lib/constants/shipping'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('buying flow UI/UX safeguards', () => {
  test('shipping feedback is calm and exposes progress data', () => {
    const source = read('src/lib/constants/shipping.ts')

    expect(getShippingMessage(500)).toBe('Your order qualifies for free shipping!')
    expect(source).toContain('export function getFreeShippingProgress')
  })

  test('product cards expose purchase actions on touch and keyboard focus', () => {
    const source = read('src/components/product/ProductCard.tsx')

    expect(source).toContain('sm:opacity-0')
    expect(source).toContain('sm:group-focus-within:opacity-100')
    expect(source).toContain('Quick add')
    expect(source).toContain('variant="icon"')
    expect(source).toContain('sm:hidden')
    expect(source).toContain('priority={priority && index < 4}')
    expect(source).not.toContain('isWishlisted')
    expect(source).not.toContain('tracking-[0.3em]')
  })

  test('store results expose server-filtered state and a live result count', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('Showing 1–${shown} of ${totalDocs} pieces')
    expect(source).toContain('products.map((product, index)')
    expect(source).toContain('index={index}')
  })

  test('search suggestions use typed product and filter destinations', () => {
    const actionSource = read('src/app/(marketing)/search/actions.ts')
    const suggestionSource = read('src/app/(marketing)/search/suggestions.ts')
    const inputSource = read('src/components/search/SearchInput.tsx')
    const storeSource = read('src/app/(marketing)/store/store-content.tsx')

    expect(actionSource).toContain("href: '/store?category=opal-rings'")
    expect(actionSource).toContain("href: '/store?category=raw-opals'")
    expect(actionSource).toContain("href: '/store?stone=black-opal'")
    expect(suggestionSource).toContain('`/store/${encodeURIComponent(match.slug)}`')
    expect(inputSource).toContain('router.push(suggestion.href)')
    expect(storeSource).toContain('placeholder="Name or SKU"')
    expect(storeSource).not.toContain('label="Setting" name="material"')
  })

  test('store discovery controls use accessible GET forms and native mobile disclosure', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('role="search"')
    expect(source).toContain('type="search"')
    expect(source).toContain('method="get"')
    expect(source).toContain('Refine')
    expect(source).toContain('min-h-11')
  })

  test('store filtering stays server-driven without router state synchronization', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).not.toContain("'use client'")
    expect(source).not.toContain('useRouter')
    expect(source).not.toContain('window.history')
  })

  test('quick view modal behaves as a mobile safe-area purchase sheet', () => {
    const source = read('src/components/product/ProductQuickViewModal.tsx')

    expect(source).toContain('aria-modal="true"')
    expect(source).toContain('aria-labelledby="quick-view-title"')
    expect(source).toContain('items-end justify-center sm:items-center')
    expect(source).toContain('max-h-[92dvh]')
    expect(source).toContain('sticky bottom-0')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain('min-h-[44px]')
    expect(source).toContain('min-w-[44px]')
    expect(source).toContain('h-11 w-11 min-h-[44px] min-w-[44px]')
    expect(source).toContain('flex flex-col gap-3 sm:flex-row')
    expect(source).not.toContain('scale:')
  })

  test('cart drawer uses plain checkout language and free-shipping progress', () => {
    const source = read('src/components/cart/AnimatedCartDrawer.tsx')

    expect(source).toContain('FreeShippingProgress')
    expect(source).toContain('SheetDescription')
    expect(source).toContain('<CheckoutButton')
    expect(source).not.toContain('Treasure Chest')
    expect(source).not.toContain('Secure Your Treasures')
    expect(source).not.toContain('Sparkles')
  })

  test('product detail page presents purchase confidence without overtracked labels', () => {
    const source = read('src/app/(marketing)/store/[slug]/page.tsx')

    expect(source).toContain('SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD')
    expect(source).toContain('30-day change-of-mind returns on eligible unused pieces.')
    expect(source).not.toContain('tracking-[0.2em]')
  })

  test('cart actions avoid celebratory dependencies and narrow analytics types', () => {
    const buttonSource = read('src/components/cart/AddToCartButton.tsx')
    const packageSource = read('package.json')
    const quickAddSources = [
      read('src/components/product/ProductCard.tsx'),
      read('src/components/product/ProductQuickViewModal.tsx'),
    ].join('\n')

    expect(buttonSource).not.toContain('canvas-confetti')
    expect(buttonSource).not.toContain('showConfetti')
    expect(buttonSource).not.toContain('as Product')
    expect(quickAddSources).not.toContain('showConfetti')
    expect(packageSource).not.toContain('canvas-confetti')
  })

  test('store page query and typography stay deploy-safe', () => {
    const source = read('src/app/(marketing)/store/page.tsx')

    expect(source).not.toContain('as any')
    expect(source).not.toContain('tracking-[0.2em]')
    expect(source).not.toContain('tracking-tight')
  })

  test('mobile store opens filters in a sheet while desktop keeps the sidebar', () => {
    const source = read('src/app/(marketing)/store/store-content.tsx')

    expect(source).toContain('<aside className="hidden lg:block"')
    expect(source).toContain('<StoreFilterSheet')
    expect(source).toContain('className="flex-none lg:hidden"')
    expect(source).toContain('inline-flex min-h-11 items-center')
  })

  test('closed mobile navigation does not reserve page-height hit area', () => {
    const source = read('src/components/navigation/SiteNavigation.tsx')

    expect(source).toContain("{panel === 'menu' ? (")
    expect(source).toContain("aria-expanded={panel === 'menu'}")
    expect(source).toContain("event.key !== 'Escape'")
    expect(source).toContain('disabled={!hydrated}')
    expect(source).toContain('useEffect(() => setHydrated(true), [])')
  })

  test('product detail exposes a safe-area mobile purchase bar', () => {
    const source = read('src/components/product/ProductActions.tsx')

    expect(source).toContain('aria-label="Quick purchase"')
    expect(source).toContain('fixed inset-x-0 bottom-0')
    expect(source).toContain('lg:hidden')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain("formatCurrency(product.price, 'AUD')")
    expect(source).toContain('className="h-14 w-full text-base"')
  })

  test('cart page exposes a mobile sticky checkout summary and stacks rows', () => {
    const source = read('src/app/(marketing)/cart/cart-content.tsx')

    expect(source).toContain('fixed inset-x-0 bottom-0')
    expect(source).toContain('lg:hidden')
    expect(source).toContain('env(safe-area-inset-bottom)')
    expect(source).toContain('Estimated total')
    expect(source).toContain('pb-28 lg:pb-0')
    expect(source).toContain('flex min-w-0 gap-4 py-6 sm:gap-6')
  })

  test('mobile decorative hero content stays bounded within the viewport', () => {
    const wallSource = read('src/components/sections/LivingWall.tsx')
    const homeSource = read('src/app/(marketing)/page.tsx')
    const blogSource = read('src/app/(marketing)/blog/page.tsx')

    expect(wallSource).toContain('overflow-hidden bg-plinth')
    expect(wallSource).toContain('grid grid-cols-6')
    expect(wallSource).toContain("'max-[760px]:hidden'")
    expect(homeSource).not.toContain('hidden sm:block absolute left-1/4 top-0')
    expect(homeSource).not.toContain('hidden sm:block absolute top-1/2')
    expect(homeSource).not.toContain('hidden sm:block absolute -top-40 -right-40')
    expect(homeSource).not.toContain('hidden sm:block absolute -bottom-40 -left-40')
    expect(blogSource).toContain('<MarketingShell>')
    expect(blogSource).not.toContain('blur-3xl')
    expect(blogSource).not.toContain('bg-gradient')
  })

  test('homepage hero keeps the fairytale tone without sales-template chrome', () => {
    const source = read('src/components/sections/LivingWall.tsx')

    expect(source).toContain('Australian opals, <i>chosen by hand.</i>')
    expect(source).toContain('Enter the shop')
    expect(source).not.toContain('Limited Time: Up to')
    expect(source).not.toContain('Sparkles')
    expect(source).not.toContain('text-gradient-prismatic')
    expect(source).not.toContain('setInterval')
  })

  test('product gallery uses editorial framing instead of gradient glow chrome', () => {
    const source = read('src/components/product/ProductImageGallery.tsx')

    expect(source).toContain('aria-modal="true"')
    expect(source).not.toContain('bg-gradient')
    expect(source).not.toContain('mix-blend')
    expect(source).not.toContain('FEATURED')
    expect(source).not.toContain('shadow-2xl')
    expect(source).not.toContain('bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep')
  })

  test('mobile product sticky purchase bar waits until inline actions scroll away', () => {
    const source = read('src/components/product/ProductActions.tsx')

    expect(source).toContain('showStickyPurchaseBar')
    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('!entry.isIntersecting')
    expect(source).toContain('data-testid="inline-product-actions"')
    expect(source).not.toContain(
      'fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/30 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden'
    )
  })

  test('cart and search language stays warm without magical treasure wording', () => {
    const searchSource = read('src/components/search/SearchInput.tsx')
    const emptyStateSource = read('src/components/ui/EmptyStates.tsx')

    expect(searchSource).toContain("import { Search, X, Loader2 } from 'lucide-react'")
    expect(searchSource).toContain('placeholder="Search opals, rings, parcels"')
    expect(searchSource).not.toContain('Sparkles')
    expect(searchSource).not.toContain('magical')
    expect(emptyStateSource).toContain(
      'description="Looks like you haven\'t added any pieces yet. Explore our collection of unique Australian opals."'
    )
    expect(emptyStateSource).not.toContain('treasures')
  })

  test('product cards read as gallery pieces instead of generated action cards', () => {
    const source = read('src/components/product/ProductCard.tsx')

    expect(source).toContain('Quick view')
    expect(source).not.toContain('group-hover:scale-105')
    expect(source).not.toContain('hover:shadow-glow')
  })

  test('homepage collection sections use gallery restraint instead of template glow', () => {
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).toContain('Walk the <i>collection</i>')
    expect(source).not.toContain('text-gradient-prismatic')
    expect(source).not.toContain('bg-clip-text')
    expect(source).not.toContain('Sparkles')
    expect(source).not.toContain('shadow-2xl')
    expect(source).not.toContain('group-hover:scale-110')
    expect(source).not.toContain('absolute -inset-1 rounded-3xl bg-gradient-to-r')
  })

  test('product detail page keeps commerce hierarchy solid and mobile-friendly', () => {
    const source = read('src/app/(marketing)/store/[slug]/page.tsx')

    expect(source).toContain('flex flex-wrap items-baseline gap-x-3 gap-y-1')
    expect(source).not.toContain('bg-clip-text')
    expect(source).not.toContain('text-transparent')
    expect(source).not.toContain(
      'mt-20 bg-gradient-to-b from-white via-gray-50 to-white rounded-3xl p-12'
    )
  })

  test('core UI controls use motion restraint without hover scaling', () => {
    const buttonSource = read('src/components/ui/button.tsx')
    const gallerySource = read('src/components/product/ProductImageGallery.tsx')

    expect(buttonSource).toContain('transition-colors duration-200')
    expect(buttonSource).not.toContain('bg-gradient')
    expect(buttonSource).not.toContain('backdrop-blur')
    expect(buttonSource).not.toContain('hover:scale')
    expect(buttonSource).not.toContain('active:scale')
    expect(gallerySource).toContain('focus-visible:ring-2 focus-visible:ring-accent')
    expect(gallerySource).not.toContain('scale-105')
  })

  test('footer closes the site like a quiet gallery note', () => {
    const source = read('src/components/navigation/Footer.tsx')

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
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).toContain("collection: 'products'")
    expect(source).toContain('Stripe: card, Apple Pay and Klarna.')
    expect(source).toContain('photographed individually')
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

    expect(source).toContain('Sold')
    expect(source).not.toContain('SOLID')
    expect(source).not.toContain('Multiple variants')
    expect(source).not.toContain('Museum style info')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('bg-black')
    expect(source).not.toContain('scale:')
  })

  test('homepage language avoids leftover template phrases in feature sections', () => {
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).toContain('Design your own ring')
    expect(source).toContain('Learn to cut opal')
    expect(source).not.toContain('Where dreams become reality.')
    expect(source).not.toContain(
      'Fresh from our workshop - discover new masterpieces crafted with passion'
    )
    expect(source).not.toContain('bg-black-rich')
    expect(source).not.toContain('blur-3xl')
    expect(source).not.toContain('Magical sparkle effects')
    expect(source).not.toContain('from-black/80')
  })

  test('cookie controls and policy describe only technology that is actually enabled', () => {
    const consentSource = read('src/components/layout/CookieConsent.tsx')
    const policySource = read('src/app/(marketing)/legal/cookies/page.tsx')

    expect(consentSource).toContain('Accept analytics')
    expect(consentSource).toContain('Necessary only')
    expect(consentSource).not.toContain('Marketing Cookies')
    expect(consentSource).not.toContain('Preference Cookies')
    expect(consentSource).not.toContain('window.fbq')
    expect(policySource).toContain('Google Analytics')
    expect(policySource).toContain('Microsoft Clarity')
    expect(policySource).toContain('checkout-feedback-asked')
    expect(policySource).toContain('We do not currently use')
    expect(policySource).toContain('advertising, remarketing, or social-media tracking pixels')
    expect(policySource).not.toContain('Facebook Pixel')
    expect(policySource).not.toContain('Google Ads')
    expect(policySource).not.toContain('Wishlist')
  })

  test('shipping page matches the rates enforced during checkout', () => {
    const source = read('src/app/(marketing)/shipping/page.tsx')

    expect(source).toContain('SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS')
    expect(source).toContain('SHIPPING_CONFIG.RATES.INTERNATIONAL.EXPRESS')
    expect(source).toContain('SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD')
    expect(source).toContain('The carrier estimate is shown at checkout')
    expect(source).not.toContain('3–7 business days')
    expect(source).not.toContain('Free express')
  })

  test('legal pages describe the deployed guest checkout and data handling', () => {
    const terms = read('src/app/(marketing)/legal/terms/page.tsx')
    const privacy = read('src/app/(marketing)/legal/privacy/page.tsx')

    expect(terms).toContain('We currently offer guest checkout')
    expect(terms).toContain('Australian Consumer Law')
    expect(terms).not.toContain('When you create an account with us')
    expect(terms).not.toContain('binding arbitration')
    expect(privacy).toContain('Optional website usage analytics only after you consent')
    expect(privacy).toContain('We do not currently use advertising')
    expect(privacy).toContain('Microsoft Clarity')
    expect(privacy).not.toContain('Regular security assessments')
    expect(privacy).not.toContain('We ensure appropriate safeguards are in place')
  })

  test('product metadata and sitemap expose canonical conversion routes', () => {
    const product = read('src/app/(marketing)/store/[slug]/page.tsx')
    const sitemap = read('src/app/sitemap.ts')

    expect(product).toContain('alternates: { canonical: `/store/${product.slug}` }')
    expect(product).toContain("card: 'summary_large_image'")
    expect(product).toContain('sku: product.sku ?? String(product.id)')
    expect(sitemap).toContain("path: '/services/design'")
    expect(sitemap).toContain("path: '/legal/cookies'")
  })
})

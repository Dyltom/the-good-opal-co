import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Regression tests for UI audit 02-high-priority (items #4–#9).
 * Each test pins the exact source-level change so the WCAG / accessibility
 * fix can't silently regress in a future refactor.
 */

const read = (rel: string) =>
  readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('#5 SearchInput — aria-allowed-attr', () => {
  const source = read('src/components/search/SearchInput.tsx')

  test('either declares role="combobox" or drops aria-expanded', () => {
    const hasExpanded = /aria-expanded=/.test(source)
    const hasCombobox = /role=["']combobox["']/.test(source)
    expect(
      hasCombobox || !hasExpanded,
      'aria-expanded requires role="combobox" (or be removed)',
    ).toBe(true)
  })
})

describe('#6 Home hero/category LCP image — priority', () => {
  const source = read('src/components/sections/HomeHero.tsx')

  test('the product-led hero image is marked priority', () => {
    expect(source).toContain('priority')
    expect(source).toContain('sizes="(max-width: 1024px) 100vw, 56vw"')
  })
})

describe('#7 RelatedProducts — image resolution', () => {
  const source = read('src/components/product/RelatedProducts.tsx')

  test('derives the card image from images[0].image.url, not a bare .image field', () => {
    // The old code read `relatedProduct.image` which is never a string after
    // a depth:2 fetch — that's why tiles rendered as grey placeholders.
    expect(source).toMatch(/images\?\.\[0\]\?\.image/)
  })
})

describe('#8 ProductHero carousel dots — target size', () => {
  const source = read('src/components/sections/ProductHero.tsx')

  test('dot button expands hit area to ≥24px via padding', () => {
    // Visual dot can remain 8x8, but the clickable target must meet WCAG 2.5.8
    // (≥24x24). We enforce that the button element itself carries padding
    // (or an explicit ≥24px min size) within ~400 chars of the "Go to product"
    // aria-label — same JSX element, not a later one.
    const idx = source.indexOf('Go to product')
    expect(idx, 'dot indicator block not found').toBeGreaterThan(-1)
    const window = source.slice(Math.max(0, idx - 400), idx + 200)
    expect(window).toMatch(/\bp-[234]\b|min-(w|h)-\[?24/)
  })
})

describe('#9 Store listing — heading order', () => {
  const source = read('src/app/(marketing)/store/store-content.tsx')

  test('the product grid is preceded by an <h2> in the main content area', () => {
    // Skipping h1 → h3 (ProductCard) trips axe heading-order. A visually
    // hidden h2 above the grid satisfies semantics without a design change.
    expect(source).toMatch(/<h2[^>]*>[\s\S]*?(products|collection|pieces)/i)
    // And specifically a screen-reader-only h2 if no visible one is added.
    const hasSrOnlyH2 = /<h2[^>]*sr-only/.test(source)
    const hasVisibleGridH2 = /<h2[^>]*>[\s\S]*?(Current collection|All Products)/i.test(
      source,
    )
    expect(hasSrOnlyH2 || hasVisibleGridH2).toBe(true)
  })
})

describe('mobile touch target safeguards', () => {
  test('interactive mobile commerce controls provide 44px hit areas', () => {
    const addToCartSource = read('src/components/cart/AddToCartButton.tsx')
    const productCardSource = read('src/components/product/ProductCard.tsx')
    const productHeroSource = read('src/components/sections/ProductHero.tsx')
    const cookieSource = read('src/components/layout/CookieConsent.tsx')
    const searchSource = read('src/components/search/SearchInput.tsx')

    expect(addToCartSource).toContain("sm: 'min-h-[44px]")
    expect(addToCartSource).toContain("md: 'min-h-[44px]")
    expect(addToCartSource).toContain("sm: 'h-11 w-11")
    expect(productCardSource).toContain('min-h-[44px] min-w-[44px]')
    expect(productHeroSource).toContain('min-h-[44px] min-w-[44px]')
    expect(cookieSource).toContain('min-h-[44px] min-w-[44px]')
    expect(searchSource).toContain('min-h-[44px] min-w-[44px]')
  })
})

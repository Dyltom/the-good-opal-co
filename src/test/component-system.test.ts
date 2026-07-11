import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('shared storefront component system', () => {
  test('site navigation owns the canonical navigation configuration', () => {
    const siteNavigation = read('src/components/navigation/SiteNavigation.tsx')
    const navigationConstants = read('src/lib/constants/navigation.ts')

    expect(siteNavigation).toContain('getNavigationProps')
    expect(navigationConstants).toContain("{ href: '/services', label: 'Custom' }")
    expect(navigationConstants).toContain("{ href: '/courses', label: 'Courses' }")
  })

  test('marketing shell owns navigation, main semantics, and footer', () => {
    const shell = read('src/components/marketing/MarketingShell.tsx')

    expect(shell).toContain('<SiteNavigation />')
    expect(shell).toContain('id="main-content"')
    expect(shell).toContain('tabIndex={-1}')
    expect(shell).toContain('<Footer />')
  })

  test.each([
    'about/page.tsx',
    'cart/page.tsx',
    'checkout/page.tsx',
    'contact/page.tsx',
    'courses/page.tsx',
    'faq/page.tsx',
    'returns/page.tsx',
    'services/page.tsx',
    'shipping/page.tsx',
    'store/page.tsx',
  ])('%s consumes the shared marketing shell', (page) => {
    const source = read(`src/app/(marketing)/${page}`)

    expect(source).toContain('<MarketingShell')
    expect(source).not.toContain('<Navigation')
  })

  test('shared button variants stay flat and token-driven', () => {
    const source = read('src/components/ui/button.tsx')

    expect(source).toContain("'bg-charcoal text-cream hover:bg-charcoal-dark'")
    expect(source).not.toContain('bg-gradient')
    expect(source).not.toContain('glass')
    expect(source).not.toContain('shimmer')
  })
})

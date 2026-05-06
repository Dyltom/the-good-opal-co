import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('Typography Configuration', () => {
  test('marketing layout loads the project font families', () => {
    const source = read('src/app/(marketing)/layout.tsx')

    expect(source).toContain('Merriweather')
    expect(source).toContain('EB_Garamond')
    expect(source).toContain('Dancing_Script')
  })

  test('global CSS maps semantic font variables to the project fonts', () => {
    const source = read('src/app/globals.css')

    expect(source).toContain("--font-sans: 'Merriweather'")
    expect(source).toContain("--font-serif: 'EB Garamond'")
    expect(source).toContain("--font-accent: 'Dancing Script'")
  })

  test('typography documentation matches the shipped font families', () => {
    const designSystem = read('docs/DESIGN_SYSTEM.md')
    const typographyGuide = read('docs/TYPOGRAPHY_GUIDE.md')

    expect(designSystem).toContain("EB Garamond")
    expect(designSystem).toContain("Merriweather")
    expect(designSystem).toContain("Dancing Script")
    expect(typographyGuide).toContain("EB Garamond")
    expect(typographyGuide).toContain("Merriweather")
    expect(typographyGuide).toContain("Dancing Script")
    expect(`${designSystem}\n${typographyGuide}`).not.toContain("Playfair Display")
    expect(`${designSystem}\n${typographyGuide}`).not.toContain("Inter")
    expect(`${designSystem}\n${typographyGuide}`).not.toContain("Montserrat")
  })

  test('Tailwind font-display resolves through the serif heading family', () => {
    const source = read('tailwind.config.ts')

    expect(source).toMatch(/display:\s*\[[\s\S]*'var\(--font-serif\)'/)
    expect(source).not.toContain('Playfair Display')
    expect(source).not.toContain('Fraunces')
  })

  test('global headings do not compress letter spacing', () => {
    const source = read('src/app/globals.css')

    expect(source).not.toMatch(/letter-spacing:\s*-/)
    expect(source.match(/letter-spacing:\s*0;/g)?.length).toBeGreaterThanOrEqual(3)
  })

  test('Tailwind tracking utilities resolve to neutral spacing', () => {
    const source = read('tailwind.config.ts')

    expect(source).toMatch(/letterSpacing:\s*{[\s\S]*tighter:\s*'0'/)
    expect(source).toMatch(/letterSpacing:\s*{[\s\S]*tight:\s*'0'/)
    expect(source).toMatch(/letterSpacing:\s*{[\s\S]*wider:\s*'0'/)
  })

  test('typography presets keep display type relaxed and readable', () => {
    const source = read('src/lib/constants/typography.ts')
    const displayBlock = source.match(/display:\s*{([\s\S]*?)\n  },/)?.[1] ?? ''
    const bodyBlock = source.match(/body:\s*{([\s\S]*?)\n  },/)?.[1] ?? ''

    expect(source).not.toMatch(/tracking-tight(?:er)?/)
    expect(displayBlock).not.toContain('font-bold')
    expect(displayBlock).toContain('font-semibold')
    expect(bodyBlock).toContain("base: 'text-base leading-relaxed'")
    expect(source).toContain("overline: 'text-xs font-semibold uppercase tracking-normal'")
  })

  test('navigation brand typography stays compact without script or tight tracking', () => {
    const source = read('src/components/navigation/Navigation.tsx')
    const brandBlock = source.match(/<div className="flex flex-col min-w-0">([\s\S]*?)<\/div>/)?.[1] ?? ''

    expect(brandBlock).not.toContain('tracking-tight')
    expect(brandBlock).not.toContain('font-accent')
  })

  test('homepage section headings avoid oversized or script-heavy display type', () => {
    const source = read('src/app/(marketing)/page.tsx')

    expect(source).not.toContain('lg:text-7xl')
    expect(source).not.toContain('font-extrabold')
    expect(source).not.toMatch(/Shop by <span className="font-accent/)
    expect(source).not.toMatch(/Latest <span className="font-accent/)
    expect(source).not.toMatch(/Handmade in <span className="font-accent/)
  })

  test('hero display type uses the restrained heading system', () => {
    const source = read('src/components/sections/ProductHero.tsx')
    const heroHeading = source.match(/<motion\.h1[\s\S]*?<\/motion\.h1>/)?.[0] ?? ''

    expect(heroHeading).not.toContain('xl:text-7xl')
    expect(heroHeading).not.toContain('font-bold')
    expect(heroHeading).toContain('font-semibold')
    expect(source).not.toContain('font-accent text-2xl')
  })
})

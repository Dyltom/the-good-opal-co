import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Regression test for UI audit 01-critical #1:
 * Next 15 rejects `ssr: false` inside `next/dynamic()` calls made from
 * Server Components. The marketing home page is a Server Component
 * (no `'use client'`), so no dynamic import in this file may disable SSR.
 */
describe('(marketing) home page — Next 15 Server Component constraints', () => {
  const pagePath = resolve(__dirname, '../page.tsx')
  const source = readFileSync(pagePath, 'utf-8')

  test('is a Server Component (no "use client" directive)', () => {
    const firstNonEmptyLine = source
      .split('\n')
      .find((line) => line.trim().length > 0)
      ?.trim()
    expect(firstNonEmptyLine).not.toMatch(/^['"]use client['"]/)
  })

  test('no dynamic() call passes ssr: false', () => {
    // Server Components + `ssr: false` in next/dynamic breaks compile in Next 15.
    expect(source).not.toMatch(/ssr:\s*false/)
  })
})

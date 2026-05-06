import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Typography - font-display class', () => {
  const tailwindConfig = readFileSync(resolve(__dirname, '..', '..', '..', 'tailwind.config.ts'), 'utf-8')

  test('is defined through the serif font token', () => {
    const displayBlock = tailwindConfig.match(/display:\s*\[[\s\S]*?\]/)?.[0]

    expect(displayBlock).toContain('var(--font-serif)')
    expect(displayBlock).toContain('EB Garamond')
    expect(displayBlock).toContain('Georgia')
    expect(displayBlock).toContain('serif')
  })
})

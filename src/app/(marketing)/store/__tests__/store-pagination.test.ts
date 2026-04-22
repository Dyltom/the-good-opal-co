import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { paginate, totalPages } from '@/lib/pagination'

/**
 * Regression test for UI audit 01-critical #3:
 * /store previously rendered all 126 products in a single grid.
 * The listing must now paginate so no page renders more than
 * PRODUCTS_PER_PAGE (24) cards.
 */
describe('/store pagination', () => {
  const source = readFileSync(
    resolve(__dirname, '../store-content.tsx'),
    'utf-8',
  )

  test('store-content declares a PRODUCTS_PER_PAGE constant of 24 or fewer', () => {
    const match = source.match(/const\s+PRODUCTS_PER_PAGE\s*=\s*(\d+)/)
    expect(match, 'PRODUCTS_PER_PAGE must be declared').not.toBeNull()
    expect(Number(match![1])).toBeLessThanOrEqual(24)
  })

  test('the product grid renders the paginated slice, not the full sorted list', () => {
    // The grid must map over `pagedProducts`, otherwise 126 cards land on the DOM.
    expect(source).toMatch(/pagedProducts\.map/)
    expect(source).not.toMatch(/sortedProducts\.map/)
  })

  test('page state is seeded from the ?page= search param', () => {
    expect(source).toMatch(/searchParams\??\.get\(['"]page['"]\)/)
  })

  test('URL sync writes ?page=N for pages beyond the first', () => {
    expect(source).toMatch(/params\.set\(['"]page['"]/)
  })

  test('given 126 products and PRODUCTS_PER_PAGE=24, pagination produces 6 capped pages', () => {
    const items = Array.from({ length: 126 }, (_, i) => i)
    const pageSize = 24
    const count = totalPages(items.length, pageSize)
    expect(count).toBe(6)
    for (let page = 1; page <= count; page++) {
      expect(paginate(items, page, pageSize).length).toBeLessThanOrEqual(pageSize)
    }
  })
})

import { describe, test, expect } from 'vitest'
import { paginate, clampPage, totalPages } from '../pagination'

describe('paginate()', () => {
  const items = Array.from({ length: 57 }, (_, i) => i + 1)

  test('returns the first pageSize items for page 1', () => {
    expect(paginate(items, 1, 24)).toEqual(items.slice(0, 24))
  })

  test('returns the correct slice for a middle page', () => {
    expect(paginate(items, 2, 24)).toEqual(items.slice(24, 48))
  })

  test('returns the remaining items for the last page', () => {
    expect(paginate(items, 3, 24)).toEqual(items.slice(48, 57))
  })

  test('returns an empty array when page is past the end', () => {
    expect(paginate(items, 99, 24)).toEqual([])
  })

  test('returns the full list when pageSize exceeds length', () => {
    expect(paginate(items, 1, 500)).toEqual(items)
  })
})

describe('totalPages()', () => {
  test('rounds up partial pages', () => {
    expect(totalPages(57, 24)).toBe(3)
  })

  test('returns 1 for an empty list (avoid 0 pages)', () => {
    expect(totalPages(0, 24)).toBe(1)
  })

  test('returns exact count when items divide evenly', () => {
    expect(totalPages(48, 24)).toBe(2)
  })
})

describe('clampPage()', () => {
  test('clamps below-range values to 1', () => {
    expect(clampPage(0, 5)).toBe(1)
    expect(clampPage(-3, 5)).toBe(1)
    expect(clampPage(NaN, 5)).toBe(1)
  })

  test('clamps above-range values to total', () => {
    expect(clampPage(99, 5)).toBe(5)
  })

  test('passes through valid page numbers', () => {
    expect(clampPage(3, 5)).toBe(3)
  })
})

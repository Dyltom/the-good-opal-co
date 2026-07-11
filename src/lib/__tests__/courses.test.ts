import { describe, expect, test } from 'vitest'
import { courseInterestHref, courseTopics } from '@/lib/courses'

describe('course public helpers', () => {
  test('builds a bounded contact handoff without payment or enrollment state', () => {
    const href = courseInterestHref('The Complete Opal Cutting & Valuation Course')
    const query = new URL(href, 'https://example.com').searchParams

    expect(query.get('subject')).toBe('course-interest')
    expect(query.get('product')).toBe('The Complete Opal Cutting & Valuation Course')
    expect(query.get('message')).toContain('register my interest')
    expect(href).not.toContain('price')
    expect(href).not.toContain('checkout')
  })

  test('turns editor topic lines into a clean public list', () => {
    expect(courseTopics('Colour bars and potch\n\n Safety first \nPolishing')).toEqual([
      'Colour bars and potch',
      'Safety first',
      'Polishing',
    ])
  })
})

import { describe, expect, test } from 'vitest'
import { contactSchema } from '@/app/(marketing)/contact/schema'
import {
  cleanContactContext,
  cleanDesignConfiguration,
  resolveInquiryType,
} from '@/app/(marketing)/contact/contact-intent'

describe('contact lead intent', () => {
  test('preserves custom and product-viewing intent from links', () => {
    expect(resolveInquiryType('custom-design')).toBe('custom-design')
    expect(resolveInquiryType('virtual-viewing')).toBe('virtual-viewing')
    expect(resolveInquiryType('course-interest')).toBe('course-interest')
    expect(resolveInquiryType('workshop')).toBe('course-interest')
    expect(resolveInquiryType('unknown-campaign')).toBe('general')
  })

  test('keeps product context bounded before it reaches the form', () => {
    expect(cleanContactContext('  Lightning Ridge ring  ')).toBe('Lightning Ridge ring')
    expect(cleanContactContext('x'.repeat(200))).toHaveLength(160)
    expect(cleanDesignConfiguration(`  ${JSON.stringify({ metal: '9k-yellow-gold' })}  `)).toBe(
      JSON.stringify({ metal: '9k-yellow-gold' })
    )
    expect(cleanDesignConfiguration('x'.repeat(1200))).toHaveLength(1000)
  })

  test('accepts practical custom brief fields and rejects incomplete messages', () => {
    const complete = contactSchema.safeParse({
      name: 'Alex Stone',
      email: 'alex@example.com',
      inquiryType: 'custom-design',
      product: 'Blue-green oval opal',
      budget: 'AUD $2,000–$3,000',
      timeline: 'Anniversary in November',
      designConfiguration: JSON.stringify({
        metal: 'sterling-silver',
        stone: 'blue-green',
        style: 'gemini',
        shape: 'oval',
        setting: 'bezel',
        band: 'classic',
        size: 7,
      }),
      message: 'I would like to discuss a simple yellow-gold pendant.',
    })

    expect(complete.success).toBe(true)
    expect(
      contactSchema.safeParse({
        name: 'A',
        email: 'not-an-email',
        inquiryType: 'custom-design',
        message: 'Too short',
      }).success
    ).toBe(false)
  })

  test('accepts a course interest lead without payment or enrollment claims', () => {
    expect(
      contactSchema.safeParse({
        name: 'Jamie Opal',
        email: 'jamie@example.com',
        inquiryType: 'course-interest',
        product: 'The Complete Opal Cutting & Valuation Course',
        message: 'I am a beginner and would like to learn the sandpaper cutting method.',
      }).success
    ).toBe(true)
  })
})

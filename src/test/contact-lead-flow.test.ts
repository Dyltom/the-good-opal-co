import { describe, expect, test } from 'vitest'
import { contactSchema } from '@/app/(marketing)/contact/schema'
import {
  cleanContactContext,
  resolveInquiryType,
} from '@/app/(marketing)/contact/contact-intent'

describe('contact lead intent', () => {
  test('preserves custom and product-viewing intent from links', () => {
    expect(resolveInquiryType('custom-design')).toBe('custom-design')
    expect(resolveInquiryType('virtual-viewing')).toBe('virtual-viewing')
    expect(resolveInquiryType('unknown-campaign')).toBe('general')
  })

  test('keeps product context bounded before it reaches the form', () => {
    expect(cleanContactContext('  Lightning Ridge ring  ')).toBe('Lightning Ridge ring')
    expect(cleanContactContext('x'.repeat(200))).toHaveLength(160)
  })

  test('accepts practical custom brief fields and rejects incomplete messages', () => {
    const complete = contactSchema.safeParse({
      name: 'Alex Stone',
      email: 'alex@example.com',
      inquiryType: 'custom-design',
      product: 'Blue-green oval opal',
      budget: 'AUD $2,000–$3,000',
      timeline: 'Anniversary in November',
      message: 'I would like to discuss a simple yellow-gold pendant.',
    })

    expect(complete.success).toBe(true)
    expect(contactSchema.safeParse({
      name: 'A',
      email: 'not-an-email',
      inquiryType: 'custom-design',
      message: 'Too short',
    }).success).toBe(false)
  })
})

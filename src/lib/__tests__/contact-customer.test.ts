import { describe, expect, test } from 'vitest'
import type { Customer } from '@/types/payload-types'
import { contactCustomerMutation } from '@/lib/contact-customer'

describe('contact customer CRM mutation', () => {
  test('creates a normalized contact lead without marketing opt-in or purchase totals', () => {
    expect(
      contactCustomerMutation({
        email: ' Buyer@Example.com ',
        inquiryType: 'custom-design',
        name: 'Opal Buyer',
      })
    ).toEqual({
      kind: 'create',
      data: {
        email: 'buyer@example.com',
        name: 'Opal Buyer',
        phone: undefined,
        source: 'contact',
        tags: [{ tag: 'interest:custom-design' }],
        totalOrders: 0,
        totalSpent: 0,
      },
    })
  })

  test('preserves existing identity, source, and commerce totals while deduplicating intent', () => {
    const existing = {
      id: 7,
      email: 'buyer@example.com',
      name: 'Existing Buyer',
      phone: '0400000000',
      source: 'checkout',
      totalOrders: 3,
      totalSpent: 750,
      tags: [{ tag: 'interest:custom-design' }],
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    } as Customer

    expect(
      contactCustomerMutation(
        {
          email: existing.email,
          inquiryType: 'custom-design',
          name: 'Replacement Name',
          phone: '0411111111',
        },
        existing
      )
    ).toEqual({
      kind: 'update',
      data: {
        name: 'Existing Buyer',
        phone: '0400000000',
        tags: [{ tag: 'interest:custom-design' }],
      },
    })
  })
})

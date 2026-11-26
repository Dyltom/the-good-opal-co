import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

const m = vi.hoisted(() => ({
  send: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  orders: [] as Record<string, unknown>[],
  customers: {} as Record<string, Record<string, unknown>>,
}))

vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: m.send }
  },
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({ find: m.find, create: m.create }),
}))

import { sendReviewRequests } from '../review-request'

const now = new Date('2026-11-27T23:15:00Z')
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()

type Where = { and: Record<string, Record<string, unknown>>[] }

function matches(order: Record<string, unknown>, where: Where): boolean {
  return where.and.every((clause) =>
    Object.entries(clause).every(([field, op]) => {
      const value = order[field] as string | undefined
      if ('in' in op) return (op['in'] as string[]).includes(value ?? '')
      if ('greater_than_equal' in op) return value !== undefined && value >= (op['greater_than_equal'] as string)
      if ('less_than' in op) return value !== undefined && value < (op['less_than'] as string)
      return false
    })
  )
}

function order(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    orderNumber: `OPAL-${id}`,
    source: 'stripe',
    status: 'shipped',
    shipmentEmailSentAt: daysAgo(10.5),
    customer: { email: `buyer${id}@example.com`, name: 'Sam Taylor' },
    items: [{ name: 'Black Opal Ring', slug: 'black-opal-ring', price: 450, quantity: 1 }],
    ...overrides,
  }
}

describe('review request emails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    vi.stubEnv('CONTACT_EMAIL', 'steph@example.com')
    vi.stubEnv('PAYLOAD_SECRET', 'secret')
    m.customers = {}
    m.send.mockResolvedValue({ data: { id: 'email' }, error: null })
    m.create.mockImplementation(async ({ data }) => ({ id: 99, ...data }))
    m.find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'orders') return { docs: m.orders.filter((o) => matches(o, where)) }
      const customer = m.customers[where.email.equals]
      return { docs: customer ? [customer] : [] }
    })
  })

  it('emails only paid, shipped site orders whose shipping email went out 10 to 11 days ago', async () => {
    m.orders = [
      order(1),
      order(2, { source: 'paypal', status: 'delivered' }),
      order(3, { source: 'woocommerce' }),
      order(4, { status: 'refunded' }),
      order(5, { status: 'disputed' }),
      order(6, { shipmentEmailSentAt: daysAgo(9.9) }),
      order(7, { shipmentEmailSentAt: daysAgo(11.1) }),
    ]

    expect(await sendReviewRequests(now)).toEqual({ sent: 2, skipped: { unsubscribed: 0 }, failed: 0 })

    expect(m.send.mock.calls.map(([message]) => message.to)).toEqual([
      'buyer1@example.com',
      'buyer2@example.com',
    ])
    const [message, options] = m.send.mock.calls[0] ?? []
    expect(options).toEqual({ idempotencyKey: 'review-request/1' })
    expect(message.replyTo).toBe('steph@example.com')
    expect(message.headers['List-Unsubscribe']).toMatch(/^<https:\/\/goodopalco.com\/api\/newsletter\/unsubscribe\?token=/)
    const html = renderToStaticMarkup(message.react as ReactElement)
    expect(html).toContain('Hi Sam')
    expect(html).toContain('https://goodopalco.com/store/black-opal-ring')
    expect(html).toContain('mailto:steph@example.com?subject=About%20my%20order%20OPAL-1')
  })

  it('skips customers who unsubscribed or turned the newsletter off', async () => {
    m.orders = [order(1), order(2), order(3)]
    m.customers = {
      'buyer1@example.com': { id: 1, tags: [{ tag: 'unsubscribed' }] },
      'buyer2@example.com': { id: 2, subscribedToNewsletter: false, subscribedAt: daysAgo(30) },
      'buyer3@example.com': { id: 3, subscribedToNewsletter: false },
    }

    expect(await sendReviewRequests(now)).toEqual({ sent: 1, skipped: { unsubscribed: 2 }, failed: 0 })
    expect(m.send.mock.calls[0]?.[0].to).toBe('buyer3@example.com')
  })

  it('keeps sending after one email fails', async () => {
    m.orders = [order(1), order(2)]
    m.send.mockResolvedValueOnce({ data: null, error: { message: 'rejected' } })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await sendReviewRequests(now)).toEqual({ sent: 1, skipped: { unsubscribed: 0 }, failed: 1 })
  })
})

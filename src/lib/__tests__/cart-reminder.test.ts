import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import type Stripe from 'stripe'

const m = vi.hoisted(() => ({
  send: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  inStock: ['11'] as string[],
  customer: undefined as Record<string, unknown> | undefined,
  orders: [] as unknown[],
}))

vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: m.send }
  },
}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({ find: m.find, create: m.create }),
}))

import { sendCartReminder, type ReminderLine } from '../cart-reminder'
import { readCampaignUnsubscribeToken } from '@/lib/newsletter/campaign-unsubscribe-token'

const lines: ReminderLine[] = [
  {
    productId: '11',
    slug: 'black-opal-ring',
    name: 'Black Opal Ring',
    price: 450,
    quantity: 1,
    image: '/ring.jpg',
  },
  { productId: '12', slug: 'crystal-pendant', name: 'Crystal Pendant', price: 220, quantity: 1 },
]

let sessionCount = 0
function session(email: string, metadata: Record<string, string> = { marketing_consent: 'yes' }) {
  sessionCount += 1
  return {
    id: `cs_test_${sessionCount}`,
    created: 1_784_000_000,
    customer_email: email,
    metadata,
  } as unknown as Stripe.Checkout.Session
}

function sentHtml(): string {
  const [message] = m.send.mock.calls[0] ?? []
  return renderToStaticMarkup(message.react as ReactElement)
}

describe('bag reminder email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_KV_REST_API_URL', '')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com/')
    vi.stubEnv('EMAIL_FROM', 'shop@example.com')
    vi.stubEnv('PAYLOAD_SECRET', 'secret')
    m.inStock = ['11']
    m.customer = undefined
    m.orders = []
    m.send.mockResolvedValue({ data: { id: 'email' }, error: null })
    m.create.mockImplementation(async ({ data }) => ({ id: 99, ...data }))
    m.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'products') return { docs: m.inStock.map((id) => ({ id: Number(id) })) }
      if (collection === 'customers') return { docs: m.customer ? [m.customer] : [] }
      return { docs: m.orders }
    })
  })

  it('emails one reminder listing only the pieces still in stock, with a working unsubscribe link', async () => {
    const expired = session('one@example.com')

    expect(await sendCartReminder(expired, lines)).toBe('sent')

    expect(m.send).toHaveBeenCalledTimes(1)
    const [message, options] = m.send.mock.calls[0] ?? []
    expect(options).toEqual({ idempotencyKey: `cart-reminder/${expired.id}` })
    expect(message.to).toBe('one@example.com')
    const html = sentHtml()
    expect(html).toContain('Black Opal Ring')
    expect(html).toContain('https://goodopalco.com/store/black-opal-ring')
    expect(html).toContain('https://goodopalco.com/cart')
    expect(html).toContain('Cowra NSW')
    expect(html).not.toContain('Crystal Pendant')
    const unsubscribe = message.headers['List-Unsubscribe'].slice(1, -1)
    expect(html).toContain(unsubscribe.replaceAll('&', '&amp;'))
    const token = decodeURIComponent(new URL(unsubscribe).searchParams.get('token') ?? '')
    expect(readCampaignUnsubscribeToken(token, 'secret')).toBe('99')
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'customers',
        data: expect.objectContaining({ email: 'one@example.com', subscribedToNewsletter: false }),
      })
    )
  })

  it('sends nothing without consent', async () => {
    expect(await sendCartReminder(session('two@example.com', {}), lines)).toBe('no-consent')
    expect(m.send).not.toHaveBeenCalled()
  })

  it('sends nothing when every piece has sold', async () => {
    m.inStock = []
    expect(await sendCartReminder(session('three@example.com'), lines)).toBe('sold-out')
    expect(m.send).not.toHaveBeenCalled()
  })

  it('sends nothing to an address that unsubscribed', async () => {
    m.customer = {
      id: 5,
      email: 'four@example.com',
      subscribedToNewsletter: false,
      tags: [{ tag: 'unsubscribed' }],
    }
    expect(await sendCartReminder(session('four@example.com'), lines)).toBe('unsubscribed')
    expect(m.send).not.toHaveBeenCalled()
  })

  it('sends nothing to someone who has ordered since', async () => {
    m.orders = [{ id: 1 }]
    expect(await sendCartReminder(session('five@example.com'), lines)).toBe('ordered-since')
    expect(m.send).not.toHaveBeenCalled()
  })

  it('sends at most one reminder per address a week', async () => {
    expect(await sendCartReminder(session('six@example.com'), lines)).toBe('sent')
    expect(await sendCartReminder(session('six@example.com'), lines)).toBe('rate-limited')
    expect(m.send).toHaveBeenCalledTimes(1)
  })
})

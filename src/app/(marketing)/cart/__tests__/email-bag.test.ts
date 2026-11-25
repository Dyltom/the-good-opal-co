import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  getCart: vi.fn(),
  forwardedFor: '203.0.113.20',
}))

vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: mocks.send }
  },
}))
vi.mock('@/lib/cart', () => ({ getCart: mocks.getCart }))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': mocks.forwardedFor }),
}))

import { emailMyBag } from '../email-bag'

function request(email: string, extra: Record<string, string> = { js: '1' }) {
  const form = new FormData()
  form.set('email', email)
  for (const [key, value] of Object.entries(extra)) form.set(key, value)
  return emailMyBag(null, form)
}

describe('email me this bag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_KV_REST_API_URL', '')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com/')
    vi.stubEnv('EMAIL_FROM', 'shop@example.com')
    mocks.send.mockResolvedValue({ data: { id: 'email' }, error: null })
    mocks.getCart.mockResolvedValue({
      items: [
        {
          productId: '28',
          slug: 'sun-and-moon-ring-1',
          name: 'Crystal Opal Ring – Sun and Moon Ring',
          price: 297.5,
          quantity: 1,
          image: '/api/media/file/sun-moon.jpg',
        },
      ],
      total: 297.5,
      itemCount: 1,
    })
  })

  it('emails the shopper a link to each piece in their bag and back to the bag', async () => {
    mocks.forwardedFor = '203.0.113.21'

    expect(await request('shopper@example.com')).toMatchObject({ success: true })

    expect(mocks.send).toHaveBeenCalledTimes(1)
    const [message] = mocks.send.mock.calls[0] ?? []
    expect(message).toMatchObject({
      to: 'shopper@example.com',
      subject: 'Your bag from The Good Opal Co',
    })
    const html = renderToStaticMarkup(message.react as ReactElement)
    expect(html).toContain('https://goodopalco.com/store/sun-and-moon-ring-1')
    expect(html).toContain('https://goodopalco.com/api/media/file/sun-moon.jpg')
    expect(html).toContain('https://goodopalco.com/cart')
    expect(html).toContain('$297.50')
  })

  it('answers a script that posts without loading the page but emails nobody', async () => {
    mocks.forwardedFor = '203.0.113.22'

    expect(await request('victim@example.com', {})).toMatchObject({ success: true })
    expect(await request('victim@example.com', { js: '1', website: 'x' })).toMatchObject({
      success: true,
    })

    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('stops one connection from emailing a string of different addresses', async () => {
    mocks.forwardedFor = '203.0.113.23'

    const results = []
    for (const email of ['a@example.com', 'b@example.com', 'c@example.com', 'd@example.com']) {
      results.push((await request(email)).success)
    }

    expect(results).toEqual([true, true, true, false])
    expect(mocks.send).toHaveBeenCalledTimes(3)
  })
})

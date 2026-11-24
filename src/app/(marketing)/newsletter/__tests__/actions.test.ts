import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  forwardedFor: '203.0.113.7',
}))

vi.mock('@/lib/newsletter/service', () => ({
  getNewsletterService: () => ({ subscribe: mocks.subscribe }),
}))

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': mocks.forwardedFor }),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { subscribeToNewsletter } from '../actions'

function signup(email: string, extra: Record<string, string> = {}) {
  const form = new FormData()
  form.set('email', email)
  form.set('source', 'footer')
  for (const [key, value] of Object.entries(extra)) form.set(key, value)
  return subscribeToNewsletter(null, form)
}

describe('newsletter signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_KV_REST_API_URL', '')
    mocks.subscribe.mockResolvedValue({ success: true, message: 'ok', requiresConfirmation: true })
  })

  it('answers a bot that fills the hidden field like a person but emails nobody', async () => {
    mocks.forwardedFor = '203.0.113.1'

    const result = await signup('victim@example.com', { website: 'http://spam.example' })

    expect(result).toMatchObject({ success: true, requiresConfirmation: true })
    expect(mocks.subscribe).not.toHaveBeenCalled()
  })

  it('stops one connection from signing up a string of different addresses', async () => {
    mocks.forwardedFor = '203.0.113.2'

    const results = []
    for (const email of ['a@example.com', 'b@example.com', 'c@example.com', 'd@example.com']) {
      results.push(await signup(email))
    }

    expect(results.map((result) => result.success)).toEqual([true, true, true, false])
    expect(mocks.subscribe).toHaveBeenCalledTimes(3)
  })
})

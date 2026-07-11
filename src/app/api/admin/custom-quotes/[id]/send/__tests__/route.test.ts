import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { auth, deliverCustomQuote, findByID, update } = vi.hoisted(() => ({
  auth: vi.fn(),
  deliverCustomQuote: vi.fn(),
  findByID: vi.fn(),
  update: vi.fn(),
}))
const payload = { auth, findByID, update }

vi.mock('@/lib/payload', () => ({ getPayload: async () => payload }))
vi.mock('@/lib/custom-quotes/delivery', () => ({ deliverCustomQuote }))

import { POST } from '../route'

const quote = {
  id: 42,
  status: 'draft',
  validUntil: new Date(Date.now() + 86_400_000).toISOString(),
  deliveryAttemptCount: 1,
}

function request(origin = 'https://goodopalco.com') {
  return new NextRequest('https://goodopalco.com/api/admin/custom-quotes/42/send', {
    method: 'POST',
    headers: { origin },
  })
}

describe('admin custom quote delivery endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.mockResolvedValue({ user: { id: 1, role: 'admin' } })
    findByID.mockResolvedValue(quote)
    update.mockResolvedValue({})
    deliverCustomQuote.mockResolvedValue({
      providerId: 'email_123',
      sentAt: '2026-07-12T00:00:00.000Z',
    })
  })

  it('rejects cross-origin and unauthenticated sends', async () => {
    expect(
      (await POST(request('https://evil.test'), { params: Promise.resolve({ id: '42' }) })).status
    ).toBe(403)
    auth.mockResolvedValue({ user: null })
    expect((await POST(request(), { params: Promise.resolve({ id: '42' }) })).status).toBe(403)
    expect(deliverCustomQuote).not.toHaveBeenCalled()
  })

  it('persists an issuing attempt before email, then atomically exposes verified sent evidence', async () => {
    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })
    expect(response.status).toBe(200)
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        context: { quoteDeliveryEvidence: true },
        data: expect.objectContaining({ deliveryStatus: 'issuing', deliveryAttemptCount: 2 }),
      })
    )
    expect(deliverCustomQuote).toHaveBeenCalledWith(quote, payload)
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        context: { quoteDeliveryEvidence: true },
        data: expect.objectContaining({
          status: 'sent',
          deliveryStatus: 'sent',
          customerEmailProviderId: 'email_123',
        }),
      })
    )
  })

  it('keeps a retryable failed delivery record without marking the quote sent', async () => {
    deliverCustomQuote.mockRejectedValue(new Error('Resend unavailable'))
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })
    expect(response.status).toBe(502)
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: {
          deliveryStatus: 'failed',
          customerEmailError: 'Resend unavailable',
        },
      })
    )
    expect(update.mock.calls.some((call) => call[0]?.data?.status === 'sent')).toBe(false)
    errorLog.mockRestore()
  })
})

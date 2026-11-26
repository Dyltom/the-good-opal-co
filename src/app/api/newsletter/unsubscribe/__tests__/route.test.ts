import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createCampaignUnsubscribeToken } from '@/lib/newsletter/campaign-unsubscribe-token'

const m = vi.hoisted(() => ({ find: vi.fn(), findByID: vi.fn(), update: vi.fn() }))

vi.mock('resend', () => ({ Resend: class {} }))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({ find: m.find, findByID: m.findByID, update: m.update }),
}))

import { GET, POST } from '../route'

function request(method: 'GET' | 'POST', token: string) {
  return new NextRequest(
    `https://goodopalco.com/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
    { method, body: method === 'POST' ? 'List-Unsubscribe=One-Click' : undefined }
  )
}

describe('one-click unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('EMAIL_FROM', 'The Good Opal Co <hello@goodopalco.com>')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    vi.stubEnv('PAYLOAD_SECRET', 'payload-test-secret')
    m.find.mockResolvedValue({ docs: [] })
    m.findByID.mockResolvedValue({ id: 7, tags: [{ tag: 'old-shop-buyer' }] })
  })

  it('unsubscribes the customer when a mail app posts the one-click request', async () => {
    const response = await POST(
      request('POST', createCampaignUnsubscribeToken(7, 'payload-test-secret'))
    )

    expect(response.status).toBe(200)
    expect(m.update).toHaveBeenCalledWith({
      collection: 'customers',
      id: 7,
      data: {
        subscribedToNewsletter: false,
        unsubscribeTokenHash: null,
        tags: [{ tag: 'old-shop-buyer' }, { tag: 'unsubscribed' }],
      },
    })
  })

  it('rejects a forged token without touching any customer', async () => {
    const response = await POST(request('POST', createCampaignUnsubscribeToken(7, 'wrong-secret')))

    expect(response.status).toBe(400)
    expect(m.update).not.toHaveBeenCalled()
  })

  it('sends a plain visit to the confirm page instead of unsubscribing, so link scanners cannot', async () => {
    const response = GET(request('GET', 'abc.def'))

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/newsletter/unsubscribe?token=abc.def')
    expect(m.update).not.toHaveBeenCalled()
  })
})

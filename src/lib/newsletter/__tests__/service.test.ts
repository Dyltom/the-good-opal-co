import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCampaignUnsubscribeToken } from '../campaign-unsubscribe-token'

const mocks = vi.hoisted(() => ({
  emailSend: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.emailSend }
  },
}))

vi.mock('@/lib/payload', () => ({
  getPayload: mocks.getPayload,
}))

vi.mock('@/emails/newsletter-confirmation', () => ({
  NewsletterConfirmationEmail: vi.fn(),
}))

vi.mock('@/emails/newsletter-welcome', () => ({
  NewsletterWelcomeEmail: vi.fn(),
}))

import { ResendNewsletterService } from '../service'

describe('ResendNewsletterService campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('EMAIL_FROM', 'The Good Opal Co <hello@goodopalco.com>')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    vi.stubEnv('PAYLOAD_SECRET', 'payload-test-secret')
  })

  it('records when newsletter consent was captured', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const create = vi.fn().mockResolvedValue({ id: 9 })
    mocks.getPayload.mockResolvedValue({ find, create })
    mocks.emailSend.mockResolvedValue({ data: { id: 'confirmation-1' }, error: null })

    const result = await new ResendNewsletterService().subscribe('NEW@example.com')

    expect(result.success).toBe(true)
    expect(create).toHaveBeenCalledWith({
      collection: 'customers',
      data: expect.objectContaining({
        email: 'new@example.com',
        subscribedToNewsletter: true,
        subscribedAt: expect.any(String),
      }),
    })
  })

  it('paginates verified subscribers, applies segments, adds unsubscribe, and counts API errors', async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({
        docs: [
          { id: 1, email: 'one@example.com', tags: [{ tag: 'collector' }] },
          { id: 2, email: 'two@example.com', tags: [{ tag: 'trade' }] },
        ],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        docs: [{ id: 3, email: 'three@example.com', tags: [{ tag: 'collector' }] }],
        totalPages: 2,
      })
    mocks.getPayload.mockResolvedValue({ find })
    mocks.emailSend
      .mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'suppressed' } })

    const result = await new ResendNewsletterService().sendCampaign(
      'New opals',
      '<p>Fresh from Lightning Ridge.</p>',
      ['collector']
    )

    expect(result).toEqual({ sent: 1, failed: 1 })
    expect(find).toHaveBeenNthCalledWith(1, expect.objectContaining({ limit: 100, page: 1 }))
    expect(find).toHaveBeenNthCalledWith(2, expect.objectContaining({ limit: 100, page: 2 }))
    expect(mocks.emailSend).toHaveBeenCalledTimes(2)
    expect(mocks.emailSend).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: 'two@example.com' })
    )
    expect(mocks.emailSend.mock.calls[0]?.[0].html).toContain('Unsubscribe')
    expect(mocks.emailSend.mock.calls[0]?.[0].html).toContain(
      'https://goodopalco.com/newsletter/unsubscribe?token='
    )
  })

  it('honours signed campaign unsubscribe links without invalidating older links', async () => {
    const findByID = vi.fn().mockResolvedValue({
      id: 7,
      email: 'collector@example.com',
      subscribedToNewsletter: true,
    })
    const update = vi.fn().mockResolvedValue({})
    mocks.getPayload.mockResolvedValue({ findByID, update })
    const token = createCampaignUnsubscribeToken(7, 'payload-test-secret')

    const result = await new ResendNewsletterService().unsubscribe(token)

    expect(result.success).toBe(true)
    expect(findByID).toHaveBeenCalledWith({ collection: 'customers', id: '7' })
    expect(update).toHaveBeenCalledWith({
      collection: 'customers',
      id: 7,
      data: {
        subscribedToNewsletter: false,
        unsubscribeTokenHash: null,
      },
    })
  })
})

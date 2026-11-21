import { beforeEach, describe, expect, test, vi } from 'vitest'

const { findByID, send } = vi.hoisted(() => ({ findByID: vi.fn(), send: vi.fn() }))

vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send }
  },
}))
vi.mock('@/lib/payload', () => ({ getPayload: async () => ({ findByID }) }))

import { notifyOwnerOfQuoteEvent } from '../owner-notification'

const quote = {
  id: 12,
  quoteNumber: 'QUOTE-ABC123-R1',
  customerEmail: 'customer@example.com',
  amountCents: 125050,
  depositAmountCents: 40000,
  amountPaidCents: 40000,
  enquiry: { id: 3, name: 'Sam Customer', reference: 'ENQ-0A1B2C3D4E' },
}

describe('notifyOwnerOfQuoteEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CONTACT_EMAIL', 'owner@example.com')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example/')
    findByID.mockResolvedValue(quote)
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null })
  })

  test('tells the owner a customer accepted, with the amounts in dollars and an admin link', async () => {
    await notifyOwnerOfQuoteEvent(12, 'accepted')

    const [message, options] = send.mock.calls[0] ?? []
    expect(message).toMatchObject({
      to: 'owner@example.com',
      replyTo: 'customer@example.com',
      subject: 'Quote accepted - QUOTE-ABC123-R1',
    })
    expect(message.text).toContain('customer@example.com accepted quote QUOTE-ABC123-R1.')
    expect(message.text).toContain('Quote total: $1,250.50')
    expect(message.text).toContain('Deposit due: $400.00')
    expect(message.text).toContain('Sam Customer')
    expect(message.text).toContain('Enquiry ENQ-0A1B2C3D4E')
    expect(message.text).toContain(
      'Open the quote: https://shop.example/admin/collections/custom-quotes/12'
    )
    expect(options).toEqual({ idempotencyKey: 'owner-quote-accepted/12' })
  })

  test('tells the owner a deposit was paid, once per quote', async () => {
    await notifyOwnerOfQuoteEvent(12, 'deposit-paid')

    const [message, options] = send.mock.calls[0] ?? []
    expect(message.subject).toBe('Deposit paid - QUOTE-ABC123-R1')
    expect(message.text).toContain('Deposit paid: $400.00')
    expect(options).toEqual({ idempotencyKey: 'owner-quote-deposit-paid/12' })
  })

  test('never fails the customer action when the email provider rejects', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    send.mockResolvedValue({ data: null, error: { message: 'rate limited' } })

    await expect(notifyOwnerOfQuoteEvent(12, 'accepted')).resolves.toBeUndefined()
    expect(log).toHaveBeenCalled()
  })
})

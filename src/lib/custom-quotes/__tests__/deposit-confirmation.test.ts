import { beforeEach, describe, expect, it, vi } from 'vitest'

const { emailSend, findByID, update } = vi.hoisted(() => ({
  emailSend: vi.fn(),
  findByID: vi.fn(),
  update: vi.fn(),
}))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: emailSend }
  },
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({ findByID, update }),
}))

import { sendQuoteDepositConfirmation } from '../deposit-confirmation'

const paidQuote = {
  id: 42,
  quoteNumber: 'QUOTE-ABC-R1',
  customerEmail: 'buyer@example.com',
  depositStatus: 'paid',
  depositAmountCents: 25_000,
  amountPaidCents: 25_000,
  stripeCheckoutSessionId: 'cs_quote',
}

describe('custom quote deposit confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findByID.mockResolvedValue(paidQuote)
    update.mockResolvedValue({})
    emailSend.mockResolvedValue({ data: { id: 'email_deposit' }, error: null })
  })

  it('sends once with a stable payment idempotency key and records provider evidence', async () => {
    await sendQuoteDepositConfirmation(42)
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'buyer@example.com',
        subject: 'Deposit confirmed – QUOTE-ABC-R1',
      }),
      { idempotencyKey: 'custom-quote-deposit/42/cs_quote' }
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { stripeQuoteDepositReconciliation: true },
        data: expect.objectContaining({
          depositConfirmationEmailProviderId: 'email_deposit',
          depositConfirmationEmailError: null,
        }),
      })
    )
  })

  it('is replay-safe after confirmation evidence is recorded', async () => {
    findByID.mockResolvedValue({
      ...paidQuote,
      depositConfirmationEmailSentAt: new Date().toISOString(),
    })
    await sendQuoteDepositConfirmation(42)
    expect(emailSend).not.toHaveBeenCalled()
  })

  it('persists provider failure for retry and makes Stripe retry the webhook', async () => {
    emailSend.mockResolvedValue({ data: null, error: { message: 'suppressed' } })
    await expect(sendQuoteDepositConfirmation(42)).rejects.toThrow(
      'Deposit confirmation email failed'
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { depositConfirmationEmailError: 'suppressed' } })
    )
  })
})

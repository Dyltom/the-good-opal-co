import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  accessForToken,
  beginTransaction,
  checkRateLimit,
  commitTransaction,
  createStripeSession,
  findByID,
  getConfiguredStripeSecretKey,
  getRequestIdentifier,
  retrieveStripeSession,
  rollbackTransaction,
  update,
} = vi.hoisted(() => ({
  accessForToken: vi.fn(),
  beginTransaction: vi.fn(),
  checkRateLimit: vi.fn(),
  commitTransaction: vi.fn(),
  createStripeSession: vi.fn(),
  findByID: vi.fn(),
  getConfiguredStripeSecretKey: vi.fn(),
  getRequestIdentifier: vi.fn(),
  retrieveStripeSession: vi.fn(),
  rollbackTransaction: vi.fn(),
  update: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'secure-token' }) }),
}))
vi.mock('@/lib/custom-quotes/customer-access', () => ({
  QUOTE_ACCESS_COOKIE: 'good-opal-quote-access',
  getCustomerQuoteAccess: accessForToken,
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({
    db: {
      beginTransaction,
      commitTransaction,
      rollbackTransaction,
    },
    findByID,
    update,
  }),
}))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit, getRequestIdentifier }))
vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey }))
vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = { sessions: { create: createStripeSession, retrieve: retrieveStripeSession } }
  },
}))

import type { CustomQuote } from '@/types/payload-types'
import { quoteTermsHash } from '@/lib/custom-quote-evidence'
import { acceptCustomQuote, createCustomQuoteDepositCheckout } from '../actions'

const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
const sentQuote = {
  id: 42,
  quoteNumber: 'QUOTE-ABC-R1',
  quoteSeriesId: 'abc',
  revision: 1,
  enquiry: 8,
  customerEmail: 'buyer@example.com',
  status: 'sent',
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: future,
  terms: 'Exact scope, timing, cancellation and deposit terms.',
  depositStatus: 'awaiting-payment',
  linkVersion: 1,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
} satisfies CustomQuote

function access(quote: CustomQuote = sentQuote) {
  return {
    quote,
    claims: {
      audience: 'custom-quote',
      expiresAt: Math.floor(new Date(quote.validUntil).getTime() / 1000),
      linkVersion: quote.linkVersion ?? 1,
      quoteId: String(quote.id),
      revision: quote.revision,
      termsHash: quoteTermsHash(quote),
    },
  }
}

function acceptanceForm(checked = true): FormData {
  const form = new FormData()
  if (checked) form.set('accepted', 'on')
  return form
}

describe('customer custom quote actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('QUOTE_LINK_SECRET', '0123456789abcdef0123456789abcdef')
    accessForToken.mockResolvedValue(access())
    beginTransaction.mockResolvedValue('tx')
    commitTransaction.mockResolvedValue(undefined)
    rollbackTransaction.mockResolvedValue(undefined)
    getRequestIdentifier.mockResolvedValue('request-hash')
    checkRateLimit.mockResolvedValue(true)
    getConfiguredStripeSecretKey.mockReturnValue('sk_test_valid_for_mock')
    findByID.mockResolvedValue(sentQuote)
    update.mockResolvedValue({})
    createStripeSession.mockResolvedValue({
      id: 'cs_quote',
      status: 'open',
      url: 'https://checkout.stripe.test/quote',
    })
  })

  it('requires explicit acceptance before reading the private quote', async () => {
    await expect(
      acceptCustomQuote(sentQuote.quoteNumber, { success: false }, acceptanceForm(false))
    ).resolves.toEqual({
      success: false,
      error: 'Confirm that you accept the complete quote and terms.',
    })
    expect(accessForToken).not.toHaveBeenCalled()
  })

  it('records exact acceptance and advances the linked enquiry atomically', async () => {
    const result = await acceptCustomQuote(
      sentQuote.quoteNumber,
      { success: false },
      acceptanceForm()
    )
    expect(result).toMatchObject({ success: true })
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'custom-quotes',
        id: sentQuote.id,
        context: { quoteAcceptanceEvidence: true },
        data: expect.objectContaining({
          status: 'accepted',
          acceptedByEmail: sentQuote.customerEmail,
          acceptedTermsHash: quoteTermsHash(sentQuote),
          acceptedStatementVersion: 'custom-quote-v1',
          acceptedEvidenceHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      })
    )
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: 'enquiries', id: 8, data: { status: 'accepted' } })
    )
    expect(commitTransaction).toHaveBeenCalledWith('tx')
  })

  it('treats acceptance replay as success without another evidence event', async () => {
    const accepted = { ...sentQuote, status: 'accepted' as const }
    accessForToken.mockResolvedValue(access(accepted))
    findByID.mockResolvedValue(accepted)
    await expect(
      acceptCustomQuote(accepted.quoteNumber, { success: false }, acceptanceForm())
    ).resolves.toEqual({ success: true, message: 'This quote is already accepted.' })
    expect(update).not.toHaveBeenCalled()
  })

  it('creates one exact, expiring, idempotent deposit session and stores it as pending', async () => {
    const accepted = { ...sentQuote, status: 'accepted' as const, depositCheckoutGeneration: 2 }
    accessForToken.mockResolvedValue(access(accepted))
    findByID.mockResolvedValue(accepted)

    await expect(
      createCustomQuoteDepositCheckout(accepted.quoteNumber, { success: false }, new FormData())
    ).resolves.toEqual({ success: true, url: 'https://checkout.stripe.test/quote' })

    expect(createStripeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        customer_email: accepted.customerEmail,
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ currency: 'aud', unit_amount: 25_000 }),
          }),
        ],
        metadata: expect.objectContaining({
          paymentKind: 'custom-quote-deposit',
          quoteId: String(accepted.id),
          quoteRevision: '1',
        }),
      }),
      { idempotencyKey: 'quote-deposit/42/r1/g3' }
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'custom-quotes',
        context: { stripeQuoteDepositReconciliation: true },
        data: expect.objectContaining({
          depositCheckoutGeneration: 3,
          pendingStripeCheckoutSessionId: 'cs_quote',
        }),
      })
    )
  })

  it('reuses the existing open session instead of creating another payable deposit', async () => {
    const accepted = {
      ...sentQuote,
      status: 'accepted' as const,
      pendingStripeCheckoutSessionId: 'cs_existing',
    }
    accessForToken.mockResolvedValue(access(accepted))
    findByID.mockResolvedValue(accepted)
    retrieveStripeSession.mockResolvedValue({
      id: 'cs_existing',
      status: 'open',
      payment_status: 'unpaid',
      url: 'https://checkout.stripe.test/existing',
    })

    await expect(
      createCustomQuoteDepositCheckout(accepted.quoteNumber, { success: false }, new FormData())
    ).resolves.toEqual({ success: true, url: 'https://checkout.stripe.test/existing' })
    expect(createStripeSession).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })
})

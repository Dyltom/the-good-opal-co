import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  beginTransaction,
  commitTransaction,
  constructEvent,
  find,
  findByID,
  listLineItems,
  rollbackTransaction,
  retrieveCharge,
  retrieveDispute,
  sendQuoteDepositConfirmation,
  update,
} = vi.hoisted(() => ({
  beginTransaction: vi.fn(),
  commitTransaction: vi.fn(),
  constructEvent: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  listLineItems: vi.fn(),
  rollbackTransaction: vi.fn(),
  retrieveCharge: vi.fn(),
  retrieveDispute: vi.fn(),
  sendQuoteDepositConfirmation: vi.fn(),
  update: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class StripeMock {
    webhooks = { constructEvent }
    checkout = { sessions: { listLineItems } }
    charges = { retrieve: retrieveCharge }
    disputes = { retrieve: retrieveDispute }
  },
}))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: vi.fn() }
  },
}))
vi.mock('@/lib/stripe-config', () => ({
  getConfiguredStripeSecretKey: () => 'sk_test_valid_for_mock',
  getConfiguredStripeWebhookSecret: () => 'whsec_valid_for_mock',
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({
    db: { beginTransaction, commitTransaction, rollbackTransaction },
    findByID,
    find,
    update,
  }),
}))
vi.mock('@/lib/custom-quotes/deposit-confirmation', () => ({ sendQuoteDepositConfirmation }))

import { customQuoteDepositMetadata } from '@/lib/custom-quote-deposits'
import type { CustomQuote } from '@/types/payload-types'
import { POST } from '../route'

const quote = {
  id: 42,
  quoteNumber: 'QUOTE-ABC-R1',
  quoteSeriesId: 'abc',
  revision: 1,
  enquiry: 8,
  customerEmail: 'buyer@example.com',
  status: 'accepted',
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: '2026-08-01T00:00:00.000Z',
  terms: 'Exact terms.',
  depositStatus: 'awaiting-payment',
  pendingStripeCheckoutSessionId: 'cs_quote',
  linkVersion: 1,
  updatedAt: '2026-07-12T00:00:00.000Z',
  createdAt: '2026-07-12T00:00:00.000Z',
} satisfies CustomQuote

describe('Stripe webhook custom quote deposit branch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    beginTransaction.mockResolvedValue('tx')
    commitTransaction.mockResolvedValue(undefined)
    rollbackTransaction.mockResolvedValue(undefined)
    findByID.mockResolvedValue(quote)
    update.mockResolvedValue({})
    sendQuoteDepositConfirmation.mockResolvedValue(undefined)
    constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      created: 1_784_000_000,
      data: {
        object: {
          id: 'cs_quote',
          mode: 'payment',
          payment_status: 'paid',
          amount_total: 25_000,
          currency: 'aud',
          customer_email: 'buyer@example.com',
          customer_details: null,
          payment_intent: 'pi_quote',
          metadata: customQuoteDepositMetadata(quote),
        },
      },
    })
  })

  it('records the quote deposit without entering product order or inventory fulfilment', async () => {
    const response = await POST(
      new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
        headers: { 'stripe-signature': 'signed' },
      })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      received: true,
      quoteDeposit: true,
      quoteId: 42,
      duplicate: false,
    })
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'custom-quotes',
        context: { stripeQuoteDepositReconciliation: true },
        data: expect.objectContaining({
          depositStatus: 'paid',
          amountPaidCents: 25_000,
          stripeCheckoutSessionId: 'cs_quote',
          stripePaymentIntentId: 'pi_quote',
        }),
      })
    )
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: 'enquiries', id: 8, data: { status: 'deposit-paid' } })
    )
    expect(listLineItems).not.toHaveBeenCalled()
    expect(sendQuoteDepositConfirmation).toHaveBeenCalledWith(42)
    expect(commitTransaction).toHaveBeenCalledWith('tx')
  })

  it('returns 500 and rolls back mismatched paid evidence for Stripe retry', async () => {
    constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      created: 1,
      data: {
        object: {
          id: 'cs_quote',
          mode: 'payment',
          payment_status: 'paid',
          amount_total: 24_999,
          currency: 'aud',
          customer_email: 'buyer@example.com',
          payment_intent: 'pi_quote',
          metadata: customQuoteDepositMetadata(quote),
        },
      },
    })
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await POST(
      new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
        headers: { 'stripe-signature': 'signed' },
      })
    )
    expect(response.status).toBe(500)
    expect(rollbackTransaction).toHaveBeenCalledWith('tx')
    expect(update).not.toHaveBeenCalled()
    errorLog.mockRestore()
  })

  it('records cumulative refunds transactionally and pauses the enquiry pipeline', async () => {
    const paidQuote = {
      ...quote,
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      stripeRefundedAmountCents: 0,
      stripePaymentIntentId: 'pi_quote',
    }
    const charge = {
      id: 'ch_quote',
      amount: 25_000,
      amount_refunded: 5_000,
      currency: 'aud',
      payment_intent: 'pi_quote',
      refunded: false,
    }
    constructEvent.mockReturnValue({
      type: 'charge.refunded',
      created: 1_784_000_000,
      data: { object: charge },
    })
    retrieveCharge.mockResolvedValue(charge)
    find.mockResolvedValue({ docs: [paidQuote] })

    const response = await POST(
      new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
        headers: { 'stripe-signature': 'signed' },
      })
    )
    expect(response.status).toBe(200)
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'custom-quotes',
        data: expect.objectContaining({ stripeRefundedAmountCents: 5_000 }),
      })
    )
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: 'enquiries', data: { status: 'accepted' } })
    )
    expect(commitTransaction).toHaveBeenCalledWith('tx')
  })

  it('uses authoritative dispute state and pauses production in the same transaction', async () => {
    const paidQuote = {
      ...quote,
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      stripeRefundedAmountCents: 0,
      stripePaymentIntentId: 'pi_quote',
    }
    const dispute = { id: 'dp_quote', charge: 'ch_quote', status: 'under_review' }
    constructEvent.mockReturnValue({
      type: 'charge.dispute.created',
      created: 1_784_000_000,
      data: { object: dispute },
    })
    retrieveDispute.mockResolvedValue(dispute)
    retrieveCharge.mockResolvedValue({
      id: 'ch_quote',
      amount: 25_000,
      currency: 'aud',
      payment_intent: 'pi_quote',
    })
    find.mockResolvedValue({ docs: [paidQuote] })

    const response = await POST(
      new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
        headers: { 'stripe-signature': 'signed' },
      })
    )
    expect(response.status).toBe(200)
    expect(retrieveDispute).toHaveBeenCalledWith('dp_quote')
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'custom-quotes',
        data: expect.objectContaining({
          stripeDisputeId: 'dp_quote',
          stripeDisputeStatus: 'under_review',
        }),
      })
    )
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: 'enquiries', data: { status: 'accepted' } })
    )
  })
})

import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { getPayload as bootPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const databaseUrl = process.env.DATABASE_URL
const holder = vi.hoisted(() => ({ payload: null as Payload | null }))

vi.mock('@/lib/payload', () => ({
  getPayload: async () => {
    if (!holder.payload) throw new Error('Payload not started')
    return holder.payload
  },
}))

import {
  captureGiftVoucherHold,
  holdGiftVoucher,
  lookupGiftVoucher,
  releaseGiftVoucherHold,
} from '../gift-vouchers'
import { issueGiftVoucherFromSession } from '../gift-voucher-purchase'

const HOLD_UNTIL = new Date(Date.now() + 31 * 60_000)

async function newVoucher(balance: number) {
  const payload = holder.payload
  if (!payload) throw new Error('Payload not started')
  return payload.create({
    collection: 'gift-vouchers',
    overrideAccess: true,
    data: { code: '', initialValue: balance, balance, source: 'purchase', status: 'active' },
  })
}

async function balanceOf(id: number) {
  const payload = holder.payload
  if (!payload) throw new Error('Payload not started')
  return payload.findByID({ collection: 'gift-vouchers', id, overrideAccess: true, depth: 0 })
}

async function captureInTransaction(checkoutToken: string) {
  const payload = holder.payload
  if (!payload) throw new Error('Payload not started')
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('No transaction')
  const stripeSessionId = `cs_test_${checkoutToken}`
  const existing = await payload.find({
    collection: 'orders',
    where: { stripeSessionId: { equals: stripeSessionId } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  const order =
    existing.docs[0] ??
    (await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `TEST-${checkoutToken}`,
        source: 'stripe',
        status: 'processing',
        customer: { email: 'buyer@example.com', name: 'Buyer' },
        shippingAddress: { line1: '1 Test St', city: 'Sydney', country: 'AU' },
        items: [{ productId: '1', slug: 'opal', name: 'Opal', price: 100, quantity: 1 }],
        subtotal: 100,
        total: 0,
        stripeSessionId,
      },
    }))
  const result = await captureGiftVoucherHold({
    payload,
    req: { transactionID },
    checkoutToken,
    stripeSessionId,
    orderId: order.id,
  }).catch(async (error: unknown) => {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  })
  await payload.db.commitTransaction(transactionID)
  return result
}

describe.skipIf(!databaseUrl)('gift vouchers against Postgres', () => {
  beforeAll(async () => {
    process.env.PAYLOAD_SECRET ??= 'gift-voucher-test-secret'
    process.env.RESEND_API_KEY ??= 're_test'
    const { default: config } = await import('@/payload.config')
    holder.payload = await bootPayload({ config })
  }, 120_000)

  afterAll(async () => {
    await holder.payload?.destroy()
  })

  it('never lets two checkouts hold more than the balance at once', async () => {
    const voucher = await newVoucher(100)
    const attempts = await Promise.all(
      [randomUUID(), randomUUID(), randomUUID()].map((checkoutToken) =>
        holdGiftVoucher({
          code: voucher.code,
          checkoutToken,
          orderTotalCents: 6000,
          holdExpiresAt: HOLD_UNTIL,
        })
      )
    )
    const heldCents = attempts.reduce((sum, hold) => sum + (hold.ok ? hold.amountCents : 0), 0)
    expect(heldCents).toBe(10000)
    expect(attempts.filter((hold) => !hold.ok).map((hold) => !hold.ok && hold.problem)).toEqual([
      'empty',
    ])
  })

  it('returns the same hold when a checkout attempt is replayed', async () => {
    const voucher = await newVoucher(80)
    const checkoutToken = randomUUID()
    const first = await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 5000,
      holdExpiresAt: HOLD_UNTIL,
    })
    const replay = await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 5000,
      holdExpiresAt: HOLD_UNTIL,
    })
    expect(replay).toEqual(first)
    expect((await balanceOf(voucher.id)).redemptions).toHaveLength(1)
  })

  it('captures a paid hold once and keeps the rest of the balance', async () => {
    const voucher = await newVoucher(100)
    const checkoutToken = randomUUID()
    await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 6500,
      holdExpiresAt: HOLD_UNTIL,
    })

    expect(await captureInTransaction(checkoutToken)).toMatchObject({ amount: 65 })
    expect(await captureInTransaction(checkoutToken)).toMatchObject({ amount: 65 })
    const after = await balanceOf(voucher.id)
    expect(after.balance).toBe(35)
    expect(after.status).toBe('active')
    expect(await lookupGiftVoucher(voucher.code)).toMatchObject({ ok: true, availableCents: 3500 })
  })

  it('marks a voucher used when its whole balance is captured', async () => {
    const voucher = await newVoucher(40)
    const checkoutToken = randomUUID()
    await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 9000,
      holdExpiresAt: HOLD_UNTIL,
    })
    await captureInTransaction(checkoutToken)
    expect(await balanceOf(voucher.id)).toMatchObject({ balance: 0, status: 'used' })
    expect(await lookupGiftVoucher(voucher.code)).toEqual({ ok: false, problem: 'empty' })
  })

  it('gives a held amount back when the checkout expires, once', async () => {
    const voucher = await newVoucher(100)
    const checkoutToken = randomUUID()
    await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 10000,
      holdExpiresAt: HOLD_UNTIL,
    })
    expect(await lookupGiftVoucher(voucher.code)).toEqual({ ok: false, problem: 'empty' })

    expect(await releaseGiftVoucherHold(checkoutToken)).toBe(true)
    expect(await releaseGiftVoucherHold(checkoutToken)).toBe(false)
    expect(await captureInTransaction(checkoutToken)).toMatchObject({ amount: 100 })
    expect(await lookupGiftVoucher(voucher.code)).toEqual({ ok: false, problem: 'empty' })
  })

  it('rejects expired vouchers', async () => {
    const voucher = await newVoucher(100)
    const later = new Date(new Date(voucher.expiresAt).getTime() + 1000)
    expect(await lookupGiftVoucher(voucher.code, later)).toEqual({ ok: false, problem: 'expired' })
    expect(
      await holdGiftVoucher({
        code: voucher.code,
        checkoutToken: randomUUID(),
        orderTotalCents: 100,
        holdExpiresAt: HOLD_UNTIL,
        now: later,
      })
    ).toEqual({ ok: false, problem: 'expired' })
  })

  it('captures only the live hold when a checkout attempt is retried after its hold was released', async () => {
    const voucher = await newVoucher(100)
    const checkoutToken = randomUUID()
    await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 3000,
      holdExpiresAt: HOLD_UNTIL,
    })
    await releaseGiftVoucherHold(checkoutToken)
    await holdGiftVoucher({
      code: voucher.code,
      checkoutToken,
      orderTotalCents: 4000,
      holdExpiresAt: HOLD_UNTIL,
    })

    expect(await captureInTransaction(checkoutToken)).toMatchObject({ amount: 40 })
    const after = await balanceOf(voucher.id)
    expect(after.balance).toBe(60)
    expect(after.redemptions?.map((r) => r.state)).toEqual(['released', 'captured'])
  })

  it('issues one voucher for a paid voucher checkout however often Stripe replays the event', async () => {
    const session = {
      id: `cs_test_${randomUUID()}`,
      amount_total: 15000,
      created: Date.UTC(2026, 10, 23) / 1000,
      customer_email: null,
      customer_details: { email: 'sam@example.com' },
      metadata: {
        giftVoucherPurchase: 'true',
        amount: '150',
        purchaserName: 'Sam',
        recipientName: 'Alex',
        recipientEmail: 'alex@example.com',
        message: '',
      },
    } as unknown as Stripe.Checkout.Session
    const results = await Promise.all([
      issueGiftVoucherFromSession(session),
      issueGiftVoucherFromSession(session),
    ])
    const again = await issueGiftVoucherFromSession(session)
    expect(new Set([...results, again].map((result) => result.voucher.id)).size).toBe(1)
    expect([...results, again].filter((result) => result.created)).toHaveLength(1)
    expect(again.voucher).toMatchObject({ balance: 150, expiresAt: '2029-11-23T00:00:00.000Z' })
  })
})

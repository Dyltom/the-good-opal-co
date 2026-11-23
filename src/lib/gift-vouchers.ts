import type { Payload } from 'payload'
import type { GiftVoucher } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import {
  giftVoucherAppliedCents,
  giftVoucherAvailableCents,
  giftVoucherExpiresAt,
  giftVoucherProblem,
  normaliseGiftVoucherCode,
  type GiftVoucherProblem,
} from '@/lib/gift-voucher-rules'

export const GIFT_VOUCHER_METADATA_KEY = 'giftVoucherCode'
export const GIFT_VOUCHER_PURCHASE_METADATA_KEY = 'giftVoucherPurchase'

type TransactionRequest = { transactionID: string | number }
type Redemption = NonNullable<GiftVoucher['redemptions']>[number]

export type GiftVoucherLookup =
  | { ok: true; code: string; availableCents: number; expiresAt: string }
  | { ok: false; problem: GiftVoucherProblem }

export type GiftVoucherHold =
  | { ok: true; code: string; amountCents: number }
  | { ok: false; problem: GiftVoucherProblem }

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function toDollars(cents: number): number {
  return cents / 100
}

async function inTransaction<T>(
  work: (payload: Payload, req: TransactionRequest) => Promise<T>
): Promise<T> {
  return retrySerializableTransaction(async () => {
    const payload = await getPayload()
    const transactionID = await payload.db.beginTransaction()
    if (transactionID === null) throw new Error('Database transactions are required for gift vouchers')
    const req = { transactionID }
    try {
      const result = await work(payload, req)
      await payload.db.commitTransaction(transactionID)
      return result
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  })
}

async function findByCode(
  payload: Payload,
  code: string,
  req?: TransactionRequest
): Promise<GiftVoucher | null> {
  const result = await payload.find({
    collection: 'gift-vouchers',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  return result.docs[0] ?? null
}

async function findByCheckoutToken(
  payload: Payload,
  checkoutToken: string,
  req: TransactionRequest
): Promise<GiftVoucher | null> {
  const result = await payload.find({
    collection: 'gift-vouchers',
    where: { 'redemptions.checkoutToken': { equals: checkoutToken } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs[0] ?? null
}

function redemptionData(redemption: Redemption): Redemption {
  return {
    ...redemption,
    paidOrder:
      redemption.paidOrder && typeof redemption.paidOrder === 'object'
        ? redemption.paidOrder.id
        : redemption.paidOrder,
  }
}

async function saveRedemptions(
  payload: Payload,
  req: TransactionRequest,
  voucher: GiftVoucher,
  redemptions: Redemption[],
  extra: Partial<Pick<GiftVoucher, 'balance' | 'status'>> = {}
): Promise<GiftVoucher> {
  return payload.update({
    collection: 'gift-vouchers',
    id: voucher.id,
    req,
    overrideAccess: true,
    depth: 0,
    data: { ...extra, redemptions: redemptions.map(redemptionData) },
  })
}

export async function lookupGiftVoucher(input: string, now = new Date()): Promise<GiftVoucherLookup> {
  const code = normaliseGiftVoucherCode(input)
  if (!code) return { ok: false, problem: 'not-found' }
  const payload = await getPayload()
  const voucher = await findByCode(payload, code)
  const problem = giftVoucherProblem(voucher, now)
  if (problem || !voucher) return { ok: false, problem: problem ?? 'not-found' }
  return {
    ok: true,
    code,
    availableCents: giftVoucherAvailableCents(voucher, now),
    expiresAt: voucher.expiresAt,
  }
}

export async function holdGiftVoucher(input: {
  code: string
  checkoutToken: string
  orderTotalCents: number
  holdExpiresAt: Date
  now?: Date
}): Promise<GiftVoucherHold> {
  const code = normaliseGiftVoucherCode(input.code)
  if (!code) return { ok: false, problem: 'not-found' }
  const now = input.now ?? new Date()

  return inTransaction(async (payload, req) => {
    const voucher = await findByCode(payload, code, req)
    const redemptions = voucher?.redemptions ?? []
    const replay = redemptions.find(
      (redemption) => redemption.checkoutToken === input.checkoutToken && redemption.state === 'held'
    )
    if (voucher && replay) return { ok: true, code, amountCents: toCents(replay.amount) }

    const problem = giftVoucherProblem(voucher, now)
    if (problem || !voucher) return { ok: false, problem: problem ?? 'not-found' }

    const amountCents = giftVoucherAppliedCents(
      giftVoucherAvailableCents(voucher, now),
      input.orderTotalCents
    )
    if (amountCents <= 0) return { ok: false, problem: 'empty' }

    await saveRedemptions(payload, req, voucher, [
      ...redemptions,
      {
        checkoutToken: input.checkoutToken,
        amount: toDollars(amountCents),
        state: 'held',
        holdExpiresAt: input.holdExpiresAt.toISOString(),
        heldAt: now.toISOString(),
      },
    ])
    return { ok: true, code, amountCents }
  })
}

export async function releaseGiftVoucherHold(
  checkoutToken: string,
  stripeSessionId?: string
): Promise<boolean> {
  return inTransaction(async (payload, req) => {
    const voucher = await findByCheckoutToken(payload, checkoutToken, req)
    const redemptions = voucher?.redemptions ?? []
    if (!voucher || !redemptions.some((r) => r.checkoutToken === checkoutToken && r.state === 'held')) {
      return false
    }
    await saveRedemptions(
      payload,
      req,
      voucher,
      redemptions.map((redemption) =>
        redemption.checkoutToken === checkoutToken && redemption.state === 'held'
          ? { ...redemption, state: 'released', stripeSessionId: stripeSessionId ?? redemption.stripeSessionId }
          : redemption
      )
    )
    return true
  })
}

export async function keepGiftVoucherHoldUntilPaid(checkoutToken: string): Promise<void> {
  await inTransaction(async (payload, req) => {
    const voucher = await findByCheckoutToken(payload, checkoutToken, req)
    const redemptions = voucher?.redemptions ?? []
    if (!voucher || !redemptions.some((r) => r.checkoutToken === checkoutToken && r.state === 'held')) {
      return
    }
    await saveRedemptions(
      payload,
      req,
      voucher,
      redemptions.map((redemption) =>
        redemption.checkoutToken === checkoutToken && redemption.state === 'held'
          ? { ...redemption, holdExpiresAt: null }
          : redemption
      )
    )
  })
}

export interface GiftVoucherCapture {
  code: string
  amount: number
  note?: string
}

export async function captureGiftVoucherHold(input: {
  payload: Payload
  req: TransactionRequest
  checkoutToken: string
  stripeSessionId: string
  orderId: number
}): Promise<GiftVoucherCapture | null> {
  const { payload, req } = input
  const voucher = await findByCheckoutToken(payload, input.checkoutToken, req)
  const redemptions = voucher?.redemptions ?? []
  const redemption = redemptions.find((r) => r.checkoutToken === input.checkoutToken)
  if (!voucher || !redemption) return null
  if (redemption.state === 'captured') return { code: voucher.code, amount: redemption.amount }

  const heldCents = toCents(redemption.amount)
  const balanceCents = toCents(voucher.balance)
  const capturedCents = Math.min(heldCents, balanceCents)
  const nextBalanceCents = balanceCents - capturedCents
  await saveRedemptions(
    payload,
    req,
    voucher,
    redemptions.map((r) =>
      r.checkoutToken === input.checkoutToken
        ? {
            ...r,
            state: 'captured',
            amount: toDollars(capturedCents),
            stripeSessionId: input.stripeSessionId,
            paidOrder: input.orderId,
            holdExpiresAt: null,
          }
        : r
    ),
    {
      balance: toDollars(nextBalanceCents),
      status: nextBalanceCents === 0 && voucher.status === 'active' ? 'used' : voucher.status,
    }
  )
  return {
    code: voucher.code,
    amount: toDollars(capturedCents),
    ...(capturedCents < heldCents
      ? {
          note: `Gift voucher ${voucher.code} discounted ${toDollars(heldCents).toFixed(2)} at Stripe but only had ${toDollars(balanceCents).toFixed(2)} left. Check the voucher.`,
        }
      : {}),
  }
}

export interface GiftVoucherPurchase {
  stripeCheckoutSessionId: string
  amount: number
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message?: string
  issuedAt: Date
}

async function findByPurchaseSession(
  payload: Payload,
  stripeCheckoutSessionId: string
): Promise<GiftVoucher | null> {
  const result = await payload.find({
    collection: 'gift-vouchers',
    where: { stripeCheckoutSessionId: { equals: stripeCheckoutSessionId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

export async function issuePurchasedGiftVoucher(
  purchase: GiftVoucherPurchase
): Promise<{ voucher: GiftVoucher; created: boolean }> {
  const payload = await getPayload()
  const existing = await findByPurchaseSession(payload, purchase.stripeCheckoutSessionId)
  if (existing) return { voucher: existing, created: false }

  try {
    const voucher = await payload.create({
      collection: 'gift-vouchers',
      overrideAccess: true,
      depth: 0,
      data: {
        source: 'purchase',
        status: 'active',
        initialValue: purchase.amount,
        balance: purchase.amount,
        expiresAt: giftVoucherExpiresAt(purchase.issuedAt).toISOString(),
        purchaserName: purchase.purchaserName,
        purchaserEmail: purchase.purchaserEmail,
        recipientName: purchase.recipientName,
        recipientEmail: purchase.recipientEmail,
        message: purchase.message || undefined,
        stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
        code: '',
      },
    })
    return { voucher, created: true }
  } catch (error) {
    const raced = await findByPurchaseSession(payload, purchase.stripeCheckoutSessionId)
    if (!raced) throw error
    return { voucher: raced, created: false }
  }
}

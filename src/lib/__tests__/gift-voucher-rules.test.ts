import { describe, expect, it } from 'vitest'
import {
  generateGiftVoucherCode,
  giftVoucherAppliedCents,
  giftVoucherAvailableCents,
  giftVoucherExpiresAt,
  giftVoucherProblem,
  isValidGiftVoucherAmount,
  normaliseGiftVoucherCode,
  type GiftVoucherLike,
} from '../gift-voucher-rules'

const NOW = new Date('2026-11-23T00:00:00Z')

function voucher(overrides: Partial<GiftVoucherLike> = {}): GiftVoucherLike {
  return { status: 'active', balance: 100, expiresAt: '2029-11-23T00:00:00Z', redemptions: [], ...overrides }
}

describe('gift voucher codes', () => {
  it('generates GOOD-XXXX-XXXX codes without look-alike characters', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateGiftVoucherCode()).toMatch(/^GOOD-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
    }
  })

  it('accepts codes typed in lower case, without dashes or without the prefix', () => {
    expect(normaliseGiftVoucherCode(' good-ab2c-de3f ')).toBe('GOOD-AB2C-DE3F')
    expect(normaliseGiftVoucherCode('ab2cde3f')).toBe('GOOD-AB2C-DE3F')
    expect(normaliseGiftVoucherCode('GOOD-AB2C')).toBeNull()
  })
})

describe('gift voucher balance', () => {
  it('expires three years after issue', () => {
    expect(giftVoucherExpiresAt(NOW).toISOString()).toBe('2029-11-23T00:00:00.000Z')
    expect(giftVoucherProblem(voucher({ expiresAt: NOW.toISOString() }), NOW)).toBe('expired')
  })

  it('reserves live holds but frees expired and released ones', () => {
    const held = voucher({
      redemptions: [
        { amount: 30, state: 'held', holdExpiresAt: '2026-11-23T00:31:00Z' },
        { amount: 20, state: 'held', holdExpiresAt: null },
        { amount: 40, state: 'held', holdExpiresAt: '2026-11-22T23:59:00Z' },
        { amount: 10, state: 'released' },
        { amount: 25, state: 'captured' },
      ],
    })
    expect(giftVoucherAvailableCents(held, NOW)).toBe(5000)
  })

  it('treats a voucher fully held by another checkout as empty', () => {
    const held = voucher({ redemptions: [{ amount: 100, state: 'held', holdExpiresAt: null }] })
    expect(giftVoucherProblem(held, NOW)).toBe('empty')
    expect(giftVoucherProblem(voucher({ status: 'void' }), NOW)).toBe('void')
  })
})

describe('applying a gift voucher to an order', () => {
  it('takes no more than the order total including shipping', () => {
    expect(giftVoucherAppliedCents(50000, 16500)).toBe(16500)
    expect(giftVoucherAppliedCents(5000, 16500)).toBe(5000)
  })

  it('leaves at least the Stripe minimum charge when it would otherwise leave a few cents', () => {
    expect(giftVoucherAppliedCents(16480, 16500)).toBe(16450)
    expect(giftVoucherAppliedCents(16450, 16500)).toBe(16450)
    expect(giftVoucherAppliedCents(16500, 16500)).toBe(16500)
    expect(giftVoucherAppliedCents(30, 40)).toBe(0)
  })
})

describe('gift voucher amounts', () => {
  it('sells whole dollars from $25 to $2000', () => {
    expect([25, 100, 2000].every(isValidGiftVoucherAmount)).toBe(true)
    expect([24, 2001, 50.5].some(isValidGiftVoucherAmount)).toBe(false)
  })
})

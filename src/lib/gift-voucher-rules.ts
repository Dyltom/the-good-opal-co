export const GIFT_VOUCHER_VALID_YEARS = 3
export const GIFT_VOUCHER_PRESET_AMOUNTS = [50, 100, 150, 250, 500] as const
export const GIFT_VOUCHER_MIN_AMOUNT = 25
export const GIFT_VOUCHER_MAX_AMOUNT = 2000
export const GIFT_VOUCHER_MESSAGE_MAX = 300
export const STRIPE_MIN_CHARGE_CENTS = 50

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_PREFIX = 'GOOD'
const CODE_PATTERN = /^GOOD([A-Z2-9]{4})([A-Z2-9]{4})$/

export type GiftVoucherProblem = 'not-found' | 'expired' | 'void' | 'empty'

export interface GiftVoucherHoldLike {
  amount: number
  state: 'held' | 'captured' | 'released'
  holdExpiresAt?: string | null
}

export interface GiftVoucherLike {
  status: 'active' | 'used' | 'void'
  balance: number
  expiresAt: string
  redemptions?: readonly GiftVoucherHoldLike[] | null
}

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function generateGiftVoucherCode(): string {
  const characters = Array.from(
    crypto.getRandomValues(new Uint8Array(8)),
    (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]
  )
  return `${CODE_PREFIX}-${characters.slice(0, 4).join('')}-${characters.slice(4).join('')}`
}

export function normaliseGiftVoucherCode(input: string): string | null {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const withPrefix = compact.startsWith(CODE_PREFIX) ? compact : `${CODE_PREFIX}${compact}`
  const match = CODE_PATTERN.exec(withPrefix)
  return match ? `${CODE_PREFIX}-${match[1]}-${match[2]}` : null
}

export function giftVoucherExpiresAt(issuedAt: Date): Date {
  const expiresAt = new Date(issuedAt)
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + GIFT_VOUCHER_VALID_YEARS)
  return expiresAt
}

export function isLiveHold(hold: GiftVoucherHoldLike, now: Date): boolean {
  return (
    hold.state === 'held' &&
    (!hold.holdExpiresAt || new Date(hold.holdExpiresAt).getTime() > now.getTime())
  )
}

export function giftVoucherAvailableCents(voucher: GiftVoucherLike, now: Date): number {
  const heldCents = (voucher.redemptions ?? [])
    .filter((hold) => isLiveHold(hold, now))
    .reduce((sum, hold) => sum + toCents(hold.amount), 0)
  return Math.max(0, toCents(voucher.balance) - heldCents)
}

export function giftVoucherProblem(
  voucher: GiftVoucherLike | null | undefined,
  now: Date
): GiftVoucherProblem | null {
  if (!voucher) return 'not-found'
  if (voucher.status === 'void') return 'void'
  if (new Date(voucher.expiresAt).getTime() <= now.getTime()) return 'expired'
  if (voucher.status === 'used' || giftVoucherAvailableCents(voucher, now) <= 0) return 'empty'
  return null
}

export function giftVoucherProblemMessage(problem: GiftVoucherProblem): string {
  switch (problem) {
    case 'not-found':
      return 'We could not find that gift voucher code. Check it and try again.'
    case 'expired':
      return 'That gift voucher has expired.'
    case 'void':
      return 'That gift voucher is no longer valid. Contact us if you think this is wrong.'
    case 'empty':
      return 'That gift voucher has no balance left.'
  }
}

export function giftVoucherAppliedCents(availableCents: number, orderTotalCents: number): number {
  const applied = Math.max(0, Math.min(availableCents, orderTotalCents))
  const remaining = orderTotalCents - applied
  if (remaining > 0 && remaining < STRIPE_MIN_CHARGE_CENTS) {
    return Math.max(0, orderTotalCents - STRIPE_MIN_CHARGE_CENTS)
  }
  return applied
}

export function isValidGiftVoucherAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) && amount >= GIFT_VOUCHER_MIN_AMOUNT && amount <= GIFT_VOUCHER_MAX_AMOUNT
  )
}

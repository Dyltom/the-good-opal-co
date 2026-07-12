import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE } from '@/lib/constants'
import { formatCurrency, formatDate, formatNumber, formatPrice } from '@/lib/utils'

describe('locale-aware formatting', () => {
  it('uses Australian English by default', () => {
    expect(formatNumber(1234.5)).toBe(new Intl.NumberFormat(DEFAULT_LOCALE).format(1234.5))
    expect(formatDate('2026-07-12T00:00:00Z', { timeZone: 'UTC' })).toBe(
      new Intl.DateTimeFormat(DEFAULT_LOCALE, { timeZone: 'UTC' }).format(
        new Date('2026-07-12T00:00:00Z')
      )
    )
    expect(formatPrice(123456)).toBe(
      new Intl.NumberFormat(DEFAULT_LOCALE, { style: 'currency', currency: 'AUD' }).format(1234.56)
    )
  })

  it('accepts an explicit display locale without changing the transaction currency', () => {
    expect(formatCurrency(1234.56, 'AUD', 'de-DE')).toBe(
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'AUD' }).format(1234.56)
    )
    expect(formatPrice(123456, 'ar-EG', 'AUD')).toBe(
      new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'AUD' }).format(1234.56)
    )
  })
})

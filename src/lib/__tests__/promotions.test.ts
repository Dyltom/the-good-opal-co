import { describe, expect, test } from 'vitest'
import { announcement, salePrice, SALES, withSalePrice } from '../promotions'

const blackFriday = SALES[0]
const at = (iso: string) => new Date(iso)

describe('promotions', () => {
  test('Black Friday prices start at midnight Sydney time and stop when Monday ends', () => {
    const ring = { price: 345, category: 'opal-rings', compareAtPrice: null }

    expect(withSalePrice(ring, at('2026-11-26T23:59:59+11:00')).price).toBe(345)
    expect(withSalePrice(ring, at('2026-11-27T00:00:00+11:00'))).toEqual({ ...ring, price: 293.25, compareAtPrice: 345 })
    expect(withSalePrice(ring, at('2026-11-30T23:59:59+11:00')).price).toBe(293.25)
    expect(withSalePrice(ring, at('2026-12-01T00:00:00+11:00')).price).toBe(345)
  })

  test('custom commission deposits are never discounted', () => {
    const deposit = { price: 50, category: 'custom-commissions' }
    expect(withSalePrice(deposit, at('2026-11-28T12:00:00+11:00')).price).toBe(50)
  })

  test('sale prices round to the cent', () => {
    expect(salePrice(17.5, blackFriday)).toBe(14.88)
    expect(salePrice(12.99, blackFriday)).toBe(11.04)
    expect(salePrice(500, blackFriday)).toBe(425)
  })

  test('the banner teases the sale, runs it, then switches to the Christmas order-by date and ends', () => {
    expect(announcement(at('2026-11-24T10:00:00+11:00'))?.text).toBe(
      'Black Friday: 15% off all opals and jewellery, Fri 27 to Mon 30 Nov'
    )
    expect(announcement(at('2026-11-29T10:00:00+11:00'))?.text).toBe(
      'Black Friday: 15% off all opals and jewellery, until Mon 30 Nov'
    )
    expect(announcement(at('2026-12-01T00:00:00+11:00'))?.href).toBe('/gifts')
    expect(announcement(at('2026-12-17T23:59:00+11:00'))?.text).toContain('Thu 17 Dec')
    expect(announcement(at('2026-12-18T00:00:00+11:00'))).toBeUndefined()
  })
})

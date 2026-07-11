import { describe, expect, test } from 'vitest'
import type { Order } from '@/types/payload-types'
import {
  requireOrderForPaymentEvent,
  statusToRestoreAfterWonDispute,
} from '@/lib/stripe-order-events'

const order = { id: 42, status: 'processing' } as Order

describe('Stripe terminal order events', () => {
  test('returns an existing order', () => {
    expect(requireOrderForPaymentEvent(order, 'charge.refunded', 'pi_123')).toBe(order)
  })

  test('throws when Stripe delivers a terminal event before its order exists', () => {
    expect(() => requireOrderForPaymentEvent(null, 'charge.refunded', 'pi_123')).toThrow(
      'retry required'
    )
  })

  test.each(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const)(
    'restores the valid pre-dispute status %s',
    (status) => {
      expect(statusToRestoreAfterWonDispute(status)).toBe(status)
    }
  )

  test.each([undefined, null, '', 'disputed', 'unknown'])(
    'falls back to processing for an unsafe pre-dispute value',
    (status) => {
      expect(statusToRestoreAfterWonDispute(status)).toBe('processing')
    }
  )
})

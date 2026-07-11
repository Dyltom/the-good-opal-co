import { describe, expect, test, vi } from 'vitest'
import type Stripe from 'stripe'
import type { InventoryReservation } from '@/types/payload-types'
import {
  checkoutReservationExpiresAt,
  reservationMatchesCheckoutItems,
  reservationTokenFromSession,
} from '@/lib/inventory-reservations'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

const reservedItems: InventoryReservation['items'] = [
  {
    id: 'line-1',
    productId: '19',
    slug: 'mintabie-opal',
    name: 'Mintabie opal',
    unitAmountCents: 4500,
    quantity: 1,
  },
]

describe('inventory reservations', () => {
  test('sets Stripe expiry beyond its 30 minute minimum', () => {
    const now = new Date('2026-07-12T00:00:00.000Z')
    expect(checkoutReservationExpiresAt(now).toISOString()).toBe('2026-07-12T00:31:00.000Z')
  })

  test('uses signed server metadata before the client reference fallback', () => {
    const session = {
      metadata: { inventoryReservationToken: 'metadata-token' },
      client_reference_id: 'client-reference',
    } as unknown as Stripe.Checkout.Session
    expect(reservationTokenFromSession(session)).toBe('metadata-token')
  })

  test('matches the exact paid product, slug, name, amount, and quantity', () => {
    expect(
      reservationMatchesCheckoutItems(reservedItems, [
        {
          productId: '19',
          slug: 'mintabie-opal',
          name: 'Mintabie opal',
          unitAmountCents: 4500,
          quantity: 1,
        },
      ])
    ).toBe(true)

    expect(
      reservationMatchesCheckoutItems(reservedItems, [
        {
          productId: '19',
          slug: 'mintabie-opal',
          name: 'Mintabie opal',
          unitAmountCents: 4400,
          quantity: 1,
        },
      ])
    ).toBe(false)
  })
})

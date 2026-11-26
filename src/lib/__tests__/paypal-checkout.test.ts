import { beforeEach, describe, expect, test, vi } from 'vitest'
import { NextRequest } from 'next/server'

type Doc = Record<string, unknown> & { id: number }
type Where = Record<string, unknown>

const db = vi.hoisted(() => ({
  collections: new Map<string, Record<string, unknown>[]>(),
  nextId: 1,
  stripeCalls: [] as string[],
  emails: [] as string[],
}))

function matches(doc: Record<string, unknown>, where: Where | undefined): boolean {
  if (!where) return true
  return Object.entries(where).every(([field, condition]) => {
    if (field === 'and') return (condition as Where[]).every((part) => matches(doc, part))
    const test = condition as { equals?: unknown; less_than_equal?: string }
    if ('equals' in test) return doc[field] === test.equals
    if (test.less_than_equal) return String(doc[field]) <= test.less_than_equal
    return true
  })
}

function rows(collection: string) {
  if (!db.collections.has(collection)) db.collections.set(collection, [])
  return db.collections.get(collection) ?? []
}

vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({
    find: async ({ collection, where }: { collection: string; where?: Where }) => {
      const docs = rows(collection).filter((doc) => matches(doc, where))
      return { docs: structuredClone(docs), totalDocs: docs.length }
    },
    findByID: async ({ collection, id }: { collection: string; id: unknown }) => {
      const doc = rows(collection).find((row) => String(row['id']) === String(id))
      if (!doc) throw new Error(`${collection} ${String(id)} not found`)
      return structuredClone(doc)
    },
    create: async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
      const doc = { ...data, id: db.nextId++ }
      rows(collection).push(doc)
      return structuredClone(doc)
    },
    update: async ({ collection, id, data }: { collection: string; id: unknown; data: object }) => {
      const doc = rows(collection).find((row) => String(row['id']) === String(id))
      if (!doc) throw new Error(`${collection} ${String(id)} not found`)
      Object.assign(doc, data)
      return structuredClone(doc)
    },
    db: {
      beginTransaction: async () => 'tx',
      commitTransaction: async () => undefined,
      rollbackTransaction: async () => undefined,
    },
  }),
}))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = {
      send: async (message: { subject?: string }) => {
        db.emails.push(message.subject ?? '')
        return { data: { id: 'email' }, error: null }
      },
    }
  },
}))
vi.mock('@/lib/insights/record', () => ({
  recordCheckoutInsight: vi.fn(),
  recordServerError: vi.fn(),
}))
vi.mock('@/lib/newsletter/checkout-buyer', () => ({ subscribeCheckoutBuyer: vi.fn() }))
vi.mock('@/lib/stripe-config', () => ({
  getConfiguredStripeSecretKey: () => 'sk_test_valid_for_mock',
}))
vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = {
      sessions: {
        retrieve: async (id: string) => {
          db.stripeCalls.push(`retrieve ${id}`)
          return { id, status: 'open' }
        },
        expire: async (id: string) => {
          db.stripeCalls.push(`expire ${id}`)
          return { id, status: 'expired' }
        },
      },
    }
  },
}))

import { calculateCheckoutPricing } from '@/lib/checkout-pricing'
import { completePayPalReturn } from '@/lib/paypal-checkout'
import { buildPayPalOrderBody, encodeCheckoutContext } from '@/lib/paypal-order'
import { GET as releaseExpiredReservations } from '@/app/api/cron/inventory-reservations/route'
import { Orders } from '@/payload/collections/Orders'

const ORDER_ID = '5O190127TN364715T'
const NOW = new Date('2026-11-26T01:00:00.000Z')
const paypal = { captureCalls: 0, capture: (): Response => json(captured()) }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function unit(country = 'AU') {
  return {
    reference_id: encodeCheckoutContext({
      country: 'AU',
      shippingLabel: 'Parcel Post',
      email: 'jo@example.com',
    }),
    amount: {
      currency_code: 'AUD',
      value: '160.20',
      breakdown: {
        item_total: { currency_code: 'AUD', value: '150.00' },
        shipping: { currency_code: 'AUD', value: '10.20' },
      },
    },
    shipping: {
      name: { full_name: 'Jo Buyer' },
      address: {
        address_line_1: '1 Opal St',
        admin_area_2: 'Cowra',
        admin_area_1: 'NSW',
        postal_code: '2794',
        country_code: country,
      },
    },
  }
}

let approved = { id: ORDER_ID, status: 'APPROVED', purchase_units: [unit()] }

function captured(status = 'COMPLETED') {
  return {
    ...approved,
    status: 'COMPLETED',
    purchase_units: [
      {
        ...approved.purchase_units[0],
        payments: { captures: [{ id: 'CAP1', status, create_time: NOW.toISOString() }] },
      },
    ],
  }
}

function seed(reservation: Partial<Doc> = {}) {
  db.collections.clear()
  db.nextId = 100
  rows('products').push({ id: 11, status: 'published', stock: 0 })
  rows('inventory-reservations').push({
    id: 1,
    token: 'attempt-1',
    stripeSessionId: `paypal-${ORDER_ID}`,
    status: 'active',
    expiresAt: '2026-11-26T01:20:00.000Z',
    items: [
      { productId: '11', slug: 'ring', name: 'Opal ring', unitAmountCents: 15000, quantity: 1 },
    ],
    ...reservation,
  })
}

const reservation = () => rows('inventory-reservations')[0] ?? {}
const stock = () => rows('products')[0]?.['stock']
const orders = () => rows('orders')

beforeEach(() => {
  vi.stubEnv('PAYPAL_CLIENT_ID', 'client')
  vi.stubEnv('PAYPAL_CLIENT_SECRET', 'secret')
  vi.stubEnv('PAYPAL_API_BASE', 'https://paypal.test')
  vi.stubEnv('CRON_SECRET', 'cron-secret')
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  approved = { id: ORDER_ID, status: 'APPROVED', purchase_units: [unit()] }
  paypal.captureCalls = 0
  paypal.capture = () => json(captured())
  db.stripeCalls = []
  db.emails = []
  seed()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith('/v1/oauth2/token')) return json({ access_token: 'token', expires_in: 3600 })
      if (url.endsWith(`/v2/checkout/orders/${ORDER_ID}/capture`)) {
        paypal.captureCalls += 1
        return paypal.capture()
      }
      if (url.endsWith(`/v2/checkout/orders/${ORDER_ID}`)) return json(approved)
      throw new Error(`Unexpected PayPal call ${url}`)
    })
  )
})

describe('PayPal order body', () => {
  test('charges exactly the item total plus the shipping the bag priced', () => {
    const items = [
      { productId: '11', name: 'Opal ring', price: 150, quantity: 1 },
      { productId: '12', name: 'Opal studs', price: 89.95, quantity: 2 },
    ]
    const pricing = calculateCheckoutPricing(items, 'AU')
    const [purchase] = buildPayPalOrderBody({
      checkoutAttemptId: 'attempt-1',
      items,
      pricing,
      context: { country: 'AU' },
    }).purchase_units

    expect(purchase?.amount.breakdown.item_total.value).toBe('329.90')
    expect(purchase?.amount.breakdown.shipping.value).toBe((pricing.shippingCents / 100).toFixed(2))
    expect(purchase?.amount.value).toBe(((32990 + pricing.shippingCents) / 100).toFixed(2))
    expect(
      purchase?.items.map((item) => [item.sku, item.unit_amount.value, item.quantity])
    ).toEqual([
      ['11', '150.00', '1'],
      ['12', '89.95', '2'],
    ])
  })
})

describe('PayPal return', () => {
  test('a successful capture creates one PayPal order and consumes the reservation', async () => {
    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe(
      `/checkout/success?paypal=${ORDER_ID}`
    )
    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe(
      `/checkout/success?paypal=${ORDER_ID}`
    )

    expect(paypal.captureCalls).toBe(1)
    expect(orders()).toHaveLength(1)
    expect(orders()[0]).toMatchObject({
      source: 'paypal',
      stripeSessionId: `paypal-${ORDER_ID}`,
      status: 'processing',
      total: 160.2,
      shipping: 10.2,
      customer: { email: 'jo@example.com', name: 'Jo Buyer' },
      shippingAddress: { line1: '1 Opal St', city: 'Cowra', country: 'AU' },
    })
    expect(reservation()['status']).toBe('consumed')
    expect(stock()).toBe(0)
  })

  test('never captures when PayPal ships to another country, and puts the piece back', async () => {
    approved = { ...approved, purchase_units: [unit('NZ')] }

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=country')

    expect(paypal.captureCalls).toBe(0)
    expect(reservation()).toMatchObject({
      status: 'released',
      releaseReason: 'shipping-country-mismatch',
    })
    expect(stock()).toBe(1)
    expect(orders()).toHaveLength(0)
  })

  test('never captures once the hold has lapsed or been released', async () => {
    seed({ expiresAt: '2026-11-26T00:59:00.000Z' })
    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=expired')
    expect(reservation()['status']).toBe('released')

    seed({ status: 'released' })
    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=expired')

    expect(paypal.captureCalls).toBe(0)
    expect(orders()).toHaveLength(0)
  })

  test('goes straight to success when the order already exists', async () => {
    rows('orders').push({
      id: 50,
      orderNumber: 'OPAL-1',
      stripeSessionId: `paypal-${ORDER_ID}`,
      confirmationEmailSentAt: NOW.toISOString(),
      inventoryAlertSentAt: NOW.toISOString(),
      customer: { email: 'jo@example.com', name: 'Jo' },
    })

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe(
      `/checkout/success?paypal=${ORDER_ID}`
    )

    expect(fetch).not.toHaveBeenCalled()
    expect(orders()).toHaveLength(1)
  })

  test('a declined capture puts the piece back on sale', async () => {
    paypal.capture = () =>
      json({ name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'INSTRUMENT_DECLINED' }] }, 422)

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=declined')

    expect(reservation()).toMatchObject({ status: 'released', releaseReason: 'payment-declined' })
    expect(stock()).toBe(1)
    expect(orders()).toHaveLength(0)
  })

  test('a capture PayPal reports as declined also puts the piece back', async () => {
    paypal.capture = () => json(captured('DECLINED'))

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=declined')

    expect(reservation()['status']).toBe('released')
    expect(stock()).toBe(1)
  })

  test('a payment PayPal is still holding is not recorded as paid and keeps the piece held', async () => {
    paypal.capture = () => json(captured('PENDING'))

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe(
      `/checkout/success?paypal=${ORDER_ID}`
    )

    expect(orders()).toHaveLength(0)
    expect(reservation()['status']).toBe('pending-payment')
    expect(stock()).toBe(0)
    expect(db.emails).toEqual([`PayPal payment needs checking - ${ORDER_ID}`])
  })

  test('the return link records the order once PayPal completes a held payment', async () => {
    paypal.capture = () => json(captured('PENDING'))
    await completePayPalReturn(ORDER_ID, NOW)
    approved = captured('COMPLETED')

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe(
      `/checkout/success?paypal=${ORDER_ID}`
    )

    expect(paypal.captureCalls).toBe(1)
    expect(orders()).toHaveLength(1)
    expect(reservation()['status']).toBe('consumed')
  })

  test('the return link puts the piece back when PayPal denies a held payment', async () => {
    paypal.capture = () => json(captured('PENDING'))
    await completePayPalReturn(ORDER_ID, NOW)
    approved = captured('DECLINED')

    await expect(completePayPalReturn(ORDER_ID, NOW)).resolves.toBe('/cart?paypal=declined')

    expect(reservation()).toMatchObject({ status: 'released', releaseReason: 'payment-declined' })
    expect(stock()).toBe(1)
    expect(orders()).toHaveLength(0)
  })
})

describe('reservation cron', () => {
  const runCron = async () =>
    (
      await releaseExpiredReservations(
        new NextRequest('https://goodopalco.com/api/cron/inventory-reservations', {
          headers: { authorization: 'Bearer cron-secret' },
        })
      )
    ).json()

  test('releases an expired PayPal hold without calling Stripe', async () => {
    seed({ expiresAt: '2000-01-01T00:00:00.000Z' })
    vi.stubEnv('PAYPAL_CLIENT_ID', '')

    expect(await runCron()).toMatchObject({ released: 1 })
    expect(reservation()).toMatchObject({ status: 'released', releaseReason: 'checkout-expired' })
    expect(stock()).toBe(1)
    expect(db.stripeCalls).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  test('records the order once PayPal completes a held payment, without the shopper returning', async () => {
    paypal.capture = () => json(captured('PENDING'))
    await completePayPalReturn(ORDER_ID, NOW)

    expect(await runCron()).toMatchObject({ paypalSettled: 0 })
    expect(orders()).toHaveLength(0)

    approved = captured('COMPLETED')
    expect(await runCron()).toMatchObject({ paypalSettled: 1 })
    expect(orders()).toHaveLength(1)
    expect(reservation()['status']).toBe('consumed')
    expect(paypal.captureCalls).toBe(1)
  })

  test('puts the piece back once PayPal denies a held payment', async () => {
    paypal.capture = () => json(captured('PENDING'))
    await completePayPalReturn(ORDER_ID, NOW)
    approved = captured('DECLINED')

    expect(await runCron()).toMatchObject({ paypalSettled: 1 })
    expect(reservation()).toMatchObject({ status: 'released', releaseReason: 'payment-declined' })
    expect(stock()).toBe(1)
    expect(orders()).toHaveLength(0)
  })
})

describe('refund status', () => {
  const markRefunded = (source: string) =>
    Orders.hooks?.beforeChange?.[0]?.({
      context: {},
      data: { status: 'refunded' },
      operation: 'update',
      originalDoc: { status: 'processing', source },
    } as never)

  test('the owner can mark a PayPal order refunded by hand but not a Stripe one', () => {
    expect(() => markRefunded('paypal')).not.toThrow()
    expect(() => markRefunded('stripe')).toThrow('Refund the payment in Stripe first')
  })
})

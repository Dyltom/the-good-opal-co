import { describe, expect, it, vi } from 'vitest'
import {
  fetchWooOrders,
  mapWooCustomer,
  mapWooOrder,
  mapWooPrivateProduct,
  payloadStatusForWoo,
  wooCustomerSchema,
  wooOrderCommerceContribution,
  type WooCustomer,
  type WooOrder,
  type WooPrivateProduct,
  type WooRefund,
} from '../private-commerce'

const address = {
  first_name: 'Ada',
  last_name: 'Lovelace',
  company: '',
  address_1: '1 Opal Road',
  address_2: '',
  city: 'Sydney',
  state: 'NSW',
  postcode: '2000',
  country: 'AU',
  email: 'ADA@EXAMPLE.COM',
  phone: '0400000000',
}

function order(id: number): WooOrder {
  return {
    id,
    number: String(1000 + id),
    status: 'completed',
    currency: 'AUD',
    date_created_gmt: '2024-01-01T01:02:03',
    date_paid_gmt: '2024-01-01T01:03:03',
    customer_id: 7,
    billing: address,
    shipping: address,
    payment_method: 'stripe',
    payment_method_title: 'Credit card',
    transaction_id: 'txn_123',
    customer_note: 'Leave safely',
    shipping_total: '10.00',
    total_tax: '5.00',
    total: '115.00',
    line_items: [
      {
        id: 99,
        name: 'Black opal',
        product_id: 42,
        variation_id: 0,
        quantity: 2,
        subtotal: '100.00',
        total: '100.00',
        total_tax: '5.00',
        price: 50,
        sku: 'OP-42',
      },
    ],
    refunds: [{ id: 3, reason: 'Returned', total: '-25.00' }],
  }
}

describe('private WooCommerce API', () => {
  it('paginates with Basic auth without placing credentials in URLs or errors', async () => {
    const requests: Array<{ url: URL; authorization: string | null }> = []
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input))
      const headers = new Headers(init?.headers)
      requests.push({ url, authorization: headers.get('authorization') })
      const currentPage = Number(url.searchParams.get('page'))
      return new Response(JSON.stringify([order(currentPage)]), {
        status: 200,
        headers: { 'x-wp-totalpages': '2' },
      })
    })

    const records = await fetchWooOrders({
      baseUrl: 'https://shop.example.com/',
      consumerKey: 'ck_private',
      consumerSecret: 'cs_private',
      fetcher,
      perPage: 1,
    })

    expect(records.map((record) => record.id)).toEqual([1, 2])
    expect(requests).toHaveLength(2)
    expect(requests[0]?.url.pathname).toBe('/wp-json/wc/v3/orders')
    expect(requests[0]?.url.searchParams.get('status')).toBe('any')
    expect(requests[0]?.url.toString()).not.toContain('ck_private')
    expect(requests[0]?.url.toString()).not.toContain('cs_private')
    expect(requests[0]?.authorization).toMatch(/^Basic /)
  })
})

describe('WooCommerce import mapping', () => {
  it('preserves order totals, addresses, payment metadata, product references, and refunds', () => {
    const refund: WooRefund = {
      id: 3,
      date_created_gmt: '2024-01-03T04:05:06',
      amount: '25.00',
      reason: 'Returned',
      refunded_by: 1,
    }
    const mapped = mapWooOrder(order(9), [refund], new Map([[42, { id: 321, slug: 'black-opal' }]]))

    expect(mapped).toMatchObject({
      orderNumber: 'WOO-1009',
      source: 'woocommerce',
      legacyWooId: 9,
      legacyWooStatus: 'completed',
      status: 'delivered',
      orderPlacedAt: '2024-01-01T01:02:03Z',
      paidAt: '2024-01-01T01:03:03Z',
      customer: { email: 'ada@example.com', name: 'Ada Lovelace' },
      shippingAddress: { line1: '1 Opal Road', postalCode: '2000' },
      subtotal: 100,
      shipping: 10,
      tax: 5,
      total: 115,
      stripeSessionId: 'legacy-woo-9',
      paymentMethod: 'Credit card',
      legacyTransactionId: 'txn_123',
      items: [{ productId: '321', slug: 'black-opal', price: 50, quantity: 2 }],
      legacyRefunds: [{ legacyWooId: 3, amount: 25, refundedBy: 1 }],
    })
  })

  it('maps every WooCommerce lifecycle to a supported operational status', () => {
    expect(payloadStatusForWoo('pending')).toBe('pending')
    expect(payloadStatusForWoo('on-hold')).toBe('pending')
    expect(payloadStatusForWoo('processing')).toBe('processing')
    expect(payloadStatusForWoo('completed')).toBe('delivered')
    expect(payloadStatusForWoo('cancelled')).toBe('cancelled')
    expect(payloadStatusForWoo('failed')).toBe('cancelled')
    expect(payloadStatusForWoo('refunded')).toBe('refunded')
  })

  it('derives customer totals only from paid orders and nets refunds', () => {
    const refund: WooRefund = {
      id: 3,
      date_created_gmt: '2024-01-03T04:05:06',
      amount: '25.00',
      reason: 'Returned',
      refunded_by: 1,
    }

    expect(wooOrderCommerceContribution(order(9), [refund])).toEqual({
      totalOrders: 1,
      totalSpent: 90,
    })
    expect(
      wooOrderCommerceContribution({ ...order(10), status: 'cancelled', date_paid_gmt: null }, [])
    ).toEqual({ totalOrders: 0, totalSpent: 0 })
  })

  it('preserves legacy quote records that have no line items', () => {
    const emptyOrder = { ...order(11), line_items: [] }
    const mapped = mapWooOrder(emptyOrder, [])

    expect(mapped.items).toEqual([
      {
        productId: 'legacy-woo-order-11',
        slug: 'legacy-woo-order-11',
        name: 'Legacy WooCommerce order (no line items)',
        price: 0,
        quantity: 1,
      },
    ])
  })

  it('preserves orders with missing billing email using a non-deliverable audit address', () => {
    const noEmailOrder = {
      ...order(12),
      billing: { ...address, email: '' },
      customer_note: '',
    }
    const mapped = mapWooOrder(noEmailOrder, [])

    expect(mapped.customer.email).toBe('legacy-order-12@legacy.invalid')
    expect(mapped.notes).toContain('billing email was missing')
  })

  it('does not infer marketing consent while preserving customer commerce totals', () => {
    const customer: WooCustomer = {
      id: 7,
      date_created_gmt: '2022-06-01T00:00:00',
      email: 'ADA@EXAMPLE.COM',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: address,
      shipping: address,
      is_paying_customer: true,
      orders_count: 4,
      total_spent: '825.50',
    }

    expect(mapWooCustomer(customer)).toMatchObject({
      legacyWooId: 7,
      email: 'ada@example.com',
      subscribedToNewsletter: false,
      emailVerified: false,
      source: 'import',
      totalOrders: 4,
      totalSpent: 825.5,
    })
  })

  it('accepts WooCommerce customer responses that omit aggregate statistics', () => {
    const customer = wooCustomerSchema.parse({
      id: 7,
      date_created_gmt: '2022-06-01T00:00:00',
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: address,
      shipping: address,
      is_paying_customer: true,
    })

    expect(customer.orders_count).toBe(0)
    expect(customer.total_spent).toBe('0')
  })

  it('preserves customers with Payload-invalid legacy email addresses', () => {
    const customer = wooCustomerSchema.parse({
      id: 85,
      date_created_gmt: '2022-06-01T00:00:00',
      email: '.9541@gmail.com',
      first_name: '',
      last_name: '',
      billing: address,
      shipping: address,
      is_paying_customer: false,
    })

    expect(mapWooCustomer(customer)).toMatchObject({
      email: 'legacy-customer-85@legacy.invalid',
      notes: 'Original invalid WooCommerce email: .9541@gmail.com',
    })
  })

  it('preserves private product visibility and exact managed stock', () => {
    const product: WooPrivateProduct = {
      id: 42,
      name: 'Black Opal Pendant',
      slug: 'black-opal-pendant',
      status: 'publish',
      catalog_visibility: 'visible',
      description: '<p>Natural &amp; bright</p>',
      short_description: '',
      sku: 'OP-42',
      price: '450.00',
      regular_price: '500.00',
      sale_price: '450.00',
      manage_stock: true,
      stock_quantity: 3,
      stock_status: 'instock',
      date_modified_gmt: '2024-04-05T06:07:08',
      categories: [{ id: 1, name: 'Pendants', slug: 'pendants' }],
      tags: [{ id: 2, name: 'Black opal', slug: 'black-opal' }],
    }

    expect(mapWooPrivateProduct(product)).toMatchObject({
      legacyWooId: 42,
      wooStatus: 'publish',
      wooCatalogVisibility: 'visible',
      wooManageStock: true,
      status: 'published',
      stock: 3,
      price: 450,
      compareAtPrice: 500,
      sku: 'OP-42',
      category: 'opal-necklaces',
      description: 'Natural & bright',
    })
  })
})

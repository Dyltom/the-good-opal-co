import { z } from 'zod'
import { categoryForWooProduct, plainTextFromHtml, type ProductCategory } from './catalog-sync'

const nullableDate = z.string().min(1).nullable()
const addressSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
})

const orderLineSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  product_id: z.number().int().nonnegative(),
  variation_id: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  subtotal: z.string(),
  total: z.string(),
  total_tax: z.string(),
  price: z.number().nonnegative(),
  sku: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? ''),
})

const refundSummarySchema = z.object({
  id: z.number().int().positive(),
  reason: z.string(),
  total: z.string(),
})

export const wooOrderSchema = z.object({
  id: z.number().int().positive(),
  number: z.string(),
  status: z.string(),
  currency: z.string(),
  date_created_gmt: z.string().min(1),
  date_paid_gmt: nullableDate,
  customer_id: z.number().int().nonnegative(),
  billing: addressSchema,
  shipping: addressSchema,
  payment_method: z.string(),
  payment_method_title: z.string(),
  transaction_id: z.string(),
  customer_note: z.string(),
  subtotal: z.string().optional(),
  shipping_total: z.string(),
  total_tax: z.string(),
  total: z.string(),
  line_items: z.array(orderLineSchema),
  refunds: z.array(refundSummarySchema),
})

export const wooCustomerSchema = z.object({
  id: z.number().int().positive(),
  date_created_gmt: z.string().min(1),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  billing: addressSchema,
  shipping: addressSchema,
  is_paying_customer: z.boolean(),
  orders_count: z.number().int().nonnegative().optional().default(0),
  total_spent: z.string().optional().default('0'),
})

const productTaxonomySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
})

const productImageSchema = z.object({
  id: z.number().int().positive(),
  src: z.url(),
  name: z.string().default(''),
  alt: z.string().default(''),
})

export const wooPrivateProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.string(),
  catalog_visibility: z.string(),
  description: z.string(),
  short_description: z.string(),
  sku: z.string(),
  price: z.string(),
  regular_price: z.string(),
  sale_price: z.string(),
  manage_stock: z.boolean(),
  stock_quantity: z.number().int().nullable(),
  stock_status: z.string(),
  date_modified_gmt: z.string().min(1),
  categories: z.array(productTaxonomySchema),
  tags: z.array(productTaxonomySchema),
  images: z.array(productImageSchema).default([]),
})

export const wooRefundSchema = z.object({
  id: z.number().int().positive(),
  date_created_gmt: z.string().min(1),
  amount: z.string(),
  reason: z.string(),
  refunded_by: z.number().int().nonnegative(),
})

export type WooOrder = z.infer<typeof wooOrderSchema>
export type WooCustomer = z.infer<typeof wooCustomerSchema>
export type WooPrivateProduct = z.infer<typeof wooPrivateProductSchema>
export type WooRefund = z.infer<typeof wooRefundSchema>

export interface WooCredentials {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
}

export interface WooFetchOptions extends WooCredentials {
  fetcher?: typeof fetch
  perPage?: number
}

export interface WooAdminFetchOptions {
  baseUrl: string
  username: string
  password: string
  fetcher?: typeof fetch
  perPage?: number
}

export interface WooCommerceSnapshot {
  orders: WooOrder[]
  customers: WooCustomer[]
  products: WooPrivateProduct[]
  refundsByOrderId: ReadonlyMap<number, WooRefund[]>
}

export interface LegacyAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface LegacyOrderData {
  orderNumber: string
  source: 'woocommerce'
  legacyWooId: number
  legacyWooStatus: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  orderPlacedAt: string
  paidAt?: string
  customer: { email: string; name: string; phone?: string }
  shippingAddress: LegacyAddress
  billingAddress: LegacyAddress
  items: Array<{
    productId: string
    slug: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  stripeSessionId: string
  paymentMethod?: string
  legacyTransactionId?: string
  legacyRefunds: Array<{
    legacyWooId: number
    amount: number
    reason: string
    refundedAt: string
    refundedBy: number
  }>
  notes?: string
}

export interface LegacyCustomerData {
  legacyWooId: number
  wooCreatedAt: string
  email: string
  name?: string
  phone?: string
  subscribedToNewsletter: false
  emailVerified: false
  source: 'import'
  totalOrders: number
  totalSpent: number
  defaultAddress: Partial<LegacyAddress>
  tags: Array<{ tag: string }>
  notes?: string
}

export interface LegacyProductData {
  legacyWooId: number
  wooStatus: string
  wooCatalogVisibility: string
  wooManageStock: boolean
  wooModifiedAt: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  category: ProductCategory
  tags: Array<{ tag: string }>
  status: 'published' | 'draft' | 'archived'
  stock: number
  sku: string
}

export function wooPrimaryImageFilename(
  product: Pick<WooPrivateProduct, 'images'>
): string | undefined {
  const sourceUrl = product.images[0]?.src
  if (!sourceUrl) return undefined
  const filename = new URL(sourceUrl).pathname.split('/').at(-1)
  return filename ? decodeURIComponent(filename).toLowerCase() : undefined
}

function apiRoot(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, '')
  return normalized.endsWith('/wp-json/wc/v3') ? normalized : `${normalized}/wp-json/wc/v3`
}

function authenticationHeader(options: WooCredentials): string {
  return `Basic ${Buffer.from(`${options.consumerKey}:${options.consumerSecret}`).toString('base64')}`
}

async function fetchPages<T>(
  path: string,
  schema: z.ZodType<T>,
  options: WooFetchOptions,
  extraParameters: Readonly<Record<string, string>> = {}
): Promise<T[]> {
  const fetcher = options.fetcher ?? fetch
  const perPage = options.perPage ?? 100
  const records: T[] = []
  let page = 1
  let totalPages: number | null = null

  do {
    const url = new URL(`${apiRoot(options.baseUrl)}/${path.replace(/^\//, '')}`)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    for (const [name, value] of Object.entries(extraParameters)) {
      url.searchParams.set(name, value)
    }
    const response = await fetcher(url, {
      headers: {
        accept: 'application/json',
        authorization: authenticationHeader(options),
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(`WooCommerce request failed (${response.status}) for ${path} page ${page}`)
    }

    records.push(...z.array(schema).parse(await response.json()))
    const totalPagesHeader = response.headers.get('x-wp-totalpages')
    if (totalPagesHeader !== null) {
      const parsed = Number.parseInt(totalPagesHeader, 10)
      if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`WooCommerce returned invalid X-WP-TotalPages for ${path}`)
      }
      totalPages = parsed
    }
    if (totalPages === null && records.length < page * perPage) break
    page += 1
  } while (totalPages === null || page <= totalPages)

  return records
}

export function fetchWooOrders(options: WooFetchOptions): Promise<WooOrder[]> {
  return fetchPages('orders', wooOrderSchema, options, { status: 'any' })
}

export function fetchWooCustomers(options: WooFetchOptions): Promise<WooCustomer[]> {
  return fetchPages('customers', wooCustomerSchema, options)
}

export function fetchWooPrivateProducts(options: WooFetchOptions): Promise<WooPrivateProduct[]> {
  return fetchPages('products', wooPrivateProductSchema, options, { status: 'any' })
}

export function fetchWooRefunds(orderId: number, options: WooFetchOptions): Promise<WooRefund[]> {
  return fetchPages(`orders/${orderId}/refunds`, wooRefundSchema, options)
}

export async function fetchWooCommerceSnapshot(
  options: WooFetchOptions
): Promise<WooCommerceSnapshot> {
  const [orders, customers, products] = await Promise.all([
    fetchWooOrders(options),
    fetchWooCustomers(options),
    fetchWooPrivateProducts(options),
  ])
  const refundsByOrderId = new Map<number, WooRefund[]>()
  for (const order of orders) {
    if (order.refunds.length === 0) continue
    refundsByOrderId.set(order.id, await fetchWooRefunds(order.id, options))
  }
  return { orders, customers, products, refundsByOrderId }
}

function responseCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const setCookies = headers.getSetCookie?.() ?? []
  const fallback = response.headers.get('set-cookie')
  return (setCookies.length > 0 ? setCookies : fallback ? [fallback] : []).map(
    (cookie) => cookie.split(';', 1)[0] ?? ''
  )
}

function mergeCookies(current: Map<string, string>, cookies: readonly string[]): void {
  for (const cookie of cookies) {
    const separator = cookie.indexOf('=')
    if (separator < 1) continue
    current.set(cookie.slice(0, separator), cookie.slice(separator + 1))
  }
}

function cookieHeader(cookies: ReadonlyMap<string, string>): string {
  return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ')
}

async function fetchAdminPages<T>(
  path: string,
  schema: z.ZodType<T>,
  options: WooAdminFetchOptions,
  cookies: ReadonlyMap<string, string>,
  nonce: string,
  extraParameters: Readonly<Record<string, string>> = {}
): Promise<T[]> {
  const fetcher = options.fetcher ?? fetch
  const perPage = options.perPage ?? 100
  const records: T[] = []
  let page = 1
  let totalPages = 1

  do {
    const url = new URL(`${apiRoot(options.baseUrl)}/${path.replace(/^\//, '')}`)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    for (const [name, value] of Object.entries(extraParameters)) {
      url.searchParams.set(name, value)
    }
    const response = await fetcher(url, {
      headers: {
        accept: 'application/json',
        cookie: cookieHeader(cookies),
        'x-wp-nonce': nonce,
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new Error(
        `WooCommerce admin request failed (${response.status}) for ${path} page ${page}`
      )
    }
    records.push(...z.array(schema).parse(await response.json()))
    const totalPagesHeader = response.headers.get('x-wp-totalpages')
    if (totalPagesHeader) {
      const parsed = Number.parseInt(totalPagesHeader, 10)
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`WooCommerce returned invalid X-WP-TotalPages for ${path}`)
      }
      totalPages = parsed
    }
    page += 1
  } while (page <= totalPages)

  return records
}

export async function fetchWooCommerceSnapshotFromAdmin(
  options: WooAdminFetchOptions
): Promise<WooCommerceSnapshot> {
  const fetcher = options.fetcher ?? fetch
  const parsedBaseUrl = new URL(options.baseUrl)
  if (parsedBaseUrl.protocol !== 'https:') {
    throw new Error('WooCommerce administrator imports require HTTPS')
  }
  parsedBaseUrl.pathname = parsedBaseUrl.pathname.replace(/\/$/, '')
  parsedBaseUrl.search = ''
  parsedBaseUrl.hash = ''
  const baseUrl = parsedBaseUrl.toString().replace(/\/$/, '')
  const cookies = new Map<string, string>([['wordpress_test_cookie', 'WP Cookie check']])
  const loginBody = new URLSearchParams({
    log: options.username,
    pwd: options.password,
    'wp-submit': 'Log In',
    redirect_to: `${baseUrl}/wp-admin/`,
    testcookie: '1',
  })
  const loginResponse = await fetcher(`${baseUrl}/wp-login.php`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: cookieHeader(cookies),
    },
    body: loginBody,
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
  mergeCookies(cookies, responseCookies(loginResponse))
  if (
    ![301, 302, 303].includes(loginResponse.status) ||
    ![...cookies.keys()].some((name) => name.startsWith('wordpress_logged_in_'))
  ) {
    throw new Error('WooCommerce administrator login failed')
  }

  const nonceResponse = await fetcher(`${baseUrl}/wp-admin/admin-ajax.php?action=rest-nonce`, {
    headers: { cookie: cookieHeader(cookies) },
    signal: AbortSignal.timeout(30_000),
  })
  const nonce = (await nonceResponse.text()).trim()
  if (!nonceResponse.ok || !/^[A-Za-z0-9]+$/.test(nonce)) {
    throw new Error('WooCommerce REST nonce request failed')
  }

  const [orders, customers, products] = await Promise.all([
    fetchAdminPages('orders', wooOrderSchema, options, cookies, nonce, { status: 'any' }),
    fetchAdminPages('customers', wooCustomerSchema, options, cookies, nonce),
    fetchAdminPages('products', wooPrivateProductSchema, options, cookies, nonce, {
      status: 'any',
    }),
  ])
  const refundsByOrderId = new Map<number, WooRefund[]>()
  for (const order of orders) {
    if (order.refunds.length === 0) continue
    refundsByOrderId.set(
      order.id,
      await fetchAdminPages(`orders/${order.id}/refunds`, wooRefundSchema, options, cookies, nonce)
    )
  }

  return { orders, customers, products, refundsByOrderId }
}

function money(value: string, label: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid WooCommerce ${label}`)
  return parsed
}

function dateFromGmt(value: string): string {
  return `${value.replace(/Z$/, '')}Z`
}

function fullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim()
}

function isPayloadEmail(value: string): boolean {
  if (!z.string().email().safeParse(value).success) return false
  const [localPart] = value.split('@')
  return Boolean(
    localPart && !localPart.startsWith('.') && !localPart.endsWith('.') && !localPart.includes('..')
  )
}

function addressFromWoo(
  address: z.infer<typeof addressSchema>,
  fallback: LegacyAddress
): LegacyAddress {
  return {
    line1: address.address_1 || fallback.line1,
    ...(address.address_2 ? { line2: address.address_2 } : {}),
    city: address.city || fallback.city,
    state: address.state || fallback.state,
    postalCode: address.postcode || fallback.postalCode,
    country: address.country || fallback.country,
  }
}

export function payloadStatusForWoo(status: string): LegacyOrderData['status'] {
  switch (status) {
    case 'processing':
      return 'processing'
    case 'completed':
      return 'delivered'
    case 'refunded':
      return 'refunded'
    case 'cancelled':
    case 'failed':
    case 'trash':
      return 'cancelled'
    default:
      return 'pending'
  }
}

export function wooOrderCommerceContribution(
  order: WooOrder,
  refunds: readonly WooRefund[]
): { totalOrders: number; totalSpent: number } {
  if (!order.date_paid_gmt) return { totalOrders: 0, totalSpent: 0 }

  const refunded = refunds.reduce(
    (sum, refund) => sum + money(refund.amount, `refund ${refund.id} amount`),
    0
  )
  return {
    totalOrders: 1,
    totalSpent: Math.max(0, money(order.total, 'order total') - refunded),
  }
}

export function mapWooOrder(
  order: WooOrder,
  refunds: readonly WooRefund[],
  productReferences: ReadonlyMap<number, { id: string | number; slug: string }> = new Map()
): LegacyOrderData {
  const billingEmail = order.billing.email.trim().toLowerCase()
  const hasValidBillingEmail = isPayloadEmail(billingEmail)
  const email = hasValidBillingEmail ? billingEmail : `legacy-order-${order.id}@legacy.invalid`
  const unavailable: LegacyAddress = {
    line1: 'Not provided',
    city: 'Not provided',
    state: 'Not provided',
    postalCode: 'Not provided',
    country: 'AU',
  }
  const billingAddress = addressFromWoo(order.billing, unavailable)
  const shippingAddress = addressFromWoo(order.shipping, billingAddress)
  const computedSubtotal = order.line_items.reduce(
    (sum, item) => sum + money(item.subtotal, `line item ${item.id} subtotal`),
    0
  )
  const items =
    order.line_items.length > 0
      ? order.line_items.map((item) => {
          const reference = productReferences.get(item.product_id)
          return {
            productId: String(reference?.id ?? `legacy-woo-product-${item.product_id}`),
            slug: reference?.slug ?? `legacy-woo-product-${item.product_id}`,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }
        })
      : [
          {
            productId: `legacy-woo-order-${order.id}`,
            slug: `legacy-woo-order-${order.id}`,
            name: 'Legacy WooCommerce order (no line items)',
            price: 0,
            quantity: 1,
          },
        ]
  const notes = [
    ...(hasValidBillingEmail ? [] : ['WooCommerce billing email was missing or invalid.']),
    ...(order.customer_note ? [`WooCommerce customer note: ${order.customer_note}`] : []),
  ]

  return {
    orderNumber: `WOO-${order.number || order.id}`,
    source: 'woocommerce',
    legacyWooId: order.id,
    legacyWooStatus: order.status,
    status: payloadStatusForWoo(order.status),
    orderPlacedAt: dateFromGmt(order.date_created_gmt),
    ...(order.date_paid_gmt ? { paidAt: dateFromGmt(order.date_paid_gmt) } : {}),
    customer: {
      email,
      name: fullName(order.billing.first_name, order.billing.last_name) || email,
      ...(order.billing.phone ? { phone: order.billing.phone } : {}),
    },
    shippingAddress,
    billingAddress,
    items,
    subtotal: order.subtotal ? money(order.subtotal, 'order subtotal') : computedSubtotal,
    shipping: money(order.shipping_total, 'shipping total'),
    tax: money(order.total_tax, 'tax total'),
    total: money(order.total, 'order total'),
    currency: order.currency,
    stripeSessionId: `legacy-woo-${order.id}`,
    ...(order.payment_method_title || order.payment_method
      ? { paymentMethod: order.payment_method_title || order.payment_method }
      : {}),
    ...(order.transaction_id ? { legacyTransactionId: order.transaction_id } : {}),
    legacyRefunds: refunds.map((refund) => ({
      legacyWooId: refund.id,
      amount: money(refund.amount, `refund ${refund.id} amount`),
      reason: refund.reason,
      refundedAt: dateFromGmt(refund.date_created_gmt),
      refundedBy: refund.refunded_by,
    })),
    ...(notes.length > 0 ? { notes: notes.join('\n') } : {}),
  }
}

export function mapWooCustomer(customer: WooCustomer): LegacyCustomerData {
  const sourceEmail = customer.email.trim().toLowerCase()
  const hasValidEmail = isPayloadEmail(sourceEmail)
  const email = hasValidEmail ? sourceEmail : `legacy-customer-${customer.id}@legacy.invalid`
  const address = customer.shipping.address_1 ? customer.shipping : customer.billing
  return {
    legacyWooId: customer.id,
    wooCreatedAt: dateFromGmt(customer.date_created_gmt),
    email,
    ...(fullName(customer.first_name, customer.last_name)
      ? { name: fullName(customer.first_name, customer.last_name) }
      : {}),
    ...(customer.billing.phone ? { phone: customer.billing.phone } : {}),
    subscribedToNewsletter: false,
    emailVerified: false,
    source: 'import',
    totalOrders: customer.orders_count,
    totalSpent: money(customer.total_spent, `customer ${customer.id} total spent`),
    defaultAddress: {
      ...(address.address_1 ? { line1: address.address_1 } : {}),
      ...(address.address_2 ? { line2: address.address_2 } : {}),
      ...(address.city ? { city: address.city } : {}),
      ...(address.state ? { state: address.state } : {}),
      ...(address.postcode ? { postalCode: address.postcode } : {}),
      ...(address.country ? { country: address.country } : {}),
    },
    tags: [{ tag: customer.is_paying_customer ? 'WooCommerce customer' : 'WooCommerce account' }],
    ...(hasValidEmail ? {} : { notes: `Original invalid WooCommerce email: ${sourceEmail}` }),
  }
}

export function mapWooPrivateProduct(product: WooPrivateProduct): LegacyProductData {
  const price = money(product.price || product.regular_price || '0', `product ${product.id} price`)
  const regularPrice = money(
    product.regular_price || String(price),
    `product ${product.id} regular price`
  )
  const category = categoryForWooProduct(product)
  const isSellable = product.status === 'publish' && product.catalog_visibility !== 'hidden'
  return {
    legacyWooId: product.id,
    wooStatus: product.status,
    wooCatalogVisibility: product.catalog_visibility,
    wooManageStock: product.manage_stock,
    wooModifiedAt: dateFromGmt(product.date_modified_gmt),
    name: product.name,
    slug: product.slug,
    description: plainTextFromHtml(product.description || product.short_description),
    price,
    compareAtPrice: regularPrice > price ? regularPrice : null,
    category,
    tags: product.tags.map((tag) => ({ tag: tag.name })),
    status: isSellable ? 'published' : product.status === 'trash' ? 'archived' : 'draft',
    stock: product.manage_stock
      ? (product.stock_quantity ?? 0)
      : product.stock_status === 'instock'
        ? 1
        : 0,
    sku: product.sku || `WP-${product.id}`,
  }
}

const DEFAULT_API_BASE = 'https://api-m.paypal.com'
const TOKEN_EXPIRY_MARGIN_MS = 60_000
const ORDER_ID = /^[A-Z0-9]{5,36}$/

export const PAYPAL_REFERENCE_PREFIX = 'paypal-'

export function paypalReference(orderId: string): string {
  return `${PAYPAL_REFERENCE_PREFIX}${orderId}`
}

export function isPayPalReference(reference: string | null | undefined): boolean {
  return Boolean(reference?.startsWith(PAYPAL_REFERENCE_PREFIX))
}

export function isPayPalOrderId(value: unknown): value is string {
  return typeof value === 'string' && ORDER_ID.test(value)
}

export interface PayPalMoney {
  currency_code: string
  value: string
}

export interface PayPalAddress {
  address_line_1?: string
  address_line_2?: string
  admin_area_2?: string
  admin_area_1?: string
  postal_code?: string
  country_code?: string
}

export interface PayPalCapture {
  id: string
  status: string
  amount?: PayPalMoney
  create_time?: string
  status_details?: { reason?: string }
}

export interface PayPalPurchaseUnit {
  reference_id?: string
  custom_id?: string
  invoice_id?: string
  amount?: PayPalMoney & {
    breakdown?: { item_total?: PayPalMoney; shipping?: PayPalMoney }
  }
  items?: { name: string; unit_amount: PayPalMoney; quantity: string; sku?: string }[]
  shipping?: { name?: { full_name?: string }; address?: PayPalAddress }
  payments?: { captures?: PayPalCapture[] }
}

export interface PayPalOrder {
  id: string
  status: string
  create_time?: string
  links?: { href: string; rel: string }[]
  payer?: {
    email_address?: string
    name?: { given_name?: string; surname?: string }
    phone?: { phone_number?: { national_number?: string } }
  }
  purchase_units?: PayPalPurchaseUnit[]
}

export class PayPalError extends Error {
  readonly status: number
  readonly issue: string | undefined

  constructor(status: number, issue: string | undefined, message: string) {
    super(message)
    this.name = 'PayPalError'
    this.status = status
    this.issue = issue
  }
}

function credentials(): { id: string; secret: string } | null {
  const id = process.env['PAYPAL_CLIENT_ID']?.trim()
  const secret = process.env['PAYPAL_CLIENT_SECRET']?.trim()
  return id && secret ? { id, secret } : null
}

function apiBase(): string {
  return (process.env['PAYPAL_API_BASE']?.trim() || DEFAULT_API_BASE).replace(/\/$/, '')
}

export function paypalConfigured(): boolean {
  return credentials() !== null
}

async function paypalError(response: Response): Promise<PayPalError> {
  const body: unknown = await response.json().catch(() => null)
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const details = Array.isArray(record['details']) ? (record['details'] as unknown[]) : []
  const first =
    details[0] && typeof details[0] === 'object' ? (details[0] as Record<string, unknown>) : {}
  const issue =
    typeof first['issue'] === 'string'
      ? first['issue']
      : typeof record['name'] === 'string'
        ? record['name']
        : typeof record['error'] === 'string'
          ? record['error']
          : undefined
  const message = typeof record['message'] === 'string' ? record['message'] : response.statusText
  return new PayPalError(
    response.status,
    issue,
    `PayPal ${response.status} ${issue ?? ''}: ${message}`.trim()
  )
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value
  const creds = credentials()
  if (!creds) throw new Error('PayPal is not configured')
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${creds.id}:${creds.secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!response.ok) throw await paypalError(response)
  const body = (await response.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
  }
  return body.access_token
}

async function request(
  method: 'GET' | 'POST',
  path: string,
  options: { body?: unknown; requestId?: string } = {}
): Promise<PayPalOrder> {
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.requestId ? { 'PayPal-Request-Id': options.requestId } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: 'no-store',
  })
  if (!response.ok) throw await paypalError(response)
  return (await response.json()) as PayPalOrder
}

function orderPath(orderId: string): string {
  if (!isPayPalOrderId(orderId))
    throw new PayPalError(400, 'INVALID_RESOURCE_ID', 'Invalid PayPal order id')
  return `/v2/checkout/orders/${orderId}`
}

export function createOrder(body: unknown, requestId: string): Promise<PayPalOrder> {
  return request('POST', '/v2/checkout/orders', { body, requestId })
}

export function getOrder(orderId: string): Promise<PayPalOrder> {
  return request('GET', orderPath(orderId))
}

export function captureOrder(orderId: string, requestId: string): Promise<PayPalOrder> {
  return request('POST', `${orderPath(orderId)}/capture`, { requestId })
}

export function approveUrl(order: PayPalOrder): string | undefined {
  return order.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href
}

export function moneyToCents(money: PayPalMoney | undefined): number | null {
  if (!money || !/^\d+(\.\d{1,2})?$/.test(money.value)) return null
  return Math.round(Number(money.value) * 100)
}

export function centsToMoney(cents: number): PayPalMoney {
  return { currency_code: 'AUD', value: (cents / 100).toFixed(2) }
}

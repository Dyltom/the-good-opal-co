import { createHash } from 'node:crypto'
import type { ReactElement } from 'react'
import { Resend } from 'resend'
import type Stripe from 'stripe'
import { SavedBagEmail, type SavedBagLine } from '@/emails/saved-bag'
import { hasMarketingConsent } from '@/lib/marketing-consent'
import { createCampaignUnsubscribeToken } from '@/lib/newsletter/campaign-unsubscribe-token'
import { UNSUBSCRIBED_TAG } from '@/lib/newsletter/service'
import { getPayload } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Customer } from '@/types/payload-types'

export interface ReminderLine extends SavedBagLine {
  productId: string
}

export type CartReminderOutcome =
  | 'sent'
  | 'no-consent'
  | 'sold-out'
  | 'unsubscribed'
  | 'ordered-since'
  | 'rate-limited'
  | 'failed'

const DAY = 24 * 60 * 60
const PAID_ORDER_STATUSES = ['processing', 'shipped', 'delivered']

function optedOut(customer: Customer | undefined): boolean {
  if (!customer) return false
  if (customer.tags?.some(({ tag }) => tag === UNSUBSCRIBED_TAG)) return true
  return !customer.subscribedToNewsletter && Boolean(customer.subscribedAt)
}

export async function sendCartReminder(
  session: Stripe.Checkout.Session,
  lines: ReminderLine[]
): Promise<CartReminderOutcome> {
  const email = session.customer_email?.trim().toLowerCase()
  if (!email || !hasMarketingConsent(session.metadata)) return 'no-consent'

  const payload = await getPayload()
  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      and: [
        { id: { in: lines.map((line) => line.productId) } },
        { status: { equals: 'published' } },
        { stock: { greater_than: 0 } },
      ],
    },
    limit: lines.length,
    depth: 0,
  })
  const inStock = new Set(products.map((product) => String(product.id)))
  const available = lines.filter((line) => inStock.has(line.productId))
  if (available.length === 0) return 'sold-out'

  const {
    docs: [existing],
  } = await payload.find({
    collection: 'customers',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (optedOut(existing)) return 'unsubscribed'

  const orders = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { 'customer.email': { equals: email } },
        { status: { in: PAID_ORDER_STATUSES } },
        { createdAt: { greater_than: new Date(session.created * 1000).toISOString() } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (orders.docs.length > 0) return 'ordered-since'

  const allowed =
    (await checkRateLimit({
      scope: 'cart-reminder-email',
      identifier: createHash('sha256').update(email).digest('hex').slice(0, 32),
      limit: 1,
      windowSeconds: 7 * DAY,
    })) &&
    (await checkRateLimit({
      scope: 'cart-reminder-sitewide',
      identifier: 'all',
      limit: 30,
      windowSeconds: DAY,
    }))
  if (!allowed) return 'rate-limited'

  const customer =
    existing ??
    (await payload.create({
      collection: 'customers',
      data: { email, name: '', source: 'checkout', subscribedToNewsletter: false },
    }))

  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] ?? '').trim().replace(/\/$/, '')
  const token = createCampaignUnsubscribeToken(customer.id, process.env['PAYLOAD_SECRET'] ?? '')
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
  const sent = await new Resend(process.env['RESEND_API_KEY'] ?? '').emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: email,
      replyTo: process.env['CONTACT_EMAIL'] || undefined,
      subject: 'Still thinking it over? Your bag at The Good Opal Co',
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
      react: SavedBagEmail({
        lines: available,
        baseUrl,
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
        unsubscribeUrl,
      }) as ReactElement,
    },
    { idempotencyKey: `cart-reminder/${session.id}` }
  )
  if (sent.error) {
    console.error(`Cart reminder rejected: ${sent.error.message}`)
    return 'failed'
  }
  return 'sent'
}

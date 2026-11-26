import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { ReviewRequestEmail } from '@/emails/review-request'
import {
  createCampaignUnsubscribeToken,
  unsubscribeLinks,
} from '@/lib/newsletter/campaign-unsubscribe-token'
import { optedOut } from '@/lib/newsletter/opted-out'
import { getPayload } from '@/lib/payload'
import type { Order } from '@/types/payload-types'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ReviewRequestSummary {
  sent: number
  skipped: { unsubscribed: number }
  failed: number
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

export async function sendReviewRequests(now = new Date()): Promise<ReviewRequestSummary> {
  const payload = await getPayload()
  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { source: { in: ['stripe', 'paypal'] } },
        { status: { in: ['shipped', 'delivered'] } },
        { shipmentEmailSentAt: { greater_than_equal: new Date(now.getTime() - 11 * DAY_MS).toISOString() } },
        { shipmentEmailSentAt: { less_than: new Date(now.getTime() - 10 * DAY_MS).toISOString() } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  const summary: ReviewRequestSummary = { sent: 0, skipped: { unsubscribed: 0 }, failed: 0 }
  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] ?? '').trim().replace(/\/$/, '')
  const supportEmail = process.env['CONTACT_EMAIL'] ?? ''
  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')

  for (const order of orders as Order[]) {
    try {
      const email = order.customer.email.trim().toLowerCase()
      const {
        docs: [existing],
      } = await payload.find({
        collection: 'customers',
        where: { email: { equals: email } },
        limit: 1,
      })
      if (optedOut(existing)) {
        summary.skipped.unsubscribed += 1
        continue
      }
      const customer =
        existing ??
        (await payload.create({
          collection: 'customers',
          data: { email, name: order.customer.name, source: 'checkout', subscribedToNewsletter: false },
        }))
      const token = createCampaignUnsubscribeToken(customer.id, process.env['PAYLOAD_SECRET'] ?? '')
      const { unsubscribeUrl, headers: unsubscribeHeaders } = unsubscribeLinks(baseUrl, token)
      const result = await resend.emails.send(
        {
          from: process.env['EMAIL_FROM'] ?? '',
          to: email,
          replyTo: supportEmail || undefined,
          subject: 'How did your opal arrive?',
          headers: unsubscribeHeaders,
          react: ReviewRequestEmail({
            firstName: firstName(order.customer.name),
            orderNumber: order.orderNumber,
            pieces: order.items.map(({ name, slug }) => ({ name, slug })),
            baseUrl,
            supportEmail,
            unsubscribeUrl,
          }) as ReactElement,
        },
        { idempotencyKey: `review-request/${order.id}` }
      )
      if (result.error) throw new Error(result.error.message)
      summary.sent += 1
    } catch (error) {
      summary.failed += 1
      console.error(`Review request for order ${order.orderNumber} failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return summary
}

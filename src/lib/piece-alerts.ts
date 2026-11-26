import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { PieceAlertEmail, type PieceAlertLine } from '@/emails/piece-alert'
import { toCatalogProduct } from '@/lib/catalog'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import { createCampaignUnsubscribeToken } from '@/lib/newsletter/campaign-unsubscribe-token'
import { UNSUBSCRIBED_TAG } from '@/lib/newsletter/service'
import { ALERT_TAG_PREFIX } from '@/lib/newsletter/types'
import { getPayload } from '@/lib/payload'
import type { Where } from 'payload'
import type { Customer, Product } from '@/types/payload-types'

const MAX_SENDS = 200
const MAX_PIECES = 4
const DAY_MS = 24 * 60 * 60 * 1000

export interface PieceAlertSummary {
  piecesFound: number
  sent: number
  failed: number
}

interface Change {
  path?: string
  before?: unknown
  after?: unknown
}

function becameAvailable(changes: unknown): boolean {
  if (!Array.isArray(changes)) return false
  return (changes as Change[]).some(
    ({ path, before, after }) =>
      (path === 'status' && after === 'published' && before !== 'published') ||
      (path === 'stock' && typeof after === 'number' && after > 0 && !(typeof before === 'number' && before > 0))
  )
}

function available(extra: Where): Where {
  return { and: [LISTED_PRODUCTS, { stock: { greater_than: 0 } }, { category: { not_equals: 'custom-commissions' } }, extra] }
}

async function newlyAvailable(since: string): Promise<Product[]> {
  const payload = await getPayload()
  const [created, audits] = await Promise.all([
    payload.find({ collection: 'products', where: available({ createdAt: { greater_than: since } }), pagination: false, depth: 1 }),
    payload.find({
      collection: 'audit-events',
      where: {
        and: [
          { collectionSlug: { equals: 'products' } },
          { action: { equals: 'update' } },
          { occurredAt: { greater_than: since } },
        ],
      },
      pagination: false,
      depth: 0,
    }),
  ])
  const createdIds = new Set(created.docs.map((product) => String(product.id)))
  const updatedIds = [
    ...new Set(
      audits.docs
        .filter((event) => becameAvailable(event.changes) && event.documentId && !createdIds.has(event.documentId))
        .map((event) => event.documentId as string)
    ),
  ]
  const updated = updatedIds.length
    ? (await payload.find({ collection: 'products', where: available({ id: { in: updatedIds } }), pagination: false, depth: 1 })).docs
    : []
  return [...created.docs, ...updated].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function alertCategories(customer: Customer): Set<string> {
  const tags = (customer.tags ?? []).map(({ tag }) => tag ?? '')
  if (!customer.subscribedToNewsletter || !customer.emailVerified || tags.includes(UNSUBSCRIBED_TAG)) return new Set()
  return new Set(tags.filter((tag) => tag.startsWith(ALERT_TAG_PREFIX)).map((tag) => tag.slice(ALERT_TAG_PREFIX.length)))
}

function subjectFor(categoryLabel: string, count: number): string {
  const plural = categoryLabel.toLowerCase()
  return count > 1 ? `New ${plural} just came in` : `A new ${plural.replace(/s$/, '')} just came in`
}

export async function sendPieceAlerts(now = new Date()): Promise<PieceAlertSummary> {
  const pieces = await newlyAvailable(new Date(now.getTime() - DAY_MS).toISOString())
  const summary: PieceAlertSummary = { piecesFound: pieces.length, sent: 0, failed: 0 }
  if (pieces.length === 0) return summary

  const catalog = pieces.map((product) => toCatalogProduct(product, undefined, now))
  const categories = [...new Set(catalog.map((piece) => piece.category))]
  const payload = await getPayload()
  const { docs: customers } = await payload.find({
    collection: 'customers',
    where: {
      and: [
        { subscribedToNewsletter: { equals: true } },
        { emailVerified: { equals: true } },
        { 'tags.tag': { in: categories.map((category) => ALERT_TAG_PREFIX + category) } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] ?? '').trim().replace(/\/$/, '')
  const secret = process.env['PAYLOAD_SECRET'] ?? ''
  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')
  const day = now.toLocaleDateString('en-CA', { timeZone: DEFAULT_TIMEZONE })

  for (const customer of customers) {
    if (summary.sent + summary.failed >= MAX_SENDS) break
    const wanted = alertCategories(customer)
    const matches = catalog.filter((piece) => wanted.has(piece.category)).slice(0, MAX_PIECES)
    if (matches.length === 0) continue
    const lines: PieceAlertLine[] = matches.map((piece) => ({
      name: piece.name,
      slug: piece.slug,
      price: piece.price,
      image: piece.images[0],
    }))
    const subject = subjectFor(matches[0]!.categoryLabel, matches.length)
    const token = createCampaignUnsubscribeToken(customer.id, secret)
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
    try {
      const result = await resend.emails.send(
        {
          from: process.env['EMAIL_FROM'] ?? '',
          to: customer.email,
          replyTo: process.env['CONTACT_EMAIL'] || undefined,
          subject,
          headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
          react: PieceAlertEmail({
            heading: subject,
            pieces: lines,
            baseUrl,
            supportEmail: process.env['CONTACT_EMAIL'] ?? '',
            unsubscribeUrl,
          }) as ReactElement,
        },
        { idempotencyKey: `piece-alert/${customer.id}/${day}` }
      )
      if (result.error) throw new Error(result.error.message)
      summary.sent += 1
    } catch (error) {
      console.error(`Piece alert to customer ${customer.id} failed: ${error instanceof Error ? error.message : error}`)
      summary.failed += 1
    }
  }
  return summary
}

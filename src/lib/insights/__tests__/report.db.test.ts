import { sql } from '@payloadcms/db-postgres'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { getInsightsReport, vitalRating, type InsightsReport } from '../report'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

const databaseUrl = process.env.DATABASE_URL
const NOW = new Date('2099-06-01T00:00:00Z')

interface Seed {
  name: string
  visitor?: string
  path?: string
  productId?: string
  value?: number
  device?: string
  detail?: Record<string, unknown>
}

const seeds: Seed[] = [
  ...['v1', 'v2', 'v3', 'v4'].map((visitor) => ({
    name: 'page_view',
    visitor,
    device: visitor === 'v1' ? 'desktop' : 'mobile',
  })),
  ...['v1', 'v2', 'v3'].map((visitor) => ({ name: 'product_view', visitor, productId: '990001' })),
  { name: 'product_view', visitor: 'v1', productId: '990002' },
  ...['v1', 'v2'].map((visitor) => ({ name: 'add_to_cart', visitor, productId: '990001' })),
  { name: 'begin_checkout', visitor: 'v1' },
  { name: 'purchase', visitor: 'v1', value: 120 },
  ...[1000, 2000, 3000, 4000].map((value) => ({
    name: 'web_vital',
    path: '/store',
    value,
    detail: { metric: 'LCP', rating: 'good' },
  })),
  ...[100, 300].map((value) => ({ name: 'web_vital', path: '/store', value, detail: { metric: 'INP', rating: 'good' } })),
  ...[
    { seconds: 10, scroll: 50, sawPrice: true },
    { seconds: 20, scroll: 100, sawPrice: false },
    { seconds: 30, scroll: 100, sawPrice: true },
  ].map((detail) => ({ name: 'engagement', path: '/store/opal-ring', detail })),
  { name: 'checkout_feedback', detail: { reason: 'shipping_cost', source: 'cancelled' } },
  { name: 'checkout_feedback', detail: { reason: 'shipping_cost', source: 'cart' } },
  { name: 'checkout_feedback', detail: { reason: 'just_looking', source: 'cart', note: 'Saving up' } },
  { name: 'store_filter', path: '/store', detail: { stone: 'black', results: 0 } },
  { name: 'server_error', detail: { kind: 'render', message: 'Boom' } },
]

async function reportFor(rows: Seed[]): Promise<InsightsReport> {
  const db = drizzle(databaseUrl ?? '')
  const rollback = new Error('rollback')
  let report: InsightsReport | undefined
  try {
    await db.transaction(async (tx) => {
      for (const [index, row] of rows.entries()) {
        const occurredAt = new Date(NOW.getTime() - (rows.length - index) * 60_000).toISOString()
        await tx.execute(sql`
          INSERT INTO insight_events (name, occurred_at, path, product_id, value, visitor, device, detail)
          VALUES (
            ${row.name}, ${occurredAt}::timestamptz, ${row.path ?? '/'}, ${row.productId ?? null},
            ${row.value ?? null}, ${row.visitor ?? null}, ${row.device ?? null},
            ${row.detail ? JSON.stringify(row.detail) : null}::jsonb
          )
        `)
      }
      report = await getInsightsReport({ db: { drizzle: tx } } as unknown as Payload, 7, NOW)
      throw rollback
    })
  } catch (error) {
    if (error !== rollback) throw error
  } finally {
    await db.$client.end()
  }
  if (!report) throw new Error('Report was not built')
  return report
}

describe('vitalRating', () => {
  it('rates page speed on the published Core Web Vitals thresholds', () => {
    expect(vitalRating('LCP', 2500)).toBe('good')
    expect(vitalRating('LCP', 2501)).toBe('needs-improvement')
    expect(vitalRating('INP', 501)).toBe('poor')
    expect(vitalRating('CLS', 0.1)).toBe('good')
    expect(vitalRating('TTFB', 1800)).toBe('needs-improvement')
  })
})

describe.skipIf(!databaseUrl)('getInsightsReport against Postgres', () => {
  it('explains where buyers drop off from stored events', async () => {
    const report = await reportFor(seeds)

    expect(report.funnel.map((step) => [step.visitors, Number(step.dropOff.toFixed(3))])).toEqual([
      [4, 0],
      [3, 0.25],
      [2, 0.333],
      [1, 0.5],
      [1, 0],
    ])
    expect(report.unCarted.map((row) => [row.product_id, row.views])).toEqual([['990002', 1]])
    expect(report.devices).toEqual([
      { label: 'mobile', visitors: 3, buyers: 0 },
      { label: 'desktop', visitors: 1, buyers: 1 },
    ])
    expect(report.feedback.reasons).toEqual([
      { reason: 'shipping_cost', answers: 2 },
      { reason: 'just_looking', answers: 1 },
    ])
    expect(report.feedback.notes).toMatchObject([{ reason: 'just_looking', note: 'Saving up' }])
    expect(report.zeroResultFilters).toEqual([{ filters: { stone: 'black' }, uses: 1 }])
    expect(report.filters).toEqual([{ filter: 'stone', value: 'black', uses: 1 }])
    expect(report.errors).toMatchObject([{ kind: 'server_error', source: 'render', message: 'Boom', occurrences: 1 }])
  })

  it('reports the 75th percentile page speed and median attention per page', async () => {
    const report = await reportFor(seeds)

    expect(report.vitals).toMatchObject([{ path: '/store', samples: 4, lcp: 3250, inp: 250, cls: null, ttfb: null }])
    expect(report.engagement).toHaveLength(1)
    expect(report.engagement[0]).toMatchObject({
      path: '/store/opal-ring',
      views: 3,
      median_seconds: 20,
      median_scroll: 100,
      saw_details: null,
    })
    expect(report.engagement[0]?.saw_price).toBeCloseTo(2 / 3)
  })
})

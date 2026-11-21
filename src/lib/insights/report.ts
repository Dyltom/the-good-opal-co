import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { z } from 'zod'
import { getPayload } from '@/lib/payload'
import { INSIGHTS_RETENTION_DAYS, type WebVitalMetric } from './events'
import { buildFunnel, ratio } from './funnel'

const VITAL_LIMITS: Record<WebVitalMetric, [good: number, poor: number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
}

export type VitalRating = 'good' | 'needs-improvement' | 'poor'

export function vitalRating(metric: WebVitalMetric, value: number): VitalRating {
  const [good, poor] = VITAL_LIMITS[metric]
  if (value <= good) return 'good'
  return value > poor ? 'poor' : 'needs-improvement'
}

export const INSIGHT_RANGES = [7, 30, 90] as const
export type InsightRange = (typeof INSIGHT_RANGES)[number]

export function parseInsightRange(value: unknown): InsightRange {
  const days = Number(Array.isArray(value) ? value[0] : value)
  return INSIGHT_RANGES.find((range) => range === days) ?? 30
}

const count = z.coerce.number().int().nonnegative()
const amount = z.coerce.number().nonnegative()
const SERVER_EVENTS = sql`('purchase', 'checkout_abandoned', 'server_error')`

async function query<T extends z.ZodTypeAny>(
  payload: Payload,
  schema: T,
  statement: ReturnType<typeof sql>
): Promise<z.infer<T>[]> {
  const result = await (payload.db as unknown as PostgresAdapter).drizzle.execute(statement)
  return z.array(schema).parse(result.rows)
}

const summaryRow = z.object({
  visitors: count,
  sessions: count,
  page_views: count,
  product_views: count,
  carts: count,
  checkouts: count,
  purchases: count,
  orders: count,
  revenue: amount,
})

const labelRow = z.object({ label: z.string(), visitors: count })
const sourceRow = labelRow.extend({ buyers: count })
const campaignRow = z.object({
  source: z.string(),
  medium: z.string(),
  campaign: z.string(),
  visitors: count,
})
const productRow = z.object({
  product_id: z.string(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  views: count,
  carts: count,
  bought: count,
})
const searchRow = z.object({ term: z.string(), searches: count, zero_results: count })
const filterRow = z.object({ filter: z.string(), value: z.string(), uses: count })
const actionRow = z.object({ name: z.string(), events: count, visitors: count })
const abandonedRow = z.object({
  occurred_at: z.coerce.date(),
  value: amount.nullable(),
  detail: z
    .object({
      email: z.string().optional(),
      items: z
        .array(
          z.object({
            name: z.string(),
            quantity: count,
            amount: amount,
          })
        )
        .default([]),
    })
    .nullable(),
})
const unCartedRow = z.object({
  product_id: z.string(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  views: count,
})
const reasonRow = z.object({ reason: z.string(), answers: count })
const noteRow = z.object({ occurred_at: z.coerce.date(), reason: z.string(), note: z.string() })
const zeroFilterRow = z.object({
  filters: z.record(z.string(), z.unknown()),
  uses: count,
})
const nullableNumber = z.coerce.number().nullable()
const vitalsRow = z.object({
  path: z.string(),
  samples: count,
  lcp: nullableNumber,
  inp: nullableNumber,
  cls: nullableNumber,
  ttfb: nullableNumber,
})
const engagementRow = z.object({
  path: z.string(),
  views: count,
  median_seconds: z.coerce.number(),
  median_scroll: z.coerce.number(),
  saw_price: nullableNumber,
  saw_details: nullableNumber,
})
const rageRow = z.object({
  path: z.string(),
  target: z.string(),
  occurrences: count,
  visitors: count,
  last_seen: z.coerce.date(),
})
const errorRow = z.object({
  kind: z.string(),
  source: z.string().nullable(),
  message: z.string(),
  path: z.string(),
  occurrences: count,
  last_seen: z.coerce.date(),
})

export async function getInsightsReport(payload: Payload, days: InsightRange, now = new Date()) {
  const since = new Date(now.getTime() - days * 86_400_000).toISOString()
  const inRange = sql`occurred_at >= ${since}::timestamptz`

  const [
    summary,
    sources,
    campaigns,
    countries,
    devices,
    products,
    searches,
    filters,
    actions,
    abandoned,
    errors,
    unCarted,
    reasons,
    notes,
    zeroResultFilters,
    vitals,
    engagement,
    rageClicks,
  ] = await Promise.all([
      query(
        payload,
        summaryRow,
        sql`
          WITH events AS (
            SELECT * FROM insight_events WHERE ${inRange}
          ),
          gaps AS (
            SELECT occurred_at - lag(occurred_at) OVER (PARTITION BY visitor ORDER BY occurred_at) AS gap
            FROM events
            WHERE visitor IS NOT NULL AND name NOT IN ${SERVER_EVENTS}
          )
          SELECT
            count(DISTINCT visitor) FILTER (WHERE name NOT IN ${SERVER_EVENTS}) AS visitors,
            (SELECT count(*) FROM gaps WHERE gap IS NULL OR gap > interval '30 minutes') AS sessions,
            count(*) FILTER (WHERE name = 'page_view') AS page_views,
            count(DISTINCT visitor) FILTER (WHERE name = 'product_view') AS product_views,
            count(DISTINCT visitor) FILTER (WHERE name = 'add_to_cart') AS carts,
            count(DISTINCT visitor) FILTER (WHERE name = 'begin_checkout') AS checkouts,
            count(DISTINCT coalesce(visitor, dedupe_key)) FILTER (WHERE name = 'purchase') AS purchases,
            count(*) FILTER (WHERE name = 'purchase') AS orders,
            coalesce(sum(value) FILTER (WHERE name = 'purchase'), 0) AS revenue
          FROM events
        `
      ),
      query(
        payload,
        sourceRow,
        sql`
          WITH firsts AS (
            SELECT DISTINCT ON (visitor) visitor, coalesce(utm_source, referrer_host, 'Direct or unknown') AS label
            FROM insight_events
            WHERE ${inRange} AND visitor IS NOT NULL AND name NOT IN ${SERVER_EVENTS}
            ORDER BY visitor, occurred_at
          ),
          buyers AS (
            SELECT DISTINCT visitor FROM insight_events
            WHERE ${inRange} AND name = 'purchase' AND visitor IS NOT NULL
          )
          SELECT firsts.label, count(*) AS visitors, count(buyers.visitor) AS buyers
          FROM firsts LEFT JOIN buyers ON buyers.visitor = firsts.visitor
          GROUP BY firsts.label
          ORDER BY visitors DESC, firsts.label
          LIMIT 10
        `
      ),
      query(
        payload,
        campaignRow,
        sql`
          SELECT
            coalesce(utm_source, '') AS source,
            coalesce(utm_medium, '') AS medium,
            coalesce(utm_campaign, '') AS campaign,
            count(DISTINCT visitor) AS visitors
          FROM insight_events
          WHERE ${inRange} AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
          GROUP BY 1, 2, 3
          ORDER BY visitors DESC
          LIMIT 10
        `
      ),
      query(
        payload,
        labelRow,
        sql`
          SELECT coalesce(country, 'Unknown') AS label, count(DISTINCT visitor) AS visitors
          FROM insight_events
          WHERE ${inRange} AND name NOT IN ${SERVER_EVENTS}
          GROUP BY 1
          ORDER BY visitors DESC, label
          LIMIT 10
        `
      ),
      query(
        payload,
        sourceRow,
        sql`
          WITH firsts AS (
            SELECT DISTINCT ON (visitor) visitor, coalesce(device, 'Unknown') AS label
            FROM insight_events
            WHERE ${inRange} AND visitor IS NOT NULL AND name NOT IN ${SERVER_EVENTS}
            ORDER BY visitor, occurred_at
          ),
          buyers AS (
            SELECT DISTINCT visitor FROM insight_events
            WHERE ${inRange} AND name = 'purchase' AND visitor IS NOT NULL
          )
          SELECT firsts.label, count(*) AS visitors, count(buyers.visitor) AS buyers
          FROM firsts LEFT JOIN buyers ON buyers.visitor = firsts.visitor
          GROUP BY firsts.label
          ORDER BY visitors DESC, firsts.label
        `
      ),
      query(
        payload,
        productRow,
        sql`
          WITH viewed AS (
            SELECT product_id, count(DISTINCT visitor) AS views
            FROM insight_events
            WHERE ${inRange} AND name = 'product_view' AND product_id IS NOT NULL
            GROUP BY product_id
          ),
          carted AS (
            SELECT product_id, count(DISTINCT visitor) AS carts
            FROM insight_events
            WHERE ${inRange} AND name = 'add_to_cart' AND product_id IS NOT NULL
            GROUP BY product_id
          ),
          bought AS (
            SELECT item ->> 'productId' AS product_id, max(item ->> 'name') AS item_name, sum((item ->> 'quantity')::numeric) AS units
            FROM insight_events
            CROSS JOIN LATERAL jsonb_array_elements(
              CASE WHEN jsonb_typeof(detail -> 'items') = 'array' THEN detail -> 'items' ELSE '[]'::jsonb END
            ) AS item
            WHERE ${inRange} AND name = 'purchase' AND item ->> 'productId' IS NOT NULL
            GROUP BY 1
          )
          SELECT
            product_id,
            coalesce(products.name, bought.item_name) AS name,
            products.slug,
            coalesce(views, 0) AS views,
            coalesce(carts, 0) AS carts,
            coalesce(bought.units, 0) AS bought
          FROM viewed
          FULL JOIN carted USING (product_id)
          FULL JOIN bought USING (product_id)
          LEFT JOIN products ON products.id::text = product_id
          ORDER BY views DESC, carts DESC, bought DESC
          LIMIT 15
        `
      ),
      query(
        payload,
        searchRow,
        sql`
          SELECT
            detail ->> 'term' AS term,
            count(*) AS searches,
            count(*) FILTER (WHERE detail ->> 'results' = '0') AS zero_results
          FROM insight_events
          WHERE ${inRange} AND name = 'search' AND detail ->> 'term' <> ''
          GROUP BY 1
          ORDER BY zero_results DESC, searches DESC
          LIMIT 50
        `
      ),
      query(
        payload,
        filterRow,
        sql`
          SELECT field.key AS filter, choice.value, count(*) AS uses
          FROM insight_events
          CROSS JOIN LATERAL jsonb_each_text(
            CASE WHEN jsonb_typeof(detail) = 'object' THEN detail ELSE '{}'::jsonb END
          ) AS field
          CROSS JOIN LATERAL unnest(string_to_array(field.value, ',')) AS choice(value)
          WHERE ${inRange} AND name = 'store_filter' AND field.key <> 'results'
          GROUP BY 1, 2
          ORDER BY uses DESC, filter, value
          LIMIT 15
        `
      ),
      query(
        payload,
        actionRow,
        sql`
          SELECT name, count(*) AS events, count(DISTINCT coalesce(visitor, dedupe_key)) AS visitors
          FROM insight_events
          WHERE ${inRange}
          GROUP BY name
        `
      ),
      query(
        payload,
        abandonedRow,
        sql`
          SELECT occurred_at, value, detail
          FROM insight_events
          WHERE ${inRange} AND name = 'checkout_abandoned'
          ORDER BY occurred_at DESC
          LIMIT 25
        `
      ),
      query(
        payload,
        errorRow,
        sql`
          SELECT
            name AS kind,
            detail ->> 'kind' AS source,
            coalesce(detail ->> 'message', 'No message') AS message,
            path,
            count(*) AS occurrences,
            max(occurred_at) AS last_seen
          FROM insight_events
          WHERE ${inRange} AND name IN ('js_error', 'checkout_error', 'server_error')
          GROUP BY 1, 2, 3, 4
          ORDER BY last_seen DESC
          LIMIT 25
        `
      ),
      query(
        payload,
        unCartedRow,
        sql`
          SELECT viewed.product_id, products.name, products.slug, count(DISTINCT viewed.visitor) AS views
          FROM insight_events AS viewed
          LEFT JOIN products ON products.id::text = viewed.product_id
          WHERE ${inRange} AND viewed.name = 'product_view' AND viewed.product_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM insight_events AS carted
              WHERE carted.name = 'add_to_cart'
                AND carted.product_id = viewed.product_id
                AND carted.occurred_at >= ${since}::timestamptz
            )
          GROUP BY 1, 2, 3
          ORDER BY views DESC, viewed.product_id
          LIMIT 10
        `
      ),
      query(
        payload,
        reasonRow,
        sql`
          SELECT detail ->> 'reason' AS reason, count(*) AS answers
          FROM insight_events
          WHERE ${inRange} AND name = 'checkout_feedback' AND detail ->> 'reason' IS NOT NULL
          GROUP BY 1
          ORDER BY answers DESC, reason
        `
      ),
      query(
        payload,
        noteRow,
        sql`
          SELECT occurred_at, detail ->> 'reason' AS reason, detail ->> 'note' AS note
          FROM insight_events
          WHERE ${inRange} AND name = 'checkout_feedback' AND coalesce(detail ->> 'note', '') <> ''
          ORDER BY occurred_at DESC
          LIMIT 15
        `
      ),
      query(
        payload,
        zeroFilterRow,
        sql`
          SELECT detail - 'results' AS filters, count(*) AS uses
          FROM insight_events
          WHERE ${inRange} AND name = 'store_filter' AND jsonb_typeof(detail) = 'object'
            AND detail ->> 'results' = '0'
          GROUP BY 1
          ORDER BY uses DESC
          LIMIT 10
        `
      ),
      query(
        payload,
        vitalsRow,
        sql`
          SELECT
            path,
            count(*) FILTER (WHERE detail ->> 'metric' = 'LCP') AS samples,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY value) FILTER (WHERE detail ->> 'metric' = 'LCP') AS lcp,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY value) FILTER (WHERE detail ->> 'metric' = 'INP') AS inp,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY value) FILTER (WHERE detail ->> 'metric' = 'CLS') AS cls,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY value) FILTER (WHERE detail ->> 'metric' = 'TTFB') AS ttfb
          FROM insight_events
          WHERE ${inRange} AND name = 'web_vital' AND value IS NOT NULL
          GROUP BY path
          ORDER BY lcp DESC NULLS LAST, inp DESC NULLS LAST, path
          LIMIT 10
        `
      ),
      query(
        payload,
        engagementRow,
        sql`
          SELECT
            path,
            count(*) AS views,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY (detail ->> 'seconds')::numeric) AS median_seconds,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY (detail ->> 'scroll')::numeric) AS median_scroll,
            avg((detail ->> 'sawPrice')::boolean::int) AS saw_price,
            avg((detail ->> 'sawDetails')::boolean::int) AS saw_details
          FROM insight_events
          WHERE ${inRange} AND name = 'engagement'
          GROUP BY path
          ORDER BY views DESC, path
          LIMIT 15
        `
      ),
      query(
        payload,
        rageRow,
        sql`
          SELECT
            path,
            coalesce(detail ->> 'target', 'Unknown') AS target,
            count(*) AS occurrences,
            count(DISTINCT visitor) AS visitors,
            max(occurred_at) AS last_seen
          FROM insight_events
          WHERE ${inRange} AND name = 'rage_click'
          GROUP BY 1, 2
          ORDER BY occurrences DESC, last_seen DESC
          LIMIT 15
        `
      ),
    ])

  const totals = summary[0] ?? {
    visitors: 0,
    sessions: 0,
    page_views: 0,
    product_views: 0,
    carts: 0,
    checkouts: 0,
    purchases: 0,
    orders: 0,
    revenue: 0,
  }
  return {
    days,
    since: new Date(since),
    totals,
    conversionRate: ratio(totals.purchases, totals.visitors),
    funnel: buildFunnel({
      visitors: totals.visitors,
      productViews: totals.product_views,
      carts: totals.carts,
      checkouts: totals.checkouts,
      purchases: totals.purchases,
    }),
    sources,
    campaigns,
    countries,
    devices,
    products,
    zeroResultSearches: searches.filter((row) => row.zero_results > 0).slice(0, 15),
    topSearches: [...searches].sort((a, b) => b.searches - a.searches).slice(0, 15),
    filters,
    actions: Object.fromEntries(actions.map((row) => [row.name, row])),
    abandoned,
    errors,
    unCarted,
    feedback: { reasons, notes },
    zeroResultFilters,
    vitals,
    engagement,
    rageClicks,
  }
}

export type InsightsReport = Awaited<ReturnType<typeof getInsightsReport>>

export async function pruneInsightEvents(now = new Date()): Promise<number> {
  const payload = await getPayload()
  const cutoff = new Date(now.getTime() - INSIGHTS_RETENTION_DAYS * 86_400_000).toISOString()
  const [row] = await query(
    payload,
    z.object({ deleted: count }),
    sql`
      WITH removed AS (
        DELETE FROM insight_events WHERE occurred_at < ${cutoff}::timestamptz RETURNING 1
      )
      SELECT count(*) AS deleted FROM removed
    `
  )
  return row?.deleted ?? 0
}

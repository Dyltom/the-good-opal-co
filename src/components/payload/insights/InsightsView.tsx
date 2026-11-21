import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import { CHECKOUT_FEEDBACK_REASONS, type WebVitalMetric } from '@/lib/insights/events'
import { ratio } from '@/lib/insights/funnel'
import {
  INSIGHT_RANGES,
  getInsightsReport,
  parseInsightRange,
  vitalRating,
  type InsightsReport,
} from '@/lib/insights/report'
import styles from './InsightsView.module.css'

const numberFormat = new Intl.NumberFormat('en-AU')
const percentFormat = new Intl.NumberFormat('en-AU', { style: 'percent', maximumFractionDigits: 1 })
const moneyFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })

const ACTION_LABELS: [string, string][] = [
  ['enquiry_submitted', 'Enquiries sent'],
  ['newsletter_signup', 'Newsletter sign-ups'],
  ['gallery_fullscreen', 'Photos opened full screen'],
  ['gallery_zoom', 'Photos zoomed in'],
  ['remove_from_cart', 'Removed from cart'],
  ['checkout_error', 'Checkout errors shown'],
  ['checkout_abandoned', 'Checkouts left unpaid'],
]

const ERROR_SOURCES: Record<string, string> = {
  js_error: 'Browser',
  checkout_error: 'Checkout message',
  render: 'Server page',
  route: 'Server API',
  action: 'Server action',
  proxy: 'Server proxy',
  checkout: 'Checkout setup',
  stripe_webhook: 'Stripe webhook',
}

const RATING_LABELS = {
  good: 'good',
  'needs-improvement': 'needs work',
  poor: 'poor',
} as const

function formatReason(reason: string): string {
  return reason in CHECKOUT_FEEDBACK_REASONS
    ? CHECKOUT_FEEDBACK_REASONS[reason as keyof typeof CHECKOUT_FEEDBACK_REASONS]
    : reason
}

function formatVital(metric: WebVitalMetric, value: number | null): string {
  if (value === null) return '—'
  const shown =
    metric === 'CLS'
      ? value.toFixed(2)
      : metric === 'INP'
        ? `${Math.round(value)} ms`
        : `${(value / 1000).toFixed(1)} s`
  return `${shown} (${RATING_LABELS[vitalRating(metric, value)]})`
}

function formatSeconds(seconds: number): string {
  const rounded = Math.round(seconds)
  if (rounded < 60) return `${rounded} s`
  return `${Math.floor(rounded / 60)} min ${rounded % 60} s`
}

function formatShare(value: number | null): string {
  return value === null ? '—' : percentFormat.format(value)
}

function formatDevice(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function PieceName({ row }: { row: { product_id: string; name: string | null; slug: string | null } }) {
  return row.slug ? (
    <Link href={`/store/${row.slug}`} target="_blank" rel="noreferrer">
      {row.name ?? `Product ${row.product_id}`}
    </Link>
  ) : (
    <>{row.name ?? `Product ${row.product_id} (removed)`}</>
  )
}

function formatWhen(date: Date): string {
  return date.toLocaleString('en-AU', {
    timeZone: DEFAULT_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

interface Column<T> {
  label: string
  numeric?: boolean
  cell: (row: T) => ReactNode
}

function DataTable<T>({
  title,
  note,
  empty,
  columns,
  rows,
}: {
  title: string
  note?: string
  empty: string
  columns: Column<T>[]
  rows: T[]
}) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {note ? <p className={styles.note}>{note}</p> : null}
      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.label} scope="col" className={column.numeric ? styles.numeric : undefined}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.label} className={column.numeric ? styles.numeric : undefined}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value}</dd>
      {hint ? <dd className={styles.statHint}>{hint}</dd> : null}
    </div>
  )
}

function Funnel({ report }: { report: InsightsReport }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>Path to purchase</h3>
      <p className={styles.note}>
        Visitors who reached each step at least once in this period. The drop at each step is
        measured against the step before it.
      </p>
      <ol className={styles.funnel}>
        {report.funnel.map((step, index) => (
          <li
            key={step.label}
            className={styles.funnelStep}
            title={`${step.label}: ${numberFormat.format(step.visitors)} visitors`}
          >
            <span className={styles.funnelLabel}>{step.label}</span>
            <span className={styles.funnelTrack} aria-hidden="true">
              <span
                className={styles.funnelBar}
                style={{ width: `${Math.max(step.shareOfStart * 100, step.visitors > 0 ? 0.5 : 0)}%` }}
              />
            </span>
            <span className={styles.funnelCount}>{numberFormat.format(step.visitors)}</span>
            <span className={styles.funnelMeta}>
              {index === 0
                ? 'Everyone counted'
                : `${percentFormat.format(step.shareOfStart)} of visitors, ${percentFormat.format(step.dropOff)} lost here`}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function WhyNotBuying({ report }: { report: InsightsReport }) {
  const [, , carted, checkedOut, paid] = report.funnel
  const answers = report.feedback.reasons.reduce((sum, row) => sum + row.answers, 0)
  const stepLoss = (from: number | undefined, lost: number | undefined) =>
    from && lost !== undefined ? percentFormat.format(lost) : '—'

  return (
    <>
      <h2 className={styles.sectionTitle}>Why people aren&apos;t buying</h2>
      <dl className={styles.stats}>
        <Stat
          label="Carts not taken to checkout"
          value={stepLoss(carted?.visitors, checkedOut?.dropOff)}
          hint="Visitors who added a piece but never started checkout"
        />
        <Stat
          label="Checkouts not paid"
          value={stepLoss(checkedOut?.visitors, paid?.dropOff)}
          hint="Visitors who started checkout but did not pay"
        />
        <Stat
          label="Stripe checkouts expired"
          value={numberFormat.format(report.actions['checkout_abandoned']?.events ?? 0)}
          hint="Listed under Follow up"
        />
        <Stat label="Feedback answers" value={numberFormat.format(answers)} hint="From the cart page" />
      </dl>
      <div className={styles.grid}>
        <DataTable
          title="What held them back"
          note="Answers to the short question on the cart page, asked after a guest leaves Stripe checkout or taps “Not ready yet?”."
          empty="No one has answered yet in this period."
          rows={report.feedback.reasons}
          columns={[
            { label: 'Reason', cell: (row) => formatReason(row.reason) },
            { label: 'Answers', numeric: true, cell: (row) => numberFormat.format(row.answers) },
            { label: 'Share', numeric: true, cell: (row) => percentFormat.format(ratio(row.answers, answers)) },
          ]}
        />
        <DataTable
          title="In their words"
          note="The optional note guests added, newest first."
          empty="No notes in this period."
          rows={report.feedback.notes}
          columns={[
            { label: 'When', cell: (row) => formatWhen(row.occurred_at) },
            { label: 'Reason', cell: (row) => formatReason(row.reason) },
            { label: 'Note', cell: (row) => <span className={styles.message}>{row.note}</span> },
          ]}
        />
        <DataTable
          title="Looked at, never carted"
          note="Pieces viewed in this period that nobody added to their cart. Check the photos, price and description."
          empty="Every viewed piece was carted at least once."
          rows={report.unCarted}
          columns={[
            { label: 'Piece', cell: (row) => <PieceName row={row} /> },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.views) },
          ]}
        />
        <DataTable
          title="Conversion by device"
          note="Device each visitor first used, and how many of them paid."
          empty="No visits in this period yet."
          rows={report.devices}
          columns={[
            { label: 'Device', cell: (row) => formatDevice(row.label) },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
            { label: 'Paid', numeric: true, cell: (row) => numberFormat.format(row.buyers) },
            {
              label: 'Conversion',
              numeric: true,
              cell: (row) => percentFormat.format(ratio(row.buyers, row.visitors)),
            },
          ]}
        />
        <DataTable
          title="Searches with no results"
          note="What guests looked for and could not find. Useful for naming and stock."
          empty="Every search in this period found something."
          rows={report.zeroResultSearches}
          columns={[
            { label: 'Search', cell: (row) => row.term },
            { label: 'Times empty', numeric: true, cell: (row) => numberFormat.format(row.zero_results) },
          ]}
        />
        <DataTable
          title="Filters with no results"
          note="Store filter combinations that showed an empty page."
          empty="Every filter used in this period found something."
          rows={report.zeroResultFilters}
          columns={[
            {
              label: 'Filters',
              cell: (row) =>
                Object.entries(row.filters)
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(', '),
            },
            { label: 'Times', numeric: true, cell: (row) => numberFormat.format(row.uses) },
          ]}
        />
      </div>
      <DataTable
        title="Slowest pages"
        note="Page speed measured in guests' browsers, at the 75th percentile, for the page they first opened. Google treats LCP under 2.5 s, INP under 200 ms and CLS under 0.1 as good."
        empty="No page speed readings in this period yet."
        rows={report.vitals}
        columns={[
          { label: 'Page', cell: (row) => row.path },
          { label: 'Loads', numeric: true, cell: (row) => numberFormat.format(row.samples) },
          { label: 'Largest paint (LCP)', numeric: true, cell: (row) => formatVital('LCP', row.lcp) },
          { label: 'Response to taps (INP)', numeric: true, cell: (row) => formatVital('INP', row.inp) },
          { label: 'Layout shift (CLS)', numeric: true, cell: (row) => formatVital('CLS', row.cls) },
          { label: 'Server reply (TTFB)', numeric: true, cell: (row) => formatVital('TTFB', row.ttfb) },
        ]}
      />
      <DataTable
        title="Attention by page"
        note="Median time guests actively spent on each page and how far down they scrolled. On piece pages, the share who reached the price and the details."
        empty="No page visits measured in this period yet."
        rows={report.engagement}
        columns={[
          { label: 'Page', cell: (row) => row.path },
          { label: 'Views', numeric: true, cell: (row) => numberFormat.format(row.views) },
          { label: 'Engaged time', numeric: true, cell: (row) => formatSeconds(row.median_seconds) },
          { label: 'Scrolled', numeric: true, cell: (row) => `${Math.round(row.median_scroll)}%` },
          { label: 'Saw price', numeric: true, cell: (row) => formatShare(row.saw_price) },
          { label: 'Saw details', numeric: true, cell: (row) => formatShare(row.saw_details) },
        ]}
      />
      <DataTable
        title="Frustrated clicks"
        note="Three or more quick clicks in the same spot, often on something that looks clickable but is not, or is slow to respond."
        empty="No frustrated clicks in this period."
        rows={report.rageClicks}
        columns={[
          { label: 'Page', cell: (row) => row.path },
          { label: 'Clicked on', cell: (row) => <span className={styles.message}>{row.target}</span> },
          { label: 'Times', numeric: true, cell: (row) => numberFormat.format(row.occurrences) },
          { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
        ]}
      />
      <DataTable
        title="Errors"
        note="Errors guests hit in their browser, at checkout or on the server, grouped by where they happened and the message."
        empty="No errors were reported in this period."
        rows={report.errors}
        columns={[
          { label: 'Last seen', cell: (row) => formatWhen(row.last_seen) },
          { label: 'Kind', cell: (row) => ERROR_SOURCES[row.source ?? row.kind] ?? ERROR_SOURCES[row.kind] ?? row.kind },
          { label: 'Page', cell: (row) => row.path },
          { label: 'Message', cell: (row) => <span className={styles.message}>{row.message}</span> },
          { label: 'Times', numeric: true, cell: (row) => numberFormat.format(row.occurrences) },
        ]}
      />
    </>
  )
}

function Report({ report }: { report: InsightsReport }) {
  const { totals } = report
  const actionRows = ACTION_LABELS.map(([name, label]) => ({
    label,
    events: report.actions[name]?.events ?? 0,
    visitors: report.actions[name]?.visitors ?? 0,
  }))

  return (
    <>
      <dl className={styles.stats}>
        <Stat label="Visitors" value={numberFormat.format(totals.visitors)} />
        <Stat label="Visits" value={numberFormat.format(totals.sessions)} hint="A new visit starts after 30 quiet minutes" />
        <Stat label="Pages viewed" value={numberFormat.format(totals.page_views)} />
        <Stat
          label="Conversion"
          value={percentFormat.format(report.conversionRate)}
          hint="Visitors who went on to pay"
        />
        <Stat label="Paid orders" value={numberFormat.format(totals.orders)} />
        <Stat label="Order value" value={moneyFormat.format(totals.revenue)} hint="Including shipping" />
      </dl>

      <Funnel report={report} />

      <WhyNotBuying report={report} />

      <h2 className={styles.sectionTitle}>Where guests come from</h2>
      <div className={styles.grid}>
        <DataTable
          title="Sources"
          note="How each visitor first arrived: the campaign tag if the link had one, otherwise the site that linked here."
          empty="No visits in this period yet."
          rows={report.sources}
          columns={[
            { label: 'Source', cell: (row) => row.label },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
            { label: 'Paid', numeric: true, cell: (row) => numberFormat.format(row.buyers) },
            {
              label: 'Conversion',
              numeric: true,
              cell: (row) => percentFormat.format(ratio(row.buyers, row.visitors)),
            },
          ]}
        />
        <DataTable
          title="Campaign links"
          note="Visits from links tagged with utm_source, utm_medium or utm_campaign."
          empty="No tagged campaign links were used in this period."
          rows={report.campaigns}
          columns={[
            { label: 'Source', cell: (row) => row.source || 'None' },
            { label: 'Medium', cell: (row) => row.medium || 'None' },
            { label: 'Campaign', cell: (row) => row.campaign || 'None' },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
          ]}
        />
        <DataTable
          title="Countries"
          note="From the hosting network's country lookup. Unknown when the host does not supply one."
          empty="No visits in this period yet."
          rows={report.countries}
          columns={[
            { label: 'Country', cell: (row) => row.label },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
          ]}
        />
      </div>

      <h2 className={styles.sectionTitle}>Pieces</h2>
      <DataTable
        title="Viewed, carted and bought"
        note="Viewed and carted count visitors. Bought counts units on paid orders."
        empty="No pieces were viewed, carted or bought in this period."
        rows={report.products}
        columns={[
          {
            label: 'Piece',
            cell: (row) => <PieceName row={row} />,
          },
          { label: 'Viewed', numeric: true, cell: (row) => numberFormat.format(row.views) },
          { label: 'Carted', numeric: true, cell: (row) => numberFormat.format(row.carts) },
          { label: 'Bought', numeric: true, cell: (row) => numberFormat.format(row.bought) },
        ]}
      />

      <h2 className={styles.sectionTitle}>Searching and browsing</h2>
      <div className={styles.grid}>
        <DataTable
          title="Top searches"
          empty="No searches in this period yet."
          rows={report.topSearches}
          columns={[
            { label: 'Search', cell: (row) => row.term },
            { label: 'Searches', numeric: true, cell: (row) => numberFormat.format(row.searches) },
          ]}
        />
        <DataTable
          title="Store filters used"
          empty="No store filters were used in this period."
          rows={report.filters}
          columns={[
            { label: 'Filter', cell: (row) => row.filter },
            { label: 'Choice', cell: (row) => row.value },
            { label: 'Uses', numeric: true, cell: (row) => numberFormat.format(row.uses) },
          ]}
        />
        <DataTable
          title="Other actions"
          empty="No other actions in this period."
          rows={actionRows}
          columns={[
            { label: 'Action', cell: (row) => row.label },
            { label: 'Times', numeric: true, cell: (row) => numberFormat.format(row.events) },
            { label: 'Visitors', numeric: true, cell: (row) => numberFormat.format(row.visitors) },
          ]}
        />
      </div>

      <h2 className={styles.sectionTitle}>Follow up</h2>
      <DataTable
        title="Checkouts left unpaid"
        note="Stripe checkouts that expired before payment. An email shows only when the guest typed one into Stripe before leaving."
        empty="No checkouts expired unpaid in this period."
        rows={report.abandoned}
        columns={[
          { label: 'When', cell: (row) => formatWhen(row.occurred_at) },
          {
            label: 'Items',
            cell: (row) =>
              row.detail?.items.length
                ? row.detail.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')
                : 'Not available',
          },
          { label: 'Value', numeric: true, cell: (row) => moneyFormat.format(row.value ?? 0) },
          { label: 'Email', cell: (row) => row.detail?.email ?? 'Not given' },
        ]}
      />
    </>
  )
}

export async function InsightsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  if (!req.user) redirect('/admin/login?redirect=%2Fadmin%2Finsights')

  const days = parseInsightRange(searchParams?.['days'])
  const isAdmin = req.user.role === 'admin'
  let report: InsightsReport | null = null
  let failed = false
  if (isAdmin) {
    try {
      report = await getInsightsReport(req.payload, days)
    } catch (error) {
      console.error('Insights report failed:', error)
      failed = true
    }
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter className={styles.view}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Store insights</h1>
            <p className={styles.lede}>
              What guests did on the site, counted without cookies. Each visitor is an anonymous key
              that changes every day, so someone who comes back on another day counts again.
            </p>
          </div>
          {isAdmin ? (
            <nav aria-label="Date range" className={styles.ranges}>
              {INSIGHT_RANGES.map((range) => (
                <Link
                  key={range}
                  href={`/admin/insights?days=${range}`}
                  className={styles.range}
                  aria-current={range === days ? 'page' : undefined}
                >
                  {range} days
                </Link>
              ))}
            </nav>
          ) : null}
        </header>

        {!isAdmin ? (
          <p className={styles.empty}>Only admins can see store insights.</p>
        ) : failed || !report ? (
          <p className={styles.empty}>Insights could not be loaded. Try again in a minute.</p>
        ) : (
          <>
            {report.totals.visitors === 0 && report.totals.orders === 0 ? (
              <p className={styles.notice}>
                Nothing has been recorded in the last {days} days yet. Visits show up here as soon as
                guests browse the site.
              </p>
            ) : null}
            <Report report={report} />
          </>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}

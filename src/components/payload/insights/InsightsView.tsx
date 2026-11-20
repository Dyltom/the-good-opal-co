import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import {
  INSIGHT_RANGES,
  getInsightsReport,
  parseInsightRange,
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
        <DataTable
          title="Devices"
          empty="No visits in this period yet."
          rows={report.devices}
          columns={[
            { label: 'Device', cell: (row) => row.label.charAt(0).toUpperCase() + row.label.slice(1) },
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
            cell: (row) =>
              row.slug ? (
                <Link href={`/store/${row.slug}`} target="_blank" rel="noreferrer">
                  {row.name ?? `Product ${row.product_id}`}
                </Link>
              ) : (
                (row.name ?? `Product ${row.product_id} (removed)`)
              ),
          },
          { label: 'Viewed', numeric: true, cell: (row) => numberFormat.format(row.views) },
          { label: 'Carted', numeric: true, cell: (row) => numberFormat.format(row.carts) },
          { label: 'Bought', numeric: true, cell: (row) => numberFormat.format(row.bought) },
        ]}
      />

      <h2 className={styles.sectionTitle}>Searching and browsing</h2>
      <div className={styles.grid}>
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
      <DataTable
        title="Recent errors"
        note="Errors guests hit in their browser or at checkout, grouped by message and page."
        empty="No errors were reported in this period."
        rows={report.errors}
        columns={[
          { label: 'Last seen', cell: (row) => formatWhen(row.last_seen) },
          { label: 'Where', cell: (row) => (row.kind === 'checkout_error' ? `Checkout on ${row.path}` : row.path) },
          { label: 'Message', cell: (row) => <span className={styles.message}>{row.message}</span> },
          { label: 'Times', numeric: true, cell: (row) => numberFormat.format(row.occurrences) },
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

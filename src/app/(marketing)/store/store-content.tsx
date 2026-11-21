import Link from 'next/link'
import { ViewTransition, type ReactNode } from 'react'
import { ArrowRight, Grid2x2, Grid3x3, Search, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  FilterSheet,
  PriceForm,
  SearchRow,
  SearchToggle,
  StoreSort,
  StoreView,
  ViewToggle,
} from './store-controls'
import {
  activeFilterCount,
  EMPTY_STORE_QUERY,
  facetOptionLabel,
  priceRangeLabel,
  PRODUCTS_PER_PAGE,
  STORE_FACET_LABELS,
  STORE_FACET_OPTIONS,
  STORE_FACETS,
  STORE_PRICE_BANDS,
  STORE_SORT_LABELS,
  STORE_SORTS,
  storeQueryParams,
  storeUrl,
  toggleFacetValue,
  type StoreFacet,
  type StoreFacetCounts,
  type StoreQuery,
} from './store-query'
import './store.css'

export interface StoreProduct {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  reserved?: boolean
  soldPerUnit?: boolean
  featured?: boolean
  category?: string
  image?: string
  hoverImage?: string
  stoneOrigin?: string
  stoneType?: string
  carats?: number
}

export interface StoreViewPrefs {
  three: boolean
  details: boolean
}

interface Counts {
  facets: StoreFacetCounts
  prices: number[]
}

interface StoreContentProps {
  products: StoreProduct[]
  query: StoreQuery
  totalDocs: number
  counts: Counts
  totals: Counts
  soldCount: number
  view: StoreViewPrefs
}

function HiddenQueryFields({ query, omit }: { query: StoreQuery; omit: string[] }) {
  return Array.from(storeQueryParams(query).entries())
    .filter(([name]) => !omit.includes(name))
    .map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
}

function clearAllUrl(query: StoreQuery): string {
  return storeUrl({ ...EMPTY_STORE_QUERY, sort: query.sort })
}

function hasAnyFilter(query: StoreQuery): boolean {
  return Boolean(query.search) || activeFilterCount(query) > 0
}

function pieces(count: number): string {
  return `${count} ${count === 1 ? 'piece' : 'pieces'}`
}

function Count({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('tabular-nums', className)}>
      <span className="sr-only">, </span>
      {count}
      <span className="sr-only"> {count === 1 ? 'piece' : 'pieces'}</span>
    </span>
  )
}

function OptionRow({
  href,
  label,
  count,
  selected,
  sheet,
}: {
  href: string
  label: string
  count: number
  selected: boolean
  sheet: boolean
}) {
  const rowClass = cn(
    'group/opt flex w-full items-center gap-2.5 text-ink-2 transition-colors',
    sheet ? 'min-h-11 text-[15px]' : 'py-1 text-sm leading-[1.35]'
  )
  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'size-[9px] flex-none rounded-full border transition-colors',
          selected ? 'border-accent bg-accent' : 'border-rule-2 group-hover/opt:border-ink-2'
        )}
      />
      {label}
      <Count count={count} className="ml-auto text-[12.5px] text-ink-3" />
    </>
  )

  if (count === 0 && !selected) {
    return (
      <span aria-disabled="true" className={cn(rowClass, 'opacity-40')}>
        {content}
      </span>
    )
  }

  return (
    <Link
      href={href}
      scroll={false}
      prefetch={false}
      aria-current={selected ? 'true' : undefined}
      className={cn(rowClass, 'hover:text-ink aria-[current]:text-ink')}
    >
      {content}
    </Link>
  )
}

function Facet({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="mt-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.06em] text-ink-3">{label}</p>
      {children}
    </div>
  )
}

function FacetGroup({
  facet,
  query,
  counts,
  totals,
  sheet,
}: {
  facet: StoreFacet
  query: StoreQuery
  counts: Record<string, number>
  totals: Record<string, number>
  sheet: boolean
}) {
  const options = STORE_FACET_OPTIONS[facet].filter(
    ([value]) => (totals[value] ?? 0) > 0 || query[facet].includes(value)
  )
  if (options.length === 0) return null

  return (
    <Facet label={STORE_FACET_LABELS[facet]}>
      <ul>
        {options.map(([value, label]) => (
          <li key={value}>
            <OptionRow
              href={storeUrl(toggleFacetValue(query, facet, value), 1)}
              label={label}
              count={counts[value] ?? 0}
              selected={query[facet].includes(value)}
              sheet={sheet}
            />
          </li>
        ))}
      </ul>
    </Facet>
  )
}

function PriceGroup({ query, counts, totals, sheet }: { query: StoreQuery; counts: number[]; totals: number[]; sheet: boolean }) {
  return (
    <Facet label="Price (AUD)">
      <ul>
        {STORE_PRICE_BANDS.map((band, index) => {
          const selected = query.priceMin === band.priceMin && query.priceMax === band.priceMax
          if ((totals[index] ?? 0) === 0 && !selected) return null
          const label = priceRangeLabel(band) ?? ''
          return (
            <li key={label}>
              <OptionRow
                href={storeUrl({
                  ...query,
                  priceMin: selected ? undefined : band.priceMin,
                  priceMax: selected ? undefined : band.priceMax,
                  page: 1,
                })}
                label={label}
                count={counts[index] ?? 0}
                selected={selected}
                sheet={sheet}
              />
            </li>
          )
        })}
      </ul>
      <PriceForm query={query} />
    </Facet>
  )
}

function FilterGroups({
  query,
  counts,
  totals,
  soldCount,
  sheet = false,
}: {
  query: StoreQuery
  counts: Counts
  totals: Counts
  soldCount: number
  sheet?: boolean
}) {
  const facet = (name: StoreFacet) => (
    <FacetGroup
      facet={name}
      query={query}
      counts={counts.facets[name]}
      totals={totals.facets[name]}
      sheet={sheet}
    />
  )

  return (
    <>
      {facet('category')}
      {facet('stone')}
      {facet('origin')}
      <PriceGroup query={query} counts={counts.prices} totals={totals.prices} sheet={sheet} />
      {facet('carat')}
      {facet('metal')}
      {facet('size')}
      {soldCount > 0 ? (
        <Facet label="Availability">
          <OptionRow
            href={storeUrl(
              { ...query, availability: query.availability === 'all' ? 'available' : 'all' },
              1
            )}
            label="Include sold pieces"
            count={soldCount}
            selected={query.availability === 'all'}
            sheet={sheet}
          />
          <Link
            href="/store/collected"
            className={cn(
              'flex items-center gap-1.5 text-sm text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink',
              sheet ? 'min-h-11' : 'py-1'
            )}
          >
            Recently sold
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Facet>
      ) : null}
    </>
  )
}

function SearchForm({ query, id, className }: { query: StoreQuery; id: string; className?: string }) {
  return (
    <form action="/store" method="get" role="search" className={cn('relative', className)}>
      <label className="sr-only" htmlFor={id}>
        Search the collection
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 size-[17px] -translate-y-1/2 text-ink-3"
      />
      <input
        id={id}
        type="search"
        name="search"
        defaultValue={query.search}
        placeholder="Search the collection"
        className="h-[42px] w-full appearance-none rounded-none border-0 border-b border-rule-2 bg-transparent pl-[27px] pr-0 text-base text-ink outline-none placeholder:text-ink-3 focus:border-accent lg:text-sm"
      />
      <HiddenQueryFields query={query} omit={['search', 'page']} />
    </form>
  )
}

function activeChips(query: StoreQuery) {
  const priceLabel = priceRangeLabel(query)
  return [
    ...(query.search
      ? [{ key: 'search', label: `“${query.search}”`, href: storeUrl({ ...query, search: '', page: 1 }) }]
      : []),
    ...STORE_FACETS.flatMap((facet) =>
      query[facet].map((value) => ({
        key: `${facet}-${value}`,
        label: facetOptionLabel(facet, value),
        href: storeUrl(toggleFacetValue(query, facet, value), 1),
      }))
    ),
    ...(priceLabel
      ? [
          {
            key: 'price',
            label: priceLabel,
            href: storeUrl({ ...query, priceMin: undefined, priceMax: undefined, page: 1 }),
          },
        ]
      : []),
    ...(query.availability === 'all'
      ? [
          {
            key: 'availability',
            label: 'Including sold',
            href: storeUrl({ ...query, availability: 'available', page: 1 }),
          },
        ]
      : []),
  ]
}

function ActiveFilters({ query, className }: { query: StoreQuery; className?: string }) {
  const chips = activeChips(query)
  if (chips.length === 0) return null

  return (
    <ul aria-label="Active filters" className={cn('relative flex gap-1.5 overflow-x-auto [scrollbar-width:none]', className)}>
      {chips.map((chip) => (
        <li key={chip.key} className="flex-none">
          <Link
            href={chip.href}
            scroll={false}
            prefetch={false}
            aria-label={`Remove ${chip.label}`}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-rule-2 pl-3 pr-2 text-[12.5px] text-ink transition-colors hover:border-ink-2 lg:h-7"
          >
            {chip.label}
            <X className="size-3" aria-hidden="true" />
          </Link>
        </li>
      ))}
      <li className="flex-none">
        <Link
          href={clearAllUrl(query)}
          scroll={false}
          prefetch={false}
          className="inline-flex h-8 items-center whitespace-nowrap px-1.5 text-[12.5px] text-ink-2 underline decoration-rule-2 underline-offset-[0.22em] hover:text-ink lg:h-7"
        >
          Clear all
        </Link>
      </li>
    </ul>
  )
}

const chipClass =
  'inline-flex h-[34px] flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-rule-2 px-3 text-[13px] text-ink-2 transition-colors'

function QuickChips({ query, counts, totals }: { query: StoreQuery; counts: Counts; totals: Counts }) {
  return (['category', 'stone'] as const).flatMap((facet) =>
    STORE_FACET_OPTIONS[facet]
      .filter(([value]) => (totals.facets[facet][value] ?? 0) > 0 || query[facet].includes(value))
      .map(([value, label]) => {
        const selected = query[facet].includes(value)
        const count = counts.facets[facet][value] ?? 0
        const inner = (
          <>
            {label}
            <Count count={count} className="text-[11.5px] opacity-70" />
          </>
        )
        if (count === 0 && !selected) {
          return (
            <span key={value} aria-disabled="true" className={cn(chipClass, 'opacity-40')}>
              {inner}
            </span>
          )
        }
        return (
          <Link
            key={value}
            href={storeUrl(toggleFacetValue(query, facet, value), 1)}
            scroll={false}
            prefetch={false}
            aria-current={selected ? 'true' : undefined}
            className={cn(chipClass, selected ? 'border-ink bg-ink text-bg' : 'hover:border-ink-2 hover:text-ink')}
          >
            {inner}
          </Link>
        )
      })
  )
}

function ShowMore({ query, shown, total }: { query: StoreQuery; shown: number; total: number }) {
  if (shown >= total) return null
  const next = Math.min(PRODUCTS_PER_PAGE, total - shown)

  return (
    <div className="mt-10 flex flex-col items-center gap-3 px-gut lg:mt-14">
      <p className="text-[13px] text-ink-2">
        {shown} of {total} pieces shown
      </p>
      <Link href={storeUrl(query, query.page + 1)} scroll={false} className={buttonVariants({ variant: 'ghost' })}>
        Show {next} more
      </Link>
    </div>
  )
}

const iconButton =
  'grid h-[52px] w-[46px] flex-none place-items-center border-l border-rule text-ink-2 aria-expanded:text-accent aria-pressed:text-accent lg:hidden'

export function StoreContent({ products, query, totalDocs, counts, totals, soldCount, view }: StoreContentProps) {
  const sortOptions = STORE_SORTS.map((sort) => ({
    value: sort,
    label: STORE_SORT_LABELS[sort],
    href: storeUrl({ ...query, sort }, 1),
  }))
  const filterProps = { query, counts, totals, soldCount }

  return (
    <section aria-label="Opal collection">
      <StoreView
        three={view.three}
        details={view.details}
        search={Boolean(query.search)}
        className="pb-14 lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-x-[clamp(18px,2.2vw,36px)] lg:px-gut lg:pb-20"
      >
        <aside
          aria-label="Filters"
          className="sticky top-14 hidden self-start pb-7 pr-0.5 pt-3.5 lg:block"
        >
          <SearchForm query={query} id="store-search" />
          <FilterGroups {...filterProps} />
          <p className="mt-6 text-xs leading-5 text-ink-3">Origin disclosed · Prices in AUD · Tracked delivery</p>
        </aside>

        <div className="min-w-0">
          <div className="max-lg:contents lg:sticky lg:top-14 lg:z-20 lg:mb-3.5 lg:flex lg:min-h-[58px] lg:items-center lg:gap-5 lg:border-b lg:border-rule lg:bg-bg/[0.92] lg:py-2 lg:backdrop-blur-[14px]">
            <div className="flex flex-none items-baseline justify-between gap-3.5 px-gut pb-2.5 pt-3.5 lg:justify-start lg:p-0">
              <h1 className="font-serif text-[26px] leading-[1.1] tracking-[-0.02em] text-ink lg:text-[28px]">
                Australian opals
              </h1>
              <p className="text-[13px] text-ink-2" aria-live="polite">
                {totalDocs === 0 ? 'No pieces found' : pieces(totalDocs)}
              </p>
            </div>

            <div className="sticky top-[52px] z-20 flex min-h-[52px] min-w-0 flex-wrap items-center border-y border-rule bg-bg/[0.94] pl-gut backdrop-blur-[14px] lg:static lg:min-h-0 lg:flex-1 lg:flex-nowrap lg:gap-[18px] lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <StoreSort
                options={sortOptions}
                value={query.sort}
                className="h-[52px] border-r border-rule pr-2.5 lg:order-last lg:h-auto lg:border-0 lg:pr-0"
              />
              <div className="relative flex h-[52px] min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overscroll-x-contain px-2.5 [mask-image:linear-gradient(90deg,transparent,#000_10px,#000_calc(100%-20px),transparent)] [scrollbar-width:none] lg:hidden">
                <FilterSheet
                  activeCount={activeFilterCount(query)}
                  resultCount={totalDocs}
                  clearHref={hasAnyFilter(query) ? clearAllUrl(query) : undefined}
                  className={cn(
                    chipClass,
                    activeFilterCount(query) > 0 ? 'border-ink text-ink' : 'hover:border-ink-2'
                  )}
                >
                  <SearchForm query={query} id="store-search-sheet" className="mt-3" />
                  <FilterGroups {...filterProps} sheet />
                </FilterSheet>
                <span aria-hidden="true" className="mx-1 h-5 w-px flex-none bg-rule-2" />
                <QuickChips query={query} counts={counts} totals={totals} />
              </div>
              <div className="hidden min-w-0 flex-1 lg:block">
                <ActiveFilters query={query} />
              </div>
              <ViewToggle
                option="details"
                className="hidden flex-none items-center gap-[9px] py-1.5 text-[13px] text-ink-2 aria-pressed:text-ink lg:inline-flex [@media(hover:none)]:!hidden"
              >
                <span
                  aria-hidden="true"
                  className="relative h-3.5 w-[26px] rounded-full border border-rule-2 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-2 after:rounded-full after:bg-ink-3 after:transition-transform after:duration-300 after:ease-gallery group-aria-pressed/toggle:border-accent group-aria-pressed/toggle:after:translate-x-3 group-aria-pressed/toggle:after:bg-accent"
                />
                Details on every card
              </ViewToggle>
              <ViewToggle
                option="three"
                label="Larger photos"
                className="hidden size-9 flex-none place-items-center rounded-sm text-ink-2 hover:text-ink aria-pressed:text-accent lg:grid"
              >
                <Grid2x2 className="size-[18px]" aria-hidden="true" />
              </ViewToggle>
              <SearchToggle className={iconButton} />
              <ViewToggle option="three" label="Three per row" className={iconButton}>
                <Grid3x3 className="size-[18px]" aria-hidden="true" />
              </ViewToggle>
              <SearchRow className="basis-full pb-2 pr-gut lg:hidden">
                <SearchForm query={query} id="store-search-mobile" />
              </SearchRow>
            </div>
          </div>

          <ActiveFilters query={query} className="px-gut pt-3 lg:hidden" />

          <h2 className="sr-only">Current collection</h2>
          {products.length > 0 ? (
            <ul
              data-store-grid=""
              className="grid grid-cols-2 gap-x-2 gap-y-5 px-gut pt-3 group-data-[three]/view:grid-cols-3 group-data-[three]/view:gap-x-[5px] group-data-[three]/view:gap-y-3.5 sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))] sm:gap-x-3 sm:gap-y-[22px] sm:group-data-[three]/view:grid-cols-3 sm:group-data-[three]/view:gap-x-3 sm:group-data-[three]/view:gap-y-[22px] lg:px-0 lg:pt-0"
            >
              {products.map((product, index) => (
                <ViewTransition key={product.id} default="store-card" update={{ 'store-view': 'store-card', default: 'none' }}>
                  <li>
                    <ProductCard product={product} index={index} priority />
                  </li>
                </ViewTransition>
              ))}
            </ul>
          ) : (
            <div className="max-w-[46ch] px-gut py-12 lg:px-0 lg:py-16">
              <h2 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-[-0.02em] text-ink">
                Nothing matches yet.
              </h2>
              <p className="mb-[22px] mt-3 text-ink-2">
                Try fewer details, browse every available piece, or ask us to help source something
                particular.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link href={clearAllUrl(query)} className={buttonVariants()}>
                  Clear filters
                </Link>
                <Link href="/contact?subject=opal-finder" className={buttonVariants({ variant: 'ghost' })}>
                  Ask for help
                </Link>
              </div>
            </div>
          )}

          <ShowMore query={query} shown={products.length} total={totalDocs} />
        </div>
      </StoreView>
    </section>
  )
}

import Link from 'next/link'
import { ArrowRight, Check, Search, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils'
import { PriceForm, StoreFilterSheet, StoreSort } from './store-controls'
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

export interface StoreProduct {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
  image?: string
  hoverImage?: string
  stoneOrigin?: string
  stoneType?: string
  carats?: number
}

interface StoreContentProps {
  products: StoreProduct[]
  query: StoreQuery
  totalDocs: number
  facetCounts: StoreFacetCounts
  priceCounts: number[]
  soldCount: number
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2'

function HiddenQueryFields({ query, omit }: { query: StoreQuery; omit: string[] }) {
  return Array.from(storeQueryParams(query).entries())
    .filter(([name]) => !omit.includes(name))
    .map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
}

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 font-sans text-sm transition-colors',
    focusRing,
    active
      ? 'border-charcoal bg-charcoal text-cream hover:bg-charcoal-dark'
      : 'border-warm-grey/80 bg-cream text-charcoal hover:border-charcoal'
  )
}

function clearAllUrl(query: StoreQuery): string {
  return storeUrl({ ...EMPTY_STORE_QUERY, sort: query.sort })
}

function hasAnyFilter(query: StoreQuery): boolean {
  return Boolean(query.search) || activeFilterCount(query) > 0
}

function ChipCount({ count, selected }: { count: number; selected: boolean }) {
  return (
    <span className={cn('text-xs tabular-nums', selected ? 'text-cream/70' : 'text-charcoal/50')}>
      <span className="sr-only">, </span>
      {count}
      <span className="sr-only"> {count === 1 ? 'piece' : 'pieces'}</span>
    </span>
  )
}

function FacetChip({
  facet,
  value,
  label,
  count,
  query,
}: {
  facet: StoreFacet
  value: string
  label: string
  count: number
  query: StoreQuery
}) {
  const selected = query[facet].includes(value)
  return (
    <Link
      href={storeUrl(toggleFacetValue(query, facet, value), 1)}
      scroll={false}
      prefetch={false}
      aria-current={selected ? 'true' : undefined}
      className={chipClass(selected)}
    >
      {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
      <ChipCount count={count} selected={selected} />
    </Link>
  )
}

function shownOptions(facet: StoreFacet, query: StoreQuery, counts: Record<string, number>) {
  return STORE_FACET_OPTIONS[facet].filter(
    ([value]) => (counts[value] ?? 0) > 0 || query[facet].includes(value)
  )
}

const groupLabelClass =
  'mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/55'

function FacetGroup({
  facet,
  query,
  counts,
}: {
  facet: StoreFacet
  query: StoreQuery
  counts: Record<string, number>
}) {
  const options = shownOptions(facet, query, counts)
  if (options.length === 0) return null
  const label = STORE_FACET_LABELS[facet]

  return (
    <div role="group" aria-label={label}>
      <p className={groupLabelClass}>{label}</p>
      <ul className="flex flex-wrap gap-2">
        {options.map(([value, optionLabel]) => (
          <li key={value}>
            <FacetChip
              facet={facet}
              value={value}
              label={optionLabel}
              count={counts[value] ?? 0}
              query={query}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function PriceGroup({ query, counts }: { query: StoreQuery; counts: number[] }) {
  return (
    <div role="group" aria-label="Price">
      <p className={groupLabelClass}>Price (AUD)</p>
      <PriceForm query={query} />
      <ul className="mt-3 flex flex-wrap gap-2">
        {STORE_PRICE_BANDS.map((preset, index) => {
          const selected = query.priceMin === preset.priceMin && query.priceMax === preset.priceMax
          const count = counts[index] ?? 0
          if (count === 0 && !selected) return null
          const label = priceRangeLabel(preset)
          return (
            <li key={label}>
              <Link
                href={storeUrl({
                  ...query,
                  priceMin: selected ? undefined : preset.priceMin,
                  priceMax: selected ? undefined : preset.priceMax,
                  page: 1,
                })}
                scroll={false}
                prefetch={false}
                aria-current={selected ? 'true' : undefined}
                className={chipClass(selected)}
              >
                {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {label}
                <ChipCount count={count} selected={selected} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function QuickChips({ query, facetCounts }: { query: StoreQuery; facetCounts: StoreFacetCounts }) {
  const chips = (['category', 'stone'] as const).flatMap((facet) =>
    shownOptions(facet, query, facetCounts[facet]).map(([value, label]) => (
      <li key={value}>
        <FacetChip
          facet={facet}
          value={value}
          label={label}
          count={facetCounts[facet][value] ?? 0}
          query={query}
        />
      </li>
    ))
  )
  if (chips.length === 0) return null

  return (
    <ul aria-label="Quick filters" className="flex flex-none gap-2 lg:hidden">
      {chips}
    </ul>
  )
}

function FilterGroups({
  query,
  facetCounts,
  priceCounts,
  soldCount,
}: {
  query: StoreQuery
  facetCounts: StoreFacetCounts
  priceCounts: number[]
  soldCount: number
}) {
  return (
    <div className="space-y-7">
      {(['category', 'stone'] as const).map((facet) => (
        <FacetGroup key={facet} facet={facet} query={query} counts={facetCounts[facet]} />
      ))}
      <PriceGroup query={query} counts={priceCounts} />
      {(['origin', 'carat'] as const).map((facet) => (
        <FacetGroup key={facet} facet={facet} query={query} counts={facetCounts[facet]} />
      ))}
      {soldCount > 0 ? (
        <div
          role="group"
          aria-label="Availability"
          className="space-y-4 border-t border-warm-grey/60 pt-6"
        >
          <Link
            href={storeUrl(
              { ...query, availability: query.availability === 'all' ? 'available' : 'all' },
              1
            )}
            scroll={false}
            prefetch={false}
            aria-current={query.availability === 'all' ? 'true' : undefined}
            className={chipClass(query.availability === 'all')}
          >
            {query.availability === 'all' ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : null}
            Include sold pieces
          </Link>
          <Link
            href="/store/collected"
            className="flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-charcoal underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal"
          >
            Recently sold
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function ActiveFilters({ query }: { query: StoreQuery }) {
  const priceLabel = priceRangeLabel(query)
  const chips = [
    ...(query.search
      ? [
          {
            key: 'search',
            label: `“${query.search}”`,
            href: storeUrl({ ...query, search: '', page: 1 }),
          },
        ]
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
  if (chips.length === 0) return null

  return (
    <ul aria-label="Active filters" className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            scroll={false}
            prefetch={false}
            aria-label={`Remove ${chip.label}`}
            className={cn(
              'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-charcoal/70 bg-cream px-3 font-sans text-sm text-charcoal hover:bg-charcoal hover:text-cream',
              focusRing
            )}
          >
            {chip.label}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={clearAllUrl(query)}
          scroll={false}
          className={cn(
            'inline-flex min-h-9 items-center px-2 font-sans text-sm font-semibold underline underline-offset-4',
            focusRing
          )}
        >
          Clear all
        </Link>
      </li>
    </ul>
  )
}

function ShowMore({ query, shown, total }: { query: StoreQuery; shown: number; total: number }) {
  if (shown >= total) return null
  const next = Math.min(PRODUCTS_PER_PAGE, total - shown)

  return (
    <div className="mt-10 flex flex-col items-center gap-3 sm:mt-14">
      <p className="font-sans text-sm text-charcoal/65">
        {shown} of {total} pieces shown
      </p>
      <Link
        href={storeUrl(query, query.page + 1)}
        scroll={false}
        className={cn(
          'inline-flex min-h-12 items-center rounded-sm border border-charcoal px-8 font-sans text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-cream',
          focusRing
        )}
      >
        Show {next} more
      </Link>
    </div>
  )
}

export function StoreContent({
  products,
  query,
  totalDocs,
  facetCounts,
  priceCounts,
  soldCount,
}: StoreContentProps) {
  const shown = products.length
  const sortOptions = STORE_SORTS.map((sort) => ({
    value: sort,
    label: STORE_SORT_LABELS[sort],
    href: storeUrl({ ...query, sort }, 1),
  }))
  const filters = (
    <FilterGroups
      query={query}
      facetCounts={facetCounts}
      priceCounts={priceCounts}
      soldCount={soldCount}
    />
  )

  return (
    <section
      className="bg-cream-dark px-5 pb-10 pt-2 sm:px-8 sm:pb-14 lg:pt-6"
      aria-label="Opal collection"
    >
      <div className="mx-auto max-w-[92rem]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 lg:grid-cols-[15.5rem_minmax(0,1fr)_auto] lg:gap-x-12 lg:border-b lg:border-warm-grey/70 lg:pb-5">
          <div>
            <h1 className="font-serif text-base leading-5 text-charcoal lg:text-2xl lg:leading-8">
              Australian opals
            </h1>
            <p
              className="font-sans text-xs leading-4 text-charcoal/65 lg:text-sm lg:leading-5"
              aria-live="polite"
            >
              {totalDocs === 0 ? (
                'No pieces found'
              ) : (
                <>
                  <span className="lg:hidden">
                    {totalDocs} {totalDocs === 1 ? 'piece' : 'pieces'}
                  </span>
                  <span className="hidden lg:inline">{`Showing 1–${shown} of ${totalDocs} pieces`}</span>
                </>
              )}
            </p>
          </div>

          <form action="/store" method="get" role="search" className="flex gap-2 lg:hidden">
            <label className="sr-only" htmlFor="store-search">
              Search the collection
            </label>
            <input
              id="store-search"
              type="search"
              name="search"
              defaultValue={query.search}
              placeholder="Name or SKU"
              className="min-h-11 min-w-0 flex-1 rounded-sm border border-warm-grey/70 bg-cream px-3 font-sans text-base text-charcoal outline-none placeholder:text-charcoal/40 focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
            />
            <HiddenQueryFields query={query} omit={['search', 'page']} />
            <button
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm bg-charcoal px-3 font-sans text-sm font-semibold text-cream hover:bg-charcoal-dark lg:px-6',
                focusRing
              )}
              type="submit"
            >
              <Search className="h-5 w-5 lg:hidden" aria-hidden="true" />
              <span className="sr-only lg:not-sr-only">Search</span>
            </button>
          </form>

          <div className="relative col-span-2 -mx-5 flex gap-2 overflow-x-auto px-5 py-1 [mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)] [scrollbar-width:none] after:block after:w-6 after:flex-none after:content-[''] sm:-mx-8 sm:px-8 lg:col-span-1 lg:col-start-3 lg:m-0 lg:overflow-visible lg:p-0 lg:[mask-image:none] lg:after:hidden">
            <StoreFilterSheet
              activeCount={activeFilterCount(query)}
              resultCount={totalDocs}
              clearHref={hasAnyFilter(query) ? clearAllUrl(query) : undefined}
              className="flex-none lg:hidden"
            >
              {filters}
            </StoreFilterSheet>
            <StoreSort options={sortOptions} value={query.sort} className="flex-none" />
            <QuickChips query={query} facetCounts={facetCounts} />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 pt-1 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12 lg:pt-6">
          <aside className="hidden lg:block" aria-label="Filters">
            <p className="border-b border-warm-grey/70 pb-4 font-serif text-2xl">Refine</p>
            <div className="pt-6">{filters}</div>
            <ul className="mt-8 space-y-2 border-t border-warm-grey/70 pt-5 font-sans text-xs font-semibold text-charcoal/65">
              <li>Origin disclosed</li>
              <li>Prices in AUD</li>
              <li>Tracked delivery</li>
            </ul>
          </aside>

          <div>
            <h2 className="sr-only">Current collection</h2>
            <ActiveFilters query={query} />

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} priority />
                ))}
              </div>
            ) : (
              <div className="border-y border-warm-grey/70 py-16 text-center sm:py-20">
                <p className="font-serif text-4xl">Nothing matches yet.</p>
                <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-6 text-charcoal/65">
                  Try fewer details, browse every available piece, or ask us to help source
                  something particular.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/store"
                    className={cn(
                      'min-h-11 rounded-sm bg-charcoal px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-charcoal-dark',
                      focusRing
                    )}
                  >
                    Clear filters
                  </Link>
                  <Link
                    href="/contact?subject=opal-finder"
                    className={cn(
                      'min-h-11 border-b border-charcoal px-2 py-3 font-sans text-sm font-semibold transition-colors hover:text-charcoal/70',
                      focusRing
                    )}
                  >
                    Ask for help
                  </Link>
                </div>
              </div>
            )}

            <ShowMore query={query} shown={shown} total={totalDocs} />
          </div>
        </div>
      </div>
    </section>
  )
}

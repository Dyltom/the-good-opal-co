import Link from 'next/link'
import { ArrowRight, Check, Search, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/ui/eyebrow'
import { StoreFilterSheet, StoreSort } from './store-controls'
import {
  activeFilterCount,
  EMPTY_STORE_QUERY,
  facetOptionLabel,
  PRODUCTS_PER_PAGE,
  STORE_FACET_LABELS,
  STORE_FACET_OPTIONS,
  STORE_FACETS,
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
  stoneOrigin?: string
  stoneType?: string
  carats?: number
}

interface StoreContentProps {
  products: StoreProduct[]
  query: StoreQuery
  totalDocs: number
  facetCounts: StoreFacetCounts
  collectedCount: number
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

function FacetGroup({ facet, query, counts }: { facet: StoreFacet; query: StoreQuery; counts: Record<string, number> }) {
  const active = query[facet]
  const options = STORE_FACET_OPTIONS[facet].filter(([value]) => (counts[value] ?? 0) > 0 || active.includes(value))
  if (options.length === 0) return null
  const label = STORE_FACET_LABELS[facet]

  return (
    <div role="group" aria-label={label}>
      <p className="mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/55">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {options.map(([value, optionLabel]) => {
          const selected = active.includes(value)
          const count = counts[value] ?? 0
          return (
            <li key={value}>
              <Link
                href={storeUrl(toggleFacetValue(query, facet, value), 1)}
                scroll={false}
                prefetch={false}
                aria-current={selected ? 'true' : undefined}
                className={chipClass(selected)}
              >
                {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {optionLabel}
                <span className={cn('text-xs tabular-nums', selected ? 'text-cream/70' : 'text-charcoal/50')}>
                  <span className="sr-only">, </span>
                  {count}
                  <span className="sr-only"> {count === 1 ? 'piece' : 'pieces'}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function FilterGroups({
  query,
  facetCounts,
  collectedCount,
}: {
  query: StoreQuery
  facetCounts: StoreFacetCounts
  collectedCount: number
}) {
  return (
    <div className="space-y-7">
      {STORE_FACETS.map((facet) => (
        <FacetGroup key={facet} facet={facet} query={query} counts={facetCounts[facet]} />
      ))}
      {collectedCount > 0 ? (
        <div role="group" aria-label="Availability" className="space-y-4 border-t border-warm-grey/60 pt-6">
          <Link
            href={storeUrl({ ...query, availability: query.availability === 'all' ? 'available' : 'all' }, 1)}
            scroll={false}
            prefetch={false}
            aria-current={query.availability === 'all' ? 'true' : undefined}
            className={chipClass(query.availability === 'all')}
          >
            {query.availability === 'all' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            Include collected pieces
          </Link>
          <Link
            href="/store/collected"
            className="flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-charcoal underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal"
          >
            Recently collected
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function ActiveFilters({ query }: { query: StoreQuery }) {
  const chips = [
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
    ...(query.availability === 'all'
      ? [{ key: 'availability', label: 'Including collected', href: storeUrl({ ...query, availability: 'available', page: 1 }) }]
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
          className={cn('inline-flex min-h-9 items-center px-2 font-sans text-sm font-semibold underline underline-offset-4', focusRing)}
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

export function StoreContent({ products, query, totalDocs, facetCounts, collectedCount }: StoreContentProps) {
  const shown = products.length
  const sortOptions = STORE_SORTS.map((sort) => ({
    value: sort,
    label: STORE_SORT_LABELS[sort],
    href: storeUrl({ ...query, sort }, 1),
  }))
  const filters = <FilterGroups query={query} facetCounts={facetCounts} collectedCount={collectedCount} />

  return (
    <>
      <header className="border-b border-warm-grey/60 bg-cream px-5 py-4 sm:px-8 sm:py-10">
        <div className="mx-auto grid max-w-[92rem] gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,0.65fr)] lg:items-end">
          <div>
            <Eyebrow className="mb-2 sm:mb-4">The collection</Eyebrow>
            <h1 className="max-w-[18ch] font-serif text-[clamp(1.6rem,2.8vw,3rem)] leading-[1.02] text-charcoal">
              Find the opal that stays with you.
            </h1>
          </div>
          <div className="hidden max-w-xl sm:block lg:pb-2">
            <p className="text-charcoal/68 font-sans text-base leading-7">
              One-of-a-kind Australian stones and finished pieces, photographed individually. Use
              the details you know, or browse slowly.
            </p>
            <ul className="mt-6 hidden grid-cols-2 gap-x-6 gap-y-3 border-t border-warm-grey/70 pt-5 font-sans text-xs font-semibold text-charcoal/65 sm:grid sm:grid-cols-3">
              <li>Origin disclosed</li>
              <li>Prices in AUD</li>
              <li>Tracked delivery</li>
            </ul>
          </div>
        </div>
      </header>

      <section className="bg-cream-dark px-5 py-4 sm:px-8 sm:py-8" aria-label="Opal collection">
        <div className="mx-auto max-w-[92rem]">
          <form
            action="/store"
            method="get"
            role="search"
            className="grid grid-cols-[1fr_auto] gap-2 border-b border-warm-grey/70 pb-3 sm:gap-3 sm:pb-6"
          >
            <label className="sr-only" htmlFor="store-search">
              Search the collection
            </label>
            <input
              id="store-search"
              type="search"
              name="search"
              defaultValue={query.search}
              placeholder="Search by product name or SKU"
              className="min-h-12 min-w-0 rounded-sm border border-warm-grey/70 bg-cream px-4 font-sans text-base text-charcoal outline-none placeholder:text-charcoal/40 focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
            />
            <HiddenQueryFields query={query} omit={['search', 'page']} />
            <button
              className={cn(
                'inline-flex min-h-12 min-w-12 items-center justify-center rounded-sm bg-charcoal px-3 font-sans text-sm font-semibold text-cream hover:bg-charcoal-dark sm:px-7',
                focusRing
              )}
              type="submit"
            >
              <Search className="h-5 w-5 sm:hidden" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Search</span>
            </button>
          </form>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 pt-3 sm:gap-8 sm:pt-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block" aria-label="Filters">
              <p className="border-b border-warm-grey/70 pb-4 font-serif text-2xl">Refine</p>
              <div className="pt-6">{filters}</div>
            </aside>

            <div>
              <h2 className="sr-only">Current collection</h2>
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mb-5 lg:border-b lg:border-warm-grey/70 lg:pb-4">
                <div className="flex w-full gap-2 lg:contents">
                  <StoreFilterSheet
                    activeCount={activeFilterCount(query)}
                    resultCount={totalDocs}
                    clearHref={hasAnyFilter(query) ? clearAllUrl(query) : undefined}
                    className="flex-1 lg:hidden"
                  >
                    {filters}
                  </StoreFilterSheet>
                  <StoreSort options={sortOptions} value={query.sort} className="flex-1 lg:order-2 lg:ml-auto lg:flex-none" />
                </div>
                <p className="font-sans text-sm text-charcoal/65 lg:order-1" aria-live="polite">
                  {totalDocs === 0 ? 'No pieces found' : `Showing 1–${shown} of ${totalDocs} pieces`}
                </p>
              </div>

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
    </>
  )
}

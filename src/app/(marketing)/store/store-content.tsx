import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/ui/eyebrow'
import {
  PRODUCTS_PER_PAGE,
  STORE_CATEGORIES,
  STORE_ORIGINS,
  STORE_PRICE_RANGES,
  STORE_STONES,
  storeQueryParams,
  storeUrl,
  type StoreQuery,
  type StoreSort,
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
  createdAt?: string
}

export interface StoreFacets {
  category: Set<string>
  stone: Set<string>
  origin: Set<string>
  price: Set<string>
  collectedCount: number
}

interface StoreContentProps {
  products: StoreProduct[]
  query: StoreQuery
  totalDocs: number
  totalPages: number
  facets: StoreFacets
}

const categories = STORE_CATEGORIES
const stones = STORE_STONES
const origins = STORE_ORIGINS

const priceRanges = [
  ['under-250', 'Under $250'],
  ['250-500', '$250 to $500'],
  ['500-1000', '$500 to $1,000'],
  ['1000-plus', '$1,000 and over'],
] as const

const sortOptions: readonly (readonly [StoreSort, string])[] = [
  ['featured', 'Selected first'],
  ['newest', 'Newest'],
  ['price-low', 'Lowest price'],
  ['price-high', 'Highest price'],
]

function HiddenQueryFields({ query, omit }: { query: StoreQuery; omit: string[] }) {
  return Array.from(storeQueryParams(query).entries())
    .filter(([name]) => !omit.includes(name))
    .map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
}

type ChipOption = readonly [value: string, label: string]

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2',
    active
      ? 'border-charcoal bg-charcoal text-cream hover:bg-charcoal-dark'
      : 'border-warm-grey/80 bg-cream text-charcoal hover:border-charcoal'
  )
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} scroll={false} prefetch={false} aria-current={active ? 'true' : undefined} className={chipClass(active)}>
      {children}
      {active ? <X className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </Link>
  )
}

function ChipGroup({
  label,
  options,
  active,
  present,
  hrefFor,
}: {
  label: string
  options: readonly ChipOption[]
  active?: string
  present: Set<string>
  hrefFor: (value: string | undefined) => string
}) {
  const visible = options.filter(([value]) => present.has(value) || value === active)
  if (visible.length === 0) return null

  return (
    <div role="group" aria-label={label}>
      <p className="mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/55">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {visible.map(([value, optionLabel]) => (
          <li key={value}>
            <Chip href={hrefFor(value === active ? undefined : value)} active={value === active}>
              {optionLabel}
            </Chip>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Pagination({ query, totalPages }: { query: StoreQuery; totalPages: number }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - query.page) <= 1
  )

  return (
    <nav
      aria-label="Product pages"
      className="mt-14 flex flex-wrap items-center justify-center gap-2"
    >
      {query.page > 1 ? (
        <Link
          className="min-h-11 px-4 py-3 font-sans text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
          href={storeUrl(query, query.page - 1)}
        >
          Previous
        </Link>
      ) : null}

      {pages.map((page, index) => {
        const previousPage = pages[index - 1]
        return (
          <span key={page} className="contents">
            {previousPage && page - previousPage > 1 ? (
              <span aria-hidden="true" className="px-1">
                …
              </span>
            ) : null}
            <Link
              href={storeUrl(query, page)}
              aria-current={page === query.page ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={
                page === query.page
                  ? 'flex min-h-11 min-w-11 items-center justify-center rounded-full bg-charcoal font-sans text-sm font-semibold text-cream'
                  : 'flex min-h-11 min-w-11 items-center justify-center rounded-full font-sans text-sm font-semibold hover:bg-warm-grey/45'
              }
            >
              {page}
            </Link>
          </span>
        )
      })}

      {query.page < totalPages ? (
        <Link
          className="min-h-11 px-4 py-3 font-sans text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
          href={storeUrl(query, query.page + 1)}
        >
          Next
        </Link>
      ) : null}
    </nav>
  )
}

export function StoreContent({ products, query, totalDocs, totalPages, facets }: StoreContentProps) {
  const activeFilters = [query.category, query.stone, query.origin, query.price].filter(Boolean).length
  const start = totalDocs === 0 ? 0 : (query.page - 1) * PRODUCTS_PER_PAGE + 1
  const end = Math.min(query.page * PRODUCTS_PER_PAGE, totalDocs)

  return (
    <>
      <header className="border-b border-warm-grey/60 bg-cream px-5 py-8 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[92rem] gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,0.65fr)] lg:items-end">
          <div>
            <Eyebrow className="mb-4">The collection</Eyebrow>
            <h1 className="max-w-[18ch] font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[1.02] text-charcoal">
              Find the opal that stays with you.
            </h1>
          </div>
          <div className="max-w-xl lg:pb-2">
            <p className="text-charcoal/68 font-sans text-base leading-7 sm:text-lg sm:leading-8">
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

      <section className="bg-cream-dark px-5 py-8 sm:px-8 sm:py-10" aria-label="Opal collection">
        <div className="mx-auto max-w-[92rem]">
          <form
            action="/store"
            method="get"
            role="search"
            className="grid gap-3 border-b border-warm-grey/70 pb-6 sm:grid-cols-[1fr_auto]"
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
              className="min-h-12 rounded-sm border border-warm-grey/70 bg-cream px-4 font-sans text-base text-charcoal outline-none placeholder:text-charcoal/40 focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
            />
            <HiddenQueryFields query={query} omit={['search', 'page']} />
            <button
              className="hover:bg-charcoal/88 min-h-12 rounded-sm bg-charcoal px-7 font-sans text-sm font-semibold text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
              type="submit"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 pt-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
            <aside>
              <details className="group lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between border-y border-warm-grey/70 font-sans text-sm font-semibold">
                  <span>
                    Refine collection
                    {activeFilters > 0 ? <span className="ml-2 text-charcoal/55">({activeFilters} on)</span> : null}
                  </span>
                  <span aria-hidden="true" className="text-lg group-open:rotate-45">
                    +
                  </span>
                </summary>
                <FilterChips query={query} facets={facets} className="py-6" />
              </details>
              <div className="hidden lg:block">
                <p className="border-b border-warm-grey/70 pb-4 font-serif text-2xl">Refine</p>
                <FilterChips query={query} facets={facets} className="pt-6" />
              </div>
            </aside>

            <div>
              <h2 className="sr-only">Current collection</h2>
              <div className="mb-7 flex flex-col gap-4 border-b border-warm-grey/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <p className="font-sans text-sm text-charcoal/65" aria-live="polite">
                  {totalDocs === 0
                    ? 'No pieces found'
                    : `Showing ${start}–${end} of ${totalDocs} pieces`}
                </p>
                <SortLinks query={query} />
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      priority
                    />
                  ))}
                </div>
              ) : (
                <div className="border-y border-warm-grey/70 py-20 text-center">
                  <p className="font-serif text-4xl">Nothing matches yet.</p>
                  <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-6 text-charcoal/65">
                    Try fewer details, browse every available piece, or ask us to help source
                    something particular.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/store"
                      className="min-h-11 rounded-sm bg-charcoal px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                    >
                      Clear filters
                    </Link>
                    <Link
                      href="/contact?subject=opal-finder"
                      className="min-h-11 border-b border-charcoal px-2 py-3 font-sans text-sm font-semibold transition-colors hover:text-charcoal/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                    >
                      Ask for help
                    </Link>
                  </div>
                </div>
              )}

              <Pagination query={query} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function FilterChips({ query, facets, className }: { query: StoreQuery; facets: StoreFacets; className?: string }) {
  const refine = (patch: Partial<StoreQuery>) => storeUrl({ ...query, ...patch }, 1)

  return (
    <div className={cn('space-y-7', className)}>
      <ChipGroup
        label="Piece"
        options={categories}
        active={query.category}
        present={facets.category}
        hrefFor={(category) => refine({ category })}
      />
      <ChipGroup
        label="Stone"
        options={stones}
        active={query.stone}
        present={facets.stone}
        hrefFor={(stone) => refine({ stone })}
      />
      <ChipGroup
        label="Origin"
        options={origins}
        active={query.origin}
        present={facets.origin}
        hrefFor={(origin) => refine({ origin })}
      />
      <ChipGroup
        label="Price"
        options={priceRanges}
        active={query.price}
        present={facets.price}
        hrefFor={(price) => refine({ price: STORE_PRICE_RANGES.find((range) => range === price) })}
      />
      {facets.collectedCount > 0 ? (
        <div role="group" aria-label="Availability" className="space-y-4 border-t border-warm-grey/60 pt-6">
          <Chip
            href={refine({ availability: query.availability === 'all' ? 'available' : 'all' })}
            active={query.availability === 'all'}
          >
            Include collected pieces
          </Chip>
          <Link
            href="/store/collected"
            className="flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-charcoal underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal"
          >
            Recently collected
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
      {hasAnyFilter(query) ? (
        <Link
          href={query.search ? storeUrl({ search: query.search, availability: 'available', sort: query.sort, page: 1 }) : '/store'}
          scroll={false}
          className="inline-flex min-h-11 items-center font-sans text-sm font-semibold underline underline-offset-4"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  )
}

function SortLinks({ query }: { query: StoreQuery }) {
  return (
    <nav aria-label="Sort pieces" className="-mx-5 flex items-center gap-x-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">Sort</span>
      {sortOptions.map(([sort, label]) => (
        <Link
          key={sort}
          href={storeUrl({ ...query, sort }, 1)}
          scroll={false}
          prefetch={false}
          aria-current={query.sort === sort ? 'true' : undefined}
          className={cn(
            'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-sans text-sm underline-offset-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible',
            query.sort === sort
              ? 'font-semibold text-charcoal underline decoration-charcoal'
              : 'text-charcoal/65 hover:text-charcoal'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

function hasAnyFilter(query: StoreQuery): boolean {
  return Boolean(
    query.search ||
    query.category ||
    query.stone ||
    query.origin ||
    query.material ||
    query.price ||
    query.availability === 'all'
  )
}

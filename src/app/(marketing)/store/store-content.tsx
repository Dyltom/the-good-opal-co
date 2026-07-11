import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import {
  PRODUCTS_PER_PAGE,
  STORE_CATEGORIES,
  STORE_MATERIALS,
  STORE_ORIGINS,
  STORE_STONES,
  storeQueryParams,
  storeUrl,
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
  createdAt?: string
}

interface StoreContentProps {
  products: StoreProduct[]
  query: StoreQuery
  totalDocs: number
  totalPages: number
}

const categories = STORE_CATEGORIES
const stones = STORE_STONES
const origins = STORE_ORIGINS
const materials = STORE_MATERIALS

const priceRanges = [
  ['under-250', 'Under $250'],
  ['250-500', '$250 to $500'],
  ['500-1000', '$500 to $1,000'],
  ['1000-plus', '$1,000 and over'],
] as const

function HiddenQueryFields({ query, omit }: { query: StoreQuery; omit: string[] }) {
  return Array.from(storeQueryParams(query).entries())
    .filter(([name]) => !omit.includes(name))
    .map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value?: string
  options: readonly (readonly [string, string])[]
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/55">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ''}
        className="min-h-11 w-full rounded-sm border border-warm-grey/70 bg-cream px-3 font-sans text-sm text-charcoal outline-none transition-colors focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
      >
        <option value="">Any</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
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
          className="min-h-11 px-4 py-3 font-sans text-sm font-semibold underline-offset-4 hover:underline"
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
          className="min-h-11 px-4 py-3 font-sans text-sm font-semibold underline-offset-4 hover:underline"
          href={storeUrl(query, query.page + 1)}
        >
          Next
        </Link>
      ) : null}
    </nav>
  )
}

export function StoreContent({ products, query, totalDocs, totalPages }: StoreContentProps) {
  const start = totalDocs === 0 ? 0 : (query.page - 1) * PRODUCTS_PER_PAGE + 1
  const end = Math.min(query.page * PRODUCTS_PER_PAGE, totalDocs)

  return (
    <>
      <header className="border-b border-warm-grey/60 bg-cream px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,0.65fr)] lg:items-end">
          <div>
            <p className="mb-5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-charcoal/55">
              The collection
            </p>
            <h1 className="max-w-[12ch] font-serif text-[clamp(3.1rem,7vw,7.25rem)] leading-[0.87] tracking-[-0.045em] text-charcoal">
              Find the opal that stays with you.
            </h1>
          </div>
          <div className="max-w-xl lg:pb-2">
            <p className="text-charcoal/68 font-sans text-base leading-7 sm:text-lg sm:leading-8">
              One-of-a-kind Australian stones and finished pieces, photographed individually. Use
              the details you know, or browse slowly.
            </p>
            <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-warm-grey/70 pt-5 font-sans text-xs font-semibold text-charcoal/65 sm:grid-cols-3">
              <li>Origin disclosed</li>
              <li>Prices in AUD</li>
              <li>Tracked delivery</li>
            </ul>
          </div>
        </div>
      </header>

      <section className="bg-[#f8f5ee] px-5 py-10 sm:px-8 sm:py-14" aria-label="Opal collection">
        <div className="mx-auto max-w-[92rem]">
          <form
            action="/store"
            method="get"
            role="search"
            className="grid gap-3 border-b border-warm-grey/70 pb-8 sm:grid-cols-[1fr_auto]"
          >
            <label className="sr-only" htmlFor="store-search">
              Search the collection
            </label>
            <input
              id="store-search"
              type="search"
              name="search"
              defaultValue={query.search}
              placeholder="Search by stone, origin, setting or SKU"
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

          <div className="grid gap-10 pt-9 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14">
            <aside>
              <details className="group lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between border-y border-warm-grey/70 font-sans text-sm font-semibold">
                  Refine collection
                  <span aria-hidden="true" className="text-lg group-open:rotate-45">
                    +
                  </span>
                </summary>
                <FilterForm query={query} className="py-6" />
              </details>
              <div className="hidden lg:block">
                <p className="border-b border-warm-grey/70 pb-4 font-serif text-2xl">Refine</p>
                <FilterForm query={query} className="pt-6" />
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
                <form action="/store" method="get" className="flex items-center gap-3">
                  <HiddenQueryFields query={query} omit={['sort', 'page']} />
                  <label
                    htmlFor="store-sort"
                    className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55"
                  >
                    Sort
                  </label>
                  <select
                    id="store-sort"
                    name="sort"
                    defaultValue={query.sort}
                    className="min-h-11 rounded-sm border border-warm-grey/70 bg-cream px-3 font-sans text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
                  >
                    <option value="featured">Selected first</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price, low to high</option>
                    <option value="price-high">Price, high to low</option>
                  </select>
                  <button
                    type="submit"
                    className="min-h-11 border-b border-charcoal font-sans text-sm font-semibold"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      variant="minimal"
                      showWishlist={false}
                      showMetadata
                      animated={false}
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
                      className="min-h-11 rounded-sm bg-charcoal px-6 py-3 font-sans text-sm font-semibold text-cream"
                    >
                      Clear filters
                    </Link>
                    <Link
                      href="/contact?subject=opal-finder"
                      className="min-h-11 border-b border-charcoal px-2 py-3 font-sans text-sm font-semibold"
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

function FilterForm({ query, className }: { query: StoreQuery; className?: string }) {
  return (
    <form action="/store" method="get" className={`space-y-5 ${className ?? ''}`}>
      {query.search ? <input type="hidden" name="search" value={query.search} /> : null}
      {query.sort !== 'featured' ? <input type="hidden" name="sort" value={query.sort} /> : null}
      <FilterSelect label="Piece" name="category" value={query.category} options={categories} />
      <FilterSelect label="Stone" name="stone" value={query.stone} options={stones} />
      <FilterSelect label="Origin" name="origin" value={query.origin} options={origins} />
      <FilterSelect label="Setting" name="material" value={query.material} options={materials} />
      <FilterSelect label="Price" name="price" value={query.price} options={priceRanges} />
      <label className="flex min-h-11 items-center gap-3 border-y border-warm-grey/60 py-3 font-sans text-sm text-charcoal/75">
        <input
          type="checkbox"
          name="availability"
          value="all"
          defaultChecked={query.availability === 'all'}
          className="h-4 w-4 accent-charcoal"
        />
        Include collected pieces
      </label>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-sm bg-charcoal px-5 font-sans text-sm font-semibold text-cream"
        >
          Apply
        </button>
        {hasAnyFilter(query) ? (
          <Link
            href="/store"
            className="min-h-11 px-3 py-3 font-sans text-sm font-semibold underline underline-offset-4"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
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

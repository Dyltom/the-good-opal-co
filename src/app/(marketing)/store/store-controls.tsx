'use client'

import { addTransitionType, createContext, startTransition, use, useRef, useState, useTransition, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { priceRange, STORE_VIEW_COOKIES, storeQueryParams, storeUrl, type StoreQuery } from './store-query'

interface View {
  three: boolean
  details: boolean
  search: boolean
}

const ViewContext = createContext<{ view: View; toggle: (key: keyof View) => void } | null>(null)

function useView() {
  const context = use(ViewContext)
  if (!context) throw new Error('Store view controls must sit inside StoreView')
  return context
}

export function StoreView({
  three,
  details,
  search,
  className,
  children,
}: View & { className?: string; children: ReactNode }) {
  const [view, setView] = useState<View>({ three, details, search })

  function toggle(key: keyof View) {
    const next = { ...view, [key]: !view[key] }
    if (key === 'search') {
      flushSync(() => setView(next))
      return
    }
    document.cookie = `${STORE_VIEW_COOKIES[key]}=${next[key] ? '1' : '0'}; path=/store; max-age=31536000; samesite=lax`
    startTransition(() => {
      addTransitionType('store-view')
      setView(next)
    })
  }

  return (
    <ViewContext value={{ view, toggle }}>
      <div
        className={cn('group/view', className)}
        data-three={view.three || undefined}
        data-details={view.details || undefined}
      >
        {children}
      </div>
    </ViewContext>
  )
}

export function ViewToggle({
  option,
  label,
  className,
  children,
}: {
  option: 'three' | 'details'
  label?: string
  className?: string
  children: ReactNode
}) {
  const { view, toggle } = useView()

  return (
    <button
      type="button"
      aria-pressed={view[option]}
      aria-label={label}
      title={label}
      onClick={() => toggle(option)}
      className={cn('group/toggle', className)}
    >
      {children}
    </button>
  )
}

export function SearchToggle({ className }: { className?: string }) {
  const { view, toggle } = useView()

  return (
    <button
      type="button"
      aria-expanded={view.search}
      aria-controls="store-msearch"
      aria-label="Search the collection"
      onClick={() => {
        toggle('search')
        if (!view.search) document.getElementById('store-search-mobile')?.focus()
      }}
      className={className}
    >
      <Search className="size-[18px]" aria-hidden="true" />
    </button>
  )
}

export function SearchRow({ className, children }: { className?: string; children: ReactNode }) {
  const { view } = useView()

  return (
    <div id="store-msearch" hidden={!view.search} className={className}>
      {children}
    </div>
  )
}

export function StoreSort({
  options,
  value,
  className,
}: {
  options: { value: string; label: string; href: string }[]
  value: string
  className?: string
}) {
  const router = useRouter()
  const [pending, startNavigation] = useTransition()
  const [selected, setSelected] = useState(value)

  return (
    <label className={cn('relative flex flex-none items-center gap-2 text-[13px] text-ink-3', className)}>
      <span className="max-lg:sr-only">Sort</span>
      <select
        value={pending ? selected : value}
        aria-busy={pending || undefined}
        onChange={(event) => {
          const option = options.find((entry) => entry.value === event.target.value)
          if (!option) return
          setSelected(option.value)
          startNavigation(() => router.push(option.href, { scroll: false }))
        }}
        className="h-[34px] cursor-pointer appearance-none rounded-none border-0 border-b border-rule-2 bg-transparent py-0 pl-0 pr-[22px] text-[13.5px] text-ink hover:border-ink-2 max-lg:h-[52px] max-lg:border-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-plinth text-ink">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-ink-2 max-lg:right-2.5"
      />
    </label>
  )
}

export function FilterSheet({
  activeCount,
  resultCount,
  clearHref,
  className,
  children,
}: {
  activeCount: number
  resultCount: number
  clearHref?: string
  className?: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = () => dialog.current?.close()

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={className}
      >
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        Filters
        {activeCount > 0 ? <span className="tabular-nums">{activeCount}</span> : null}
      </button>
      <dialog
        ref={dialog}
        id="store-filters"
        aria-labelledby="store-filters-title"
        onClick={(event) => {
          if (event.target === dialog.current) close()
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-bg p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col"
      >
        <div className="flex h-[52px] flex-none items-center justify-between border-b border-rule pl-gut">
          <h2 id="store-filters-title" className="font-serif text-[22px] leading-none">
            Filters
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close filters"
            className="grid h-[52px] w-[52px] place-items-center text-ink-2 hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-gut pb-6">{children}</div>
        <div className="flex flex-none items-center gap-3 border-t border-rule px-gut py-3">
          {clearHref ? (
            <Link
              href={clearHref}
              scroll={false}
              prefetch={false}
              className="inline-flex min-h-11 items-center px-1 text-sm text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink"
            >
              Clear all
            </Link>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="min-h-12 flex-1 rounded-sm border border-ink bg-ink px-5 text-[15px] font-medium text-bg hover:border-[#3a332b] hover:bg-[#3a332b]"
          >
            {resultCount === 0
              ? 'No pieces match'
              : `Show ${resultCount} ${resultCount === 1 ? 'piece' : 'pieces'}`}
          </button>
        </div>
      </dialog>
    </>
  )
}

function formText(data: FormData, name: string): string | undefined {
  const value = data.get(name)
  return typeof value === 'string' ? value : undefined
}

function PriceInput({ name, label, value }: { name: string; label: string; value?: number }) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="pointer-events-none absolute left-0 text-sm text-ink-3">
        $
      </span>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        placeholder={label === 'Min price' ? 'Min' : 'Max'}
        defaultValue={value ?? ''}
        className="h-10 w-full min-w-0 appearance-none rounded-none border-0 border-b border-rule-2 bg-transparent pl-3 pr-0 text-base text-ink outline-none placeholder:text-ink-3 focus:border-accent lg:text-sm"
      />
    </label>
  )
}

export function PriceForm({ query }: { query: StoreQuery }) {
  const router = useRouter()
  const kept = Array.from(storeQueryParams(query).entries()).filter(
    ([name]) => !['price_min', 'price_max', 'page'].includes(name)
  )

  return (
    <form
      key={`${query.priceMin ?? ''}-${query.priceMax ?? ''}`}
      action="/store"
      method="get"
      aria-label="Custom price range"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const range = priceRange(formText(data, 'price_min'), formText(data, 'price_max'))
        router.push(storeUrl({ ...query, ...range, page: 1 }), { scroll: false })
      }}
      className="mt-1.5 flex items-end gap-3"
    >
      {kept.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <PriceInput name="price_min" label="Min price" value={query.priceMin} />
      <PriceInput name="price_max" label="Max price" value={query.priceMax} />
      <button
        type="submit"
        className="h-10 flex-none text-sm text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
      >
        Apply
      </button>
    </form>
  )
}

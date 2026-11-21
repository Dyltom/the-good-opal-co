'use client'

import { useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { priceRange, storeQueryParams, storeUrl, type StoreQuery } from './store-query'

const controlClass =
  'flex min-h-11 items-center gap-2 rounded-sm border border-rule bg-bg px-4 font-sans text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'

export function StoreFilterSheet({
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
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(controlClass, 'justify-center', className)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? <span className="text-ink-2">({activeCount})</span> : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="flex h-[100dvh] flex-col gap-0 border-0 bg-bg p-0"
      >
        <SheetHeader className="border-b border-rule px-5 py-4 pr-16 text-left">
          <SheetTitle className="font-serif text-2xl font-medium text-ink">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        <div className="flex items-center gap-3 border-t border-rule bg-bg px-5 py-4">
          {clearHref ? (
            <Link
              href={clearHref}
              scroll={false}
              className="min-h-11 px-2 py-3 font-sans text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear all
            </Link>
          ) : null}
          <SheetClose className="min-h-12 flex-1 rounded-sm bg-ink px-5 font-sans text-sm font-semibold text-bg hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {resultCount === 0 ? 'No pieces match' : `Show ${resultCount} ${resultCount === 1 ? 'piece' : 'pieces'}`}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function PriceInput({ name, label, value }: { name: string; label: string; value?: number }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 font-sans text-xs text-ink-2">
      {label}
      <span className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-sm text-ink-3"
        >
          $
        </span>
        <input
          name={name}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          defaultValue={value ?? ''}
          className="min-h-11 w-full min-w-0 rounded-sm border border-rule bg-bg pl-6 pr-2 font-sans text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-accent/30"
        />
      </span>
    </label>
  )
}

function formText(data: FormData, name: string): string | undefined {
  const value = data.get(name)
  return typeof value === 'string' ? value : undefined
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
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const range = priceRange(formText(data, 'price_min'), formText(data, 'price_max'))
        router.push(storeUrl({ ...query, ...range, page: 1 }), { scroll: false })
      }}
      className="flex items-end gap-2"
    >
      {kept.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <PriceInput name="price_min" label="Min price" value={query.priceMin} />
      <PriceInput name="price_max" label="Max price" value={query.priceMax} />
      <button
        type="submit"
        className={cn(controlClass, 'justify-center bg-ink text-bg hover:bg-ink')}
      >
        Apply
      </button>
    </form>
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
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState(value)
  const current = pending ? selected : value

  return (
    <Select
      value={current}
      onOpenChange={(open) => {
        if (open) options.forEach((option) => router.prefetch(option.href))
      }}
      onValueChange={(next) => {
        const option = options.find((entry) => entry.value === next)
        if (!option || next === value) return
        setSelected(next)
        startTransition(() => router.push(option.href, { scroll: false }))
      }}
    >
      <SelectTrigger
        aria-label="Sort by"
        aria-busy={pending}
        className={cn(
          controlClass,
          'h-auto w-auto justify-start rounded-sm border-rule bg-bg py-0 pr-3 shadow-none hover:border-rule-2 focus:ring-0 data-[state=open]:border-ink [&>span]:line-clamp-none',
          className
        )}
      >
        <span className="font-normal text-ink-2">Sort:</span>
        <SelectValue />
        {pending && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-ink-2" />}
      </SelectTrigger>
      <SelectContent
        align="end"
        className="min-w-[13rem] rounded-sm border-rule bg-bg text-ink shadow-lg"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-11 cursor-pointer rounded-sm py-2 pl-3 font-sans text-sm text-ink focus:bg-plinth focus:text-ink data-[state=checked]:font-semibold"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

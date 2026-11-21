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
  'flex min-h-11 items-center gap-2 rounded-sm border border-warm-grey/70 bg-cream px-4 font-sans text-sm font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2'

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
        {activeCount > 0 ? <span className="text-charcoal/55">({activeCount})</span> : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="flex h-[100dvh] flex-col gap-0 border-0 bg-cream p-0"
      >
        <SheetHeader className="border-b border-warm-grey/70 px-5 py-4 pr-16 text-left">
          <SheetTitle className="font-serif text-2xl font-medium text-charcoal">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        <div className="flex items-center gap-3 border-t border-warm-grey/70 bg-cream px-5 py-4">
          {clearHref ? (
            <Link
              href={clearHref}
              scroll={false}
              className="min-h-11 px-2 py-3 font-sans text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              Clear all
            </Link>
          ) : null}
          <SheetClose className="min-h-12 flex-1 rounded-sm bg-charcoal px-5 font-sans text-sm font-semibold text-cream hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2">
            {resultCount === 0 ? 'No pieces match' : `Show ${resultCount} ${resultCount === 1 ? 'piece' : 'pieces'}`}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function PriceInput({ name, label, value }: { name: string; label: string; value?: number }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 font-sans text-xs text-charcoal/65">
      {label}
      <span className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-sm text-charcoal/50"
        >
          $
        </span>
        <input
          name={name}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={value ?? ''}
          className="min-h-11 w-full min-w-0 rounded-sm border border-warm-grey/70 bg-cream pl-6 pr-2 font-sans text-base text-charcoal outline-none focus:border-charcoal focus:ring-2 focus:ring-opal-electric-accessible/30"
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
        className={cn(controlClass, 'justify-center bg-charcoal text-cream hover:bg-charcoal-dark')}
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
          'h-auto w-auto justify-start rounded-sm border-warm-grey/70 bg-cream py-0 pr-3 shadow-none hover:border-charcoal/50 focus:ring-0 data-[state=open]:border-charcoal [&>span]:line-clamp-none',
          className
        )}
      >
        <span className="font-normal text-charcoal/60">Sort:</span>
        <SelectValue />
        {pending && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-charcoal/60" />}
      </SelectTrigger>
      <SelectContent
        align="end"
        className="min-w-[13rem] rounded-sm border-warm-grey/70 bg-cream text-charcoal shadow-lg"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-11 cursor-pointer rounded-sm py-2 pl-3 font-sans text-sm text-charcoal focus:bg-cream-dark focus:text-charcoal data-[state=checked]:font-semibold"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

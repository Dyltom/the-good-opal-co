'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

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

  return (
    <label className={cn(controlClass, 'relative font-normal focus-within:ring-2 focus-within:ring-opal-electric-accessible focus-within:ring-offset-2', className)}>
      <span className="text-charcoal/60">Sort</span>
      <select
        key={value}
        defaultValue={value}
        onChange={(event) => {
          const option = options.find((entry) => entry.value === event.target.value)
          if (option) router.push(option.href, { scroll: false })
        }}
        className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 font-semibold text-charcoal outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 h-4 w-4 text-charcoal/60" />
    </label>
  )
}

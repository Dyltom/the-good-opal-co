import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark',
        className
      )}
    >
      {children}
    </p>
  )
}

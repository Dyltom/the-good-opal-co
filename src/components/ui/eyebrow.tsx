import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-sans text-xs font-medium uppercase tracking-[0.06em] text-ink-3',
        className
      )}
    >
      {children}
    </p>
  )
}

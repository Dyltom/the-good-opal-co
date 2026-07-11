import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  align?: 'left' | 'center'
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  align = 'left',
}: PageHeaderProps) {
  return (
    <header className={cn('max-w-4xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          'mt-4 text-balance font-serif text-5xl font-medium leading-none text-charcoal sm:text-6xl',
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description ? (
        <div
          className={cn(
            'mt-7 max-w-2xl font-sans text-lg leading-8 text-charcoal/70',
            align === 'center' && 'mx-auto',
            descriptionClassName,
          )}
        >
          {description}
        </div>
      ) : null}
    </header>
  )
}

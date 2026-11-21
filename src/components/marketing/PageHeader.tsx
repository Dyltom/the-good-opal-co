import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  align?: 'left' | 'center'
}

export function PageHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  align = 'left',
}: PageHeaderProps) {
  return (
    <header className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <h1 className={cn('text-ink', titleClassName)}>{title}</h1>
      {description ? (
        <div
          className={cn(
            'mt-2.5 max-w-[60ch] text-base leading-relaxed text-ink-2',
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

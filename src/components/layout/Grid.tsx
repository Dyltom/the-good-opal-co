import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '@/types'

/**
 * Grid Props
 */
interface GridProps extends BaseComponentProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

/**
 * Grid Component
 * Responsive grid layout with configurable columns and gap
 */
export function Grid({
  children,
  cols = 3,
  gap = 'md',
  responsive = true,
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        // Gap variants
        gap === 'sm' && 'gap-4',
        gap === 'md' && 'gap-6',
        gap === 'lg' && 'gap-8',
        // Column variants (with responsive options)
        responsive
          ? {
              1: 'grid-cols-1',
              2: 'grid-cols-1 sm:grid-cols-2',
              3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
              6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
              12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
            }[cols]
          : `grid-cols-${cols}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

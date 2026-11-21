import { cn } from '@/lib/utils'
import type { SectionProps } from '@/types'

/**
 * Section Component
 * Reusable section wrapper with background and padding options
 */
export function Section({
  children,
  background = 'default',
  padding = 'md',
  fullWidth = false,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'w-full',
        // Background variants
        background === 'muted' && 'bg-plinth',
        background === 'accent' && 'bg-plinth text-ink',
        background === 'dark' && 'bg-ink text-bg',
        // Padding variants
        padding === 'none' && 'py-0',
        padding === 'sm' && 'py-8 sm:py-10',
        padding === 'md' && 'py-10 sm:py-14',
        (padding === 'lg' || padding === 'xl') && 'py-sec',
        fullWidth && 'px-0',
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

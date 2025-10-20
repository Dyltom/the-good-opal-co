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
        background === 'default' && 'bg-background',
        background === 'muted' && 'bg-muted',
        background === 'accent' && 'bg-accent text-accent-foreground',
        background === 'dark' && 'bg-foreground text-background',
        // Padding variants
        padding === 'none' && 'py-0',
        padding === 'sm' && 'py-8 sm:py-12',
        padding === 'md' && 'py-12 sm:py-16 lg:py-20',
        padding === 'lg' && 'py-16 sm:py-20 lg:py-24',
        padding === 'xl' && 'py-20 sm:py-24 lg:py-32',
        fullWidth && 'px-0',
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

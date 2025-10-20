import { cn } from '@/lib/utils'
import type { ContainerProps } from '@/types'

/**
 * Container Component
 * Responsive container with configurable max-width and padding
 */
export function Container({
  children,
  maxWidth = 'xl',
  padding = true,
  centered = true,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        maxWidth === 'sm' && 'max-w-screen-sm',
        maxWidth === 'md' && 'max-w-screen-md',
        maxWidth === 'lg' && 'max-w-screen-lg',
        maxWidth === 'xl' && 'max-w-screen-xl',
        maxWidth === '2xl' && 'max-w-screen-2xl',
        maxWidth === 'full' && 'max-w-full',
        padding && 'px-4 sm:px-6 lg:px-8',
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

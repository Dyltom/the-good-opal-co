import { cn } from '@/lib/utils'

/**
 * Skeleton Props
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Skeleton Component
 * Loading placeholder animation
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

/**
 * Card Skeleton
 * Loading state for card components
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

/**
 * Blog Card Skeleton
 */
export function BlogCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

/**
 * Text Skeleton
 * Loading state for text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/**
 * Avatar Skeleton
 */
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Skeleton
      className={cn(
        'rounded-full',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16'
      )}
    />
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 py-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

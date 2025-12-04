import { cn } from '@/lib/utils'

/**
 * Loading State Components
 * Following 2025 best practices for perceived performance
 */

interface LoadingProps {
  className?: string
}

/**
 * Spinner Loading State
 */
export function Spinner({ className }: LoadingProps) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
  )
}

/**
 * Shimmer Loading State
 */
export function Shimmer({ className }: LoadingProps) {
  return (
    <div className={cn('animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent', className)} />
  )
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4" />
      <div className="space-y-2 px-1 py-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

/**
 * Product Grid Skeleton
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Cart Item Skeleton
 */
export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border rounded-lg animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-2 mt-4">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-16 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  )
}

/**
 * Button Loading State
 */
export function ButtonLoading({ children, className }: { children?: React.ReactNode, className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner className="w-4 h-4" />
      {children || 'Loading...'}
    </span>
  )
}

/**
 * Page Loading State
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Opal-inspired loading animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-opal via-brand-fire to-brand-emerald animate-spin" />
          <div className="absolute inset-2 rounded-full bg-white" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-opal via-brand-fire to-brand-emerald animate-pulse" />
        </div>
        <p className="text-lg font-medium text-content-muted animate-pulse">
          Loading your treasures...
        </p>
      </div>
    </div>
  )
}

/**
 * Inline Loading State
 */
export function InlineLoading({ text = 'Loading' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-content-muted">
      {text}
      <span className="inline-flex gap-1">
        <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </span>
  )
}
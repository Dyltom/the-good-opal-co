import Link from 'next/link'
import { Button } from './button'
import { cn } from '@/lib/utils'
import type { EmptyStateProps } from '@/types'

/**
 * Empty State Component
 * Display when no content is available
 * DRY component for consistent empty states throughout the app
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && <div className="text-6xl mb-4 opacity-20">{icon}</div>}

      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {description && <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>}

      {action && (
        <Button asChild>
          <Link href={action.href} target={action.external ? '_blank' : undefined}>
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  )
}

/**
 * No Results Component
 * Specific empty state for search/filter results
 */
export function NoResults({
  query,
  onReset,
}: {
  query?: string
  onReset?: () => void
}) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={
        query
          ? `No results for "${query}". Try adjusting your search or filters.`
          : 'No results match your current filters.'
      }
      action={onReset ? { href: '#', label: 'Clear Filters' } : undefined}
    />
  )
}

/**
 * No Content Component
 * Empty state when no content exists yet
 */
export function NoContent({
  resource,
  createAction,
}: {
  resource: string
  createAction?: { href: string; label: string }
}) {
  return (
    <EmptyState
      icon="📝"
      title={`No ${resource} yet`}
      description={`Get started by creating your first ${resource.toLowerCase()}.`}
      action={createAction}
    />
  )
}

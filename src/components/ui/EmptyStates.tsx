import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag, Search, Heart, Package, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

/**
 * Reusable Empty State Component
 * Following 2025 UX best practices for helpful empty states
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-6 p-4 bg-surface-secondary rounded-full">
          {icon}
        </div>
      )}

      <h3 className="text-2xl font-semibold mb-3 text-content-inverse">
        {title}
      </h3>

      <p className="text-content-muted max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {action && (
          action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Button variant="outline" asChild>
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Cart Empty State
 */
export function CartEmptyState() {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-12 h-12 text-content-muted" />}
      title="Your cart is empty"
      description="Looks like you haven't added any treasures yet. Explore our collection of unique Australian opals."
      action={{
        label: "Start Shopping",
        href: "/store"
      }}
      secondaryAction={{
        label: "Browse Categories",
        href: "/store"
      }}
    />
  )
}

/**
 * Search No Results State
 */
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-12 h-12 text-content-muted" />}
      title="No results found"
      description={`We couldn't find any opals matching "${query}". Try adjusting your search or browse our categories.`}
      action={{
        label: "Browse All Opals",
        href: "/store"
      }}
      secondaryAction={{
        label: "Clear Filters",
        onClick: () => window.location.reload()
      }}
    />
  )
}

/**
 * Wishlist Empty State
 */
export function WishlistEmptyState() {
  return (
    <EmptyState
      icon={<Heart className="w-12 h-12 text-content-muted" />}
      title="Your wishlist is empty"
      description="Save your favorite opals to your wishlist and we'll keep them here for you."
      action={{
        label: "Explore Collection",
        href: "/store"
      }}
    />
  )
}

/**
 * Orders Empty State
 */
export function OrdersEmptyState() {
  return (
    <EmptyState
      icon={<Package className="w-12 h-12 text-content-muted" />}
      title="No orders yet"
      description="When you make your first purchase, your order history will appear here."
      action={{
        label: "Start Shopping",
        href: "/store"
      }}
    />
  )
}

/**
 * Error Empty State
 */
export function ErrorEmptyState({
  title = "Something went wrong",
  description = "We encountered an error loading this content. Please try again.",
  onRetry
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12 text-status-error" />}
      title={title}
      description={description}
      action={{
        label: "Try Again",
        onClick: onRetry || (() => window.location.reload())
      }}
      secondaryAction={{
        label: "Go Home",
        href: "/"
      }}
    />
  )
}
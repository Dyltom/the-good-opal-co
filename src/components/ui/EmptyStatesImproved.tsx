import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag, Search, Heart, Package, AlertCircle, Sparkles, Gem } from 'lucide-react'
import { motion } from 'framer-motion'
import { mobileScale } from '@/lib/animations/mobile-variants'

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
 * Enhanced Empty State Component with animations
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
    <motion.div
      variants={mobileScale}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center ${className}`}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 p-6 bg-gradient-to-br from-opal-sky to-opal-light/50 rounded-full shadow-lg"
        >
          {icon}
        </motion.div>
      )}

      <h3 className="text-2xl font-display font-semibold mb-3 text-charcoal">
        {title}
      </h3>

      <p className="text-content-muted max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {action && (
          action.href ? (
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} size="lg" className="shadow-lg hover:shadow-xl transition-all">
              {action.label}
            </Button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Button variant="outline" asChild size="lg">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick} size="lg">
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </motion.div>
  )
}

/**
 * Cart Empty State with product suggestions
 */
export function CartEmptyState() {
  return (
    <div className="max-w-4xl mx-auto">
      <EmptyState
        icon={<ShoppingBag className="w-14 h-14 text-opal-electric" />}
        title="Your treasure chest is empty"
        description="Start your collection with our handpicked Australian opals. Each piece is unique and waiting to find its home."
        action={{
          label: "Explore Opals",
          href: "/store"
        }}
      />

      {/* Quick Category Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-content-muted mb-4">Quick Links:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/store?category=raw-opals"
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Raw Opals
          </Link>
          <Link
            href="/store?category=opal-rings"
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Rings
          </Link>
          <Link
            href="/store?category=opal-necklaces"
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Necklaces
          </Link>
          <Link
            href="/store?featured=true"
            className="px-4 py-2 rounded-full bg-opal-electric/10 hover:bg-opal-electric/20 text-opal-electric-accessible font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Featured
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Search No Results State with suggestions
 */
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-14 h-14 text-opal-electric" />}
      title="No matches found"
      description={`We couldn't find any opals matching "${query}". Try different keywords or browse our categories.`}
      action={{
        label: "Browse All",
        href: "/store"
      }}
      secondaryAction={{
        label: "Clear Search",
        onClick: () => {
          // Clear the search
          const searchParams = new URLSearchParams(window.location.search)
          searchParams.delete('search')
          searchParams.delete('q')
          window.location.href = window.location.pathname +
            (searchParams.toString() ? `?${searchParams.toString()}` : '')
        }
      }}
    />
  )
}

/**
 * Collection Empty State (for filtered results)
 */
export function CollectionEmptyState() {
  return (
    <EmptyState
      icon={<Gem className="w-14 h-14 text-opal-electric" />}
      title="No opals match your filters"
      description="Try adjusting your filters to see more of our beautiful collection."
      action={{
        label: "Clear All Filters",
        onClick: () => {
          window.location.href = '/store'
        }
      }}
      secondaryAction={{
        label: "View All Products",
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
      icon={<Package className="w-14 h-14 text-opal-electric" />}
      title="No orders yet"
      description="Start your opal journey today. Your order history will appear here."
      action={{
        label: "Start Shopping",
        href: "/store"
      }}
    />
  )
}

/**
 * Error Empty State with retry
 */
export function ErrorEmptyState({
  title = "Oops! Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-14 h-14 text-fire-pink-dark" />}
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
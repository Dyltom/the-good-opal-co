import { TrendingUp, Sparkles, Eye, Clock } from 'lucide-react'

interface StockBadgeProps {
  stock: number
  variant?: 'default' | 'compact'
}

/**
 * Stock Indicator Badge
 * Shows urgency based on stock levels
 */
export function StockBadge({ stock, variant = 'default' }: StockBadgeProps) {
  // Determine urgency level
  const getStockInfo = () => {
    if (stock === 0) {
      return {
        text: 'Sold Out',
        bgColor: 'bg-error-light',
        textColor: 'text-error-dark',
        borderColor: 'border-error',
      }
    } else if (stock === 1) {
      return {
        text: 'Only 1 left!',
        bgColor: 'bg-warning-light',
        textColor: 'text-warning-dark',
        borderColor: 'border-warning',
      }
    } else if (stock <= 3) {
      return {
        text: `Only ${stock} left`,
        bgColor: 'bg-warning-light',
        textColor: 'text-warning-dark',
        borderColor: 'border-warning',
      }
    } else if (stock <= 10) {
      return {
        text: 'Low stock',
        bgColor: 'bg-info-light',
        textColor: 'text-info-dark',
        borderColor: 'border-info',
      }
    }
    return {
      text: 'In stock',
      bgColor: 'bg-success-light',
      textColor: 'text-success-dark',
      borderColor: 'border-success',
    }
  }

  const stockInfo = getStockInfo()

  if (variant === 'compact') {
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${stockInfo.bgColor} ${stockInfo.textColor}`}
      >
        {stockInfo.text}
      </span>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${stockInfo.bgColor} ${stockInfo.textColor} ${stockInfo.borderColor}`}
    >
      <div className={`w-2 h-2 rounded-full ${stockInfo.textColor} animate-pulse`} />
      <span className="text-sm font-semibold">{stockInfo.text}</span>
    </div>
  )
}

/**
 * "New Arrival" badge
 */
export function NewBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-opal-pink via-opal-purple to-opal-blue text-white shadow-lg">
      <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-bold uppercase tracking-wide">New</span>
    </div>
  )
}

/**
 * "Trending" badge
 */
export function TrendingBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-opal-gold text-white">
      <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-semibold uppercase tracking-wide">Trending</span>
    </div>
  )
}

/**
 * Social proof indicators
 */
interface SocialProofProps {
  viewCount?: number
  lastSoldDaysAgo?: number
  variant?: 'default' | 'compact'
}

export function SocialProof({ viewCount, lastSoldDaysAgo, variant = 'default' }: SocialProofProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-xs text-charcoal-60">
        {viewCount && (
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{viewCount} viewing</span>
          </div>
        )}
        {lastSoldDaysAgo !== undefined && lastSoldDaysAgo < 7 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Sold {lastSoldDaysAgo === 0 ? 'today' : `${lastSoldDaysAgo}d ago`}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {viewCount && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-grey-light rounded-full">
          <Eye className="w-4 h-4 text-charcoal-60" />
          <span className="text-sm text-charcoal">
            <strong>{viewCount}</strong> people viewing
          </span>
        </div>
      )}
      {lastSoldDaysAgo !== undefined && lastSoldDaysAgo < 7 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-light rounded-full">
          <Clock className="w-4 h-4 text-success-dark" />
          <span className="text-sm text-success-dark">
            Last sold{' '}
            <strong>
              {lastSoldDaysAgo === 0 ? 'today' : `${lastSoldDaysAgo} day${lastSoldDaysAgo > 1 ? 's' : ''} ago`}
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Limited Edition badge
 */
export function LimitedEditionBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-cream">
      <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-bold uppercase tracking-wider">One of a Kind</span>
    </div>
  )
}

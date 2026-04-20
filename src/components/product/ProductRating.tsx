'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductRatingProps {
  rating: number
  reviewCount?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCount?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

const sizeMap = {
  xs: { star: 'w-3 h-3', text: 'text-xs' },
  sm: { star: 'w-4 h-4', text: 'text-sm' },
  md: { star: 'w-5 h-5', text: 'text-base' },
  lg: { star: 'w-6 h-6', text: 'text-lg' },
}

/**
 * Product Rating Component
 * Displays star ratings with optional review count
 */
export function ProductRating({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  interactive = false,
  onRatingChange,
  className,
}: ProductRatingProps) {
  const { star: starSize, text: textSize } = sizeMap[size]
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex)
    }
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => {
          const starNumber = index + 1
          const isFilled = starNumber <= fullStars
          const isHalf = starNumber === fullStars + 1 && hasHalfStar

          return (
            <button
              key={index}
              onClick={() => handleStarClick(starNumber)}
              disabled={!interactive}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              aria-label={`Rate ${starNumber} stars`}
            >
              {isHalf ? (
                <div className="relative">
                  <Star className={cn(starSize, "fill-gray-200 text-gray-200")} />
                  <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <Star className={cn(starSize, "fill-fire-gold text-fire-gold")} />
                  </div>
                </div>
              ) : (
                <Star
                  className={cn(
                    starSize,
                    isFilled
                      ? "fill-fire-gold text-fire-gold"
                      : "fill-gray-200 text-gray-200",
                    interactive && "transition-colors"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {showCount && reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", textSize)}>
          ({reviewCount})
        </span>
      )}

      {!showCount && rating > 0 && (
        <span className={cn("font-medium", textSize)}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

/**
 * Review Stars Component
 * Simplified star display for reviews
 */
export function ReviewStars({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const { star: starSize } = sizeMap[size]

  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            starSize,
            index < rating
              ? "fill-fire-gold text-fire-gold"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Rating Summary Component
 * Shows rating breakdown by stars
 */
export function RatingSummary({
  ratings,
  totalReviews,
}: {
  ratings: { stars: number; count: number }[]
  totalReviews: number
}) {
  const averageRating = ratings.reduce((acc, r) => acc + r.stars * r.count, 0) / totalReviews

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <ProductRating rating={averageRating} showCount={false} size="md" />
          <p className="text-sm text-muted-foreground mt-1">{totalReviews} reviews</p>
        </div>

        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const rating = ratings.find((r) => r.stars === stars) || { count: 0 }
            const percentage = (rating.count / totalReviews) * 100

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-2">{stars}</span>
                <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-fire-gold transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {rating.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Verified Purchase Badge
 */
export function VerifiedPurchaseBadge() {
  return (
    <div className="flex items-center gap-1.5 text-sm text-green-600">
      <svg
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>Verified Purchase</span>
    </div>
  )
}
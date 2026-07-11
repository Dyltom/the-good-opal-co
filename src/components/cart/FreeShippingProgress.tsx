import { getFreeShippingProgress } from '@/lib/constants/shipping'
import { cn, formatCurrency } from '@/lib/utils'

interface FreeShippingProgressProps {
  total: number
  className?: string
}

export function FreeShippingProgress({ total, className }: FreeShippingProgressProps) {
  const progress = getFreeShippingProgress(total)

  return (
    <div className={cn('space-y-2 rounded-xl border border-warm-grey/40 bg-white p-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-sm font-semibold text-charcoal">
          Free shipping
        </p>
        <p className="font-sans text-xs text-charcoal/60">
          {progress.qualifies ? 'Unlocked' : `${formatCurrency(progress.remaining, 'AUD')} away`}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-warm-grey/40"
        role="progressbar"
        aria-label="Free shipping progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
      >
        <div
          className="h-full rounded-full bg-opal-electric-accessible transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="font-sans text-xs leading-relaxed text-charcoal/65" aria-live="polite">
        {progress.message}
      </p>
    </div>
  )
}

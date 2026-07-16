import { getFreeShippingProgress } from '@/lib/constants/shipping'
import { cn } from '@/lib/utils'

interface FreeShippingProgressProps {
  total: number
  className?: string
}

export function FreeShippingProgress({ total, className }: FreeShippingProgressProps) {
  const progress = getFreeShippingProgress(total)

  return (
    <div className={cn('space-y-2 rounded-xl border border-warm-grey/40 bg-white p-4', className)}>
      <p className="font-sans text-sm font-semibold text-charcoal">
        Free shipping
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-warm-grey/40"
        role="progressbar"
        aria-label="Free shipping progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
      >
        <div
          className="h-full w-full origin-left rounded-full bg-opal-electric-accessible transition-transform duration-500 ease-out-expo motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress.percent / 100})` }}
        />
      </div>
      <p className="font-sans text-xs leading-relaxed text-charcoal/65" aria-live="polite">
        {progress.message}
      </p>
    </div>
  )
}

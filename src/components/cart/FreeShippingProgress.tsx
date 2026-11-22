import { getFreeShippingProgress } from '@/lib/constants/shipping'
import { cn } from '@/lib/utils'

interface FreeShippingProgressProps {
  total: number
  className?: string
}

export function FreeShippingProgress({ total, className }: FreeShippingProgressProps) {
  const progress = getFreeShippingProgress(total)

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="h-2 overflow-hidden rounded-full bg-plinth"
        role="progressbar"
        aria-label="Free shipping progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
      >
        <div
          className="h-full w-full origin-left rounded-full bg-ink transition-transform duration-500 ease-gallery motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress.percent / 100})` }}
        />
      </div>
      <p className="font-sans text-xs leading-relaxed text-ink-2" aria-live="polite">
        {progress.message}
      </p>
    </div>
  )
}

import { Lock } from 'lucide-react'

/**
 * Compact payment badges for checkout
 */
export function PaymentBadgesCompact() {
  return (
    <div className="flex items-center gap-2 text-xs text-charcoal/60">
      <Lock className="w-3.5 h-3.5 text-success" />
      <span>Secure checkout with</span>
      <div className="flex gap-1.5">
        <span className="font-semibold">Visa</span>
        <span className="font-semibold">Mastercard</span>
        <span className="font-semibold">Amex</span>
      </div>
    </div>
  )
}

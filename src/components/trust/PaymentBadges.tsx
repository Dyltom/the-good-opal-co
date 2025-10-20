import { Lock } from 'lucide-react'

/**
 * Payment Badges Component
 * Displays secure payment icons and SSL badge
 * Use in footer and checkout pages
 */
export function PaymentBadges() {
  return (
    <div className="space-y-3">
      {/* SSL Secure */}
      <div className="flex items-center justify-center gap-2 text-sm text-charcoal-60">
        <Lock className="w-4 h-4 text-success" />
        <span className="font-medium">Secure SSL Encrypted Checkout</span>
      </div>

      {/* Payment methods */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Stripe */}
        <div className="px-3 py-1.5 bg-white border border-warm-grey rounded text-xs font-semibold text-charcoal">
          Stripe
        </div>

        {/* Visa */}
        <div className="px-3 py-1.5 bg-white border border-warm-grey rounded">
          <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <path d="M19.5 22L22.5 10H26L23 22H19.5Z" fill="white"/>
            <path d="M34 10.5L30.8 22H27.5L26.3 15.2L25.2 22H21.8L25 10.5H28.2L29.4 17.2L30.6 10.5H34Z" fill="white"/>
          </svg>
        </div>

        {/* Mastercard */}
        <div className="px-3 py-1.5 bg-white border border-warm-grey rounded">
          <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="black"/>
            <circle cx="18" cy="16" r="8" fill="#EB001B"/>
            <circle cx="30" cy="16" r="8" fill="#FF5F00"/>
            <path d="M24 10C26.2 11.5 27.5 13.6 27.5 16C27.5 18.4 26.2 20.5 24 22C21.8 20.5 20.5 18.4 20.5 16C20.5 13.6 21.8 11.5 24 10Z" fill="#F79E1B"/>
          </svg>
        </div>

        {/* Amex */}
        <div className="px-3 py-1.5 bg-white border border-warm-grey rounded">
          <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#006FCF"/>
            <path d="M20 11H24L26 16L28 11H32L28 21H24L26 16L24 21H20L16 11H20L22 16L24 11Z" fill="white"/>
          </svg>
        </div>

        {/* Apple Pay */}
        <div className="px-3 py-1.5 bg-white border border-warm-grey rounded">
          <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="black"/>
            <path d="M14.5 12.5C14.5 11.5 15.2 10.5 16 10C15.3 9 14.2 8.5 13.2 8.5C11.8 8.5 10.5 9.5 10 10.5C9.5 9.5 8.2 8.5 6.8 8.5C5.8 8.5 4.7 9 4 10C4.8 10.5 5.5 11.5 5.5 12.5C5.5 14.5 3.5 17 3.5 19.5C3.5 21.5 5 23 7 23C8.5 23 9.5 22 10 21C10.5 22 11.5 23 13 23C15 23 16.5 21.5 16.5 19.5C16.5 17 14.5 14.5 14.5 12.5Z" fill="white"/>
            <text x="20" y="20" fill="white" fontSize="10" fontFamily="system-ui">Pay</text>
          </svg>
        </div>
      </div>

      {/* Powered by Stripe */}
      <p className="text-center text-xs text-charcoal-40">
        Payments powered by{' '}
        <span className="font-semibold text-charcoal-60">Stripe</span>
      </p>
    </div>
  )
}

/**
 * Compact payment badges for checkout
 */
export function PaymentBadgesCompact() {
  return (
    <div className="flex items-center gap-2 text-xs text-charcoal-60">
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

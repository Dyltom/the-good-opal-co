import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export const METHODS_ENABLED_IN_STRIPE = ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Klarna']

export function PaymentMethods({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="flex items-center gap-1.5 font-sans text-xs text-charcoal/65">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Secure payment by Stripe. Pay in full or in instalments.
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Accepted payment methods">
        {METHODS_ENABLED_IN_STRIPE.map((method) => (
          <li
            key={method}
            className="border border-warm-grey/70 bg-white px-2 py-1 font-sans text-[11px] font-semibold leading-none text-charcoal/75"
          >
            {method}
          </li>
        ))}
      </ul>
    </div>
  )
}

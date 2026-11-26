import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_PAYMENT_METHODS } from '@/lib/constants/payment'

export function PaymentMethods({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="flex items-center gap-1.5 font-sans text-xs text-ink-2">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Secure payment by Stripe or PayPal. Pay in full or in instalments.
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Accepted payment methods">
        {ACCEPTED_PAYMENT_METHODS.map((method) => (
          <li
            key={method}
            className="border border-rule bg-bg px-2 py-1 font-sans text-[11px] font-semibold leading-none text-ink"
          >
            {method}
          </li>
        ))}
      </ul>
    </div>
  )
}

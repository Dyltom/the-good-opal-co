'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CheckoutEmail {
  email: string
  marketingConsent: boolean
}

interface CheckoutEmailFieldsProps {
  value: CheckoutEmail
  onChange: (value: CheckoutEmail) => void
  className?: string
}

export function CheckoutEmailFields({ value, onChange, className }: CheckoutEmailFieldsProps) {
  const emailId = useId()
  const hasEmail = value.email.trim().length > 0

  return (
    <div className={cn('min-w-0', className)}>
      <label
        htmlFor={emailId}
        className="mb-2 block text-xs font-medium uppercase tracking-[0.06em] text-ink-3"
      >
        Email <span className="normal-case tracking-normal">(optional)</span>
      </label>
      <Input
        id={emailId}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={value.email}
        onChange={(event) => {
          const email = event.target.value
          onChange({ email, marketingConsent: email.trim() ? value.marketingConsent : false })
        }}
        className="h-11"
      />
      <label
        className={cn(
          'mt-2 flex items-start gap-3 text-[12.5px] leading-5 text-ink-2',
          !hasEmail && 'opacity-60'
        )}
      >
        <input
          type="checkbox"
          checked={hasEmail && value.marketingConsent}
          disabled={!hasEmail}
          onChange={(event) => onChange({ ...value, marketingConsent: event.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink disabled:cursor-not-allowed"
        />
        Email me a reminder if I leave pieces in my bag, plus new pieces and offers. Unsubscribe any
        time.
      </label>
    </div>
  )
}

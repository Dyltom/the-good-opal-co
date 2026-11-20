'use client'

import { useActionState, useId } from 'react'
import { subscribeToNewsletter } from '@/app/(marketing)/newsletter/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NewsletterForm({ className }: { className?: string }) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null)
  const emailId = useId()

  return (
    <form action={formAction} className={cn('w-full space-y-3', className)}>
      <input type="hidden" name="source" value="footer" />
      <div className="flex gap-3">
        <div className="relative flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/40" aria-hidden="true" />
          <Input
            name="email"
            id={emailId}
            type="email"
            placeholder="Your email"
            required
            className="h-12 pl-10"
            autoComplete="email"
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 bg-cream px-5 text-charcoal hover:bg-white"
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>

      {state ? (
        <div
          className={cn('flex items-start gap-2 text-sm', state.success ? 'text-opal-light' : 'text-red-300')}
          role="status"
          aria-live="polite"
        >
          {state.success ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{state.message}</span>
        </div>
      ) : null}

      <p className="text-xs leading-5 text-white/60">
        Occasional emails about new pieces. Unsubscribe anytime.
      </p>
    </form>
  )
}

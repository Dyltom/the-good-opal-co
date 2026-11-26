'use client'

import { useActionState, useEffect, useId, useState } from 'react'
import { subscribeToNewsletter } from '@/app/(marketing)/newsletter/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NewsletterForm({ className, alert }: { className?: string; alert?: string }) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null)
  const emailId = useId()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  return (
    <form action={formAction} className={cn('w-full space-y-3', className)}>
      <input type="hidden" name="source" value="footer" />
      <input type="hidden" name="js" value={hydrated ? '1' : ''} />
      {alert ? <input type="hidden" name="alert" value={alert} /> : null}
      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <Input
            name="email"
            id={emailId}
            type="email"
            placeholder="Your email"
            required
            className="h-12"
            autoComplete="email"
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 px-5"
        >
          {isPending ? 'Sending…' : alert ? 'Tell me' : 'Subscribe'}
        </Button>
      </div>

      {state ? (
        <div
          className={cn('flex items-start gap-2 text-sm', state.success ? 'text-success' : 'text-destructive')}
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

      <p className="text-xs leading-5 text-ink-3">
        {alert
          ? "We'll email you when a similar piece is listed. You'll also get new pieces and offers from Steph's list. Unsubscribe any time."
          : "One code per email address. Welcome codes can't be used during storewide sales. Unsubscribe anytime."}
      </p>
    </form>
  )
}

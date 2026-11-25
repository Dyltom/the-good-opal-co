'use client'

import { useActionState, useEffect, useId, useState } from 'react'
import { emailMyBag } from '@/app/(marketing)/cart/email-bag'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function EmailBagForm({ className }: { className?: string }) {
  const [state, formAction, isPending] = useActionState(emailMyBag, null)
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const emailId = useId()
  useEffect(() => setHydrated(true), [])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex min-h-11 items-center text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          className
        )}
      >
        Email me this bag
      </button>
    )
  }

  return (
    <form action={formAction} className={cn('space-y-2', className)}>
      <input type="hidden" name="js" value={hydrated ? '1' : ''} />
      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor={emailId} className="block text-[13px] text-ink-2">
        We will email you a link to each piece. No mailing list.
      </label>
      <div className="flex gap-2">
        <Input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className="h-11 min-w-0 flex-1"
          disabled={isPending}
          autoFocus
        />
        <Button type="submit" variant="quiet" className="h-11" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send'}
        </Button>
      </div>
      {state ? (
        <p
          role="status"
          aria-live="polite"
          className={cn('text-[13px]', state.success ? 'text-success' : 'text-destructive')}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}

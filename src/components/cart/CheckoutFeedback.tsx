'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureInsight } from '@/lib/insights/client'
import {
  CHECKOUT_FEEDBACK_NOTE_MAX,
  CHECKOUT_FEEDBACK_REASONS,
  type CheckoutFeedbackReason,
} from '@/lib/insights/events'
import { cn } from '@/lib/utils'

export type CheckoutFeedbackSource = 'cancelled' | 'cart'

const ASKED_KEY = 'checkout-feedback-asked'
const REASONS = Object.entries(CHECKOUT_FEEDBACK_REASONS) as [CheckoutFeedbackReason, string][]

export function useCancelledCheckoutPrompt(onCancelled: () => void): void {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('checkout') !== 'cancelled') return
    url.searchParams.delete('checkout')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    try {
      if (sessionStorage.getItem(ASKED_KEY)) return
      sessionStorage.setItem(ASKED_KEY, '1')
    } catch {
      return
    }
    onCancelled()
  }, [onCancelled])
}

interface CheckoutFeedbackProps {
  source: CheckoutFeedbackSource
  onClose: () => void
  onSent: () => void
  className?: string
}

export function CheckoutFeedback({ source, onClose, onSent, className }: CheckoutFeedbackProps) {
  const [reason, setReason] = useState<CheckoutFeedbackReason>()
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const titleId = `checkout-feedback-${source}`

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reason) return
    const trimmed = note.trim().slice(0, CHECKOUT_FEEDBACK_NOTE_MAX)
    captureInsight('checkout_feedback', {
      detail: trimmed ? { reason, source, note: trimmed } : { reason, source },
    })
    setSent(true)
    onSent()
  }

  return (
    <section
      aria-label="Checkout feedback"
      className={cn('relative border border-rule bg-bg p-4 pr-12 sm:p-5 sm:pr-14', className)}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      {sent ? (
        <p role="status" className="text-sm leading-6 text-ink">
          Thank you, that helps us a lot.
        </p>
      ) : (
        <form onSubmit={submit}>
          <h2 id={titleId} className="font-serif text-xl font-semibold text-ink">
            {source === 'cancelled' ? 'Not quite ready?' : 'What would help?'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-2">
            {source === 'cancelled'
              ? 'No rush, your pieces are still in your cart. If you have a moment, what held you back?'
              : 'Tell us what is holding you back. It helps us make the shop better.'}
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">What held you back</legend>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    'inline-flex min-h-11 cursor-pointer items-center border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-accent',
                    reason === value
                      ? 'border-ink bg-ink text-bg'
                      : 'border-rule bg-bg text-ink hover:border-ink'
                  )}
                >
                  <input
                    type="radio"
                    name={`${titleId}-reason`}
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-4 block text-sm text-ink-2">
            Anything else? (optional)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={CHECKOUT_FEEDBACK_NOTE_MAX}
              rows={2}
              className="mt-1 block w-full resize-y border border-rule bg-bg px-3 py-2 text-base text-ink sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <Button type="submit" size="sm" disabled={!reason} className="mt-3 min-h-11">
            Send
          </Button>
        </form>
      )}
    </section>
  )
}

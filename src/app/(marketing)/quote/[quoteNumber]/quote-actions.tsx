'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  acceptCustomQuote,
  createCustomQuoteDepositCheckout,
  type QuoteActionState,
} from './actions'

const initialState: QuoteActionState = { success: false }

export function QuoteActions({
  depositAmountCents,
  depositStatus,
  quoteNumber,
  status,
}: {
  depositAmountCents: number
  depositStatus: 'not-required' | 'awaiting-payment' | 'paid' | 'refunded'
  quoteNumber: string
  status: 'sent' | 'accepted'
}) {
  const router = useRouter()
  const [acceptance, acceptAction, accepting] = useActionState(
    acceptCustomQuote.bind(null, quoteNumber),
    initialState
  )
  const [deposit, depositAction, startingPayment] = useActionState(
    createCustomQuoteDepositCheckout.bind(null, quoteNumber),
    initialState
  )

  useEffect(() => {
    if (acceptance.success) router.refresh()
  }, [acceptance.success, router])

  useEffect(() => {
    if (deposit.url) window.location.assign(deposit.url)
  }, [deposit.url])

  if (status === 'sent') {
    return (
      <form
        action={acceptAction}
        className="rounded-2xl border border-charcoal/15 bg-white p-6 sm:p-8"
      >
        <label className="flex min-h-11 cursor-pointer items-start gap-4 font-sans text-sm leading-6 text-charcoal">
          <input
            type="checkbox"
            name="accepted"
            required
            className="mt-1 size-5 shrink-0 accent-charcoal"
          />
          <span>
            I accept quote {quoteNumber}, including its scope, price, deposit, timing and
            cancellation terms. I understand custom work is excluded from change-of-mind returns;
            Australian Consumer Law rights remain.
          </span>
        </label>
        <Button type="submit" disabled={accepting} className="mt-6 min-h-11 w-full sm:w-auto">
          {accepting ? 'Recording acceptance…' : 'Accept this quote'}
        </Button>
        <ActionMessage state={acceptance} />
      </form>
    )
  }

  if (depositStatus === 'awaiting-payment' && depositAmountCents > 0) {
    return (
      <form
        action={depositAction}
        className="rounded-2xl border border-charcoal/15 bg-white p-6 sm:p-8"
      >
        <h2 className="font-serif text-2xl text-charcoal">Secure your commission</h2>
        <p className="mt-3 font-sans text-sm leading-6 text-charcoal/70">
          Your accepted terms are locked. Stripe securely processes the exact deposit shown above.
        </p>
        <Button type="submit" disabled={startingPayment} className="mt-6 min-h-11 w-full sm:w-auto">
          {startingPayment ? 'Opening secure payment…' : 'Pay deposit securely'}
        </Button>
        <ActionMessage state={deposit} />
      </form>
    )
  }

  return null
}

function ActionMessage({ state }: { state: QuoteActionState }) {
  const message = state.error ?? state.message
  if (!message) return null
  return (
    <p
      className={`mt-4 font-sans text-sm ${state.error ? 'text-red-700' : 'text-emerald-800'}`}
      role={state.error ? 'alert' : 'status'}
      aria-live="polite"
    >
      {message}
    </p>
  )
}

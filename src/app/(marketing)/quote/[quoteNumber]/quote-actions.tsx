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
      <form action={acceptAction} className="bg-plinth p-5 sm:p-7">
        <label className="flex min-h-11 cursor-pointer items-start gap-4 text-sm leading-6 text-ink">
          <input
            type="checkbox"
            name="accepted"
            required
            className="mt-1 size-5 shrink-0 accent-ink"
          />
          <span>
            I accept quote {quoteNumber}, including its scope, price, deposit, timing and
            cancellation terms. I understand custom work is excluded from change-of-mind returns;
            Australian Consumer Law rights remain.
          </span>
        </label>
        <Button type="submit" disabled={accepting} className="mt-5 w-full sm:w-auto">
          {accepting ? 'Recording acceptance…' : 'Accept this quote'}
        </Button>
        <ActionMessage state={acceptance} />
      </form>
    )
  }

  if (depositStatus === 'awaiting-payment' && depositAmountCents > 0) {
    return (
      <form action={depositAction} className="bg-plinth p-5 sm:p-7">
        <h2 className="text-[1.5rem] leading-tight">Secure your commission</h2>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Your accepted terms are locked. Stripe securely processes the exact deposit shown above.
        </p>
        <Button type="submit" disabled={startingPayment} className="mt-5 w-full sm:w-auto">
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
      className={`mt-4 text-sm ${state.error ? 'text-destructive' : 'text-success'}`}
      role={state.error ? 'alert' : 'status'}
      aria-live="polite"
    >
      {message}
    </p>
  )
}

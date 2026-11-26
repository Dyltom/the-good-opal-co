'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import type { JoinListState } from '@/lib/newsletter/checkout-buyer'
import { joinListFromCheckout } from './actions'

export function JoinList({ reference }: { reference: string }) {
  const [state, join, pending] = useActionState<JoinListState>(
    () => joinListFromCheckout(reference),
    { status: 'idle', message: '' }
  )

  return (
    <section className="mt-8 bg-plinth px-5 py-5 md:px-6">
      <h2 className="font-serif text-[1.375rem] leading-[1.15] text-ink">New pieces by email</h2>
      <p className="mt-2 text-sm leading-6 text-ink-2">
        Hear when new opals and pieces go up, and when we run a sale. About once a month, and you
        can unsubscribe from any email.
      </p>
      {state.status === 'joined' ? (
        <p className="mt-4 text-sm font-medium text-ink" role="status">
          {state.message}
        </p>
      ) : (
        <form action={join} className="mt-4">
          <Button type="submit" variant="ghost" disabled={pending}>
            {pending ? 'Adding you…' : 'Email me new pieces'}
          </Button>
          {state.status === 'error' ? (
            <p className="mt-3 text-sm text-ink-2" role="alert">
              {state.message}
            </p>
          ) : null}
        </form>
      )}
    </section>
  )
}

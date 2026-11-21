'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Checkout error:', error)
  }, [error])

  return (
    <div className="px-gut pb-sec pt-8 md:pt-14">
      <div className="mx-auto max-w-[640px]">
        <h1 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.04] tracking-[-0.02em] text-ink">
          Checkout error
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">
          We encountered an issue processing your checkout. Don&apos;t worry, no payment has been taken.
        </p>
        <p className="mt-4 border-y border-rule py-3 text-sm text-ink">
          Your bag is safe and no charges have been made to your card.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={reset}>Try checkout again</Button>
          <Button asChild variant="ghost">
            <Link href="/cart">Return to your bag</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-ink-2">
          Still having issues?{' '}
          <Link href="/contact" className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}

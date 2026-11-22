'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { trackClientError } from '@/lib/analytics'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    trackClientError(
      error.digest ? `Server error ${error.digest}` : error.message,
      'error boundary'
    )
  }, [error])

  return (
    <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
      <div className="max-w-[60ch]">
        <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
          Something went wrong on our end.
        </h1>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
          Your bag and any order you completed are safe. Please try again, or contact us if it
          keeps happening.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        {process.env['NODE_ENV'] === 'development' && error.message && (
          <div className="mt-6 border-l-2 border-destructive bg-plinth px-4 py-3">
            <p className="font-mono text-sm text-destructive">{error.message}</p>
          </div>
        )}
      </div>
    </Container>
  )
}

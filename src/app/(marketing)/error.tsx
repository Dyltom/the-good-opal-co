'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'

/**
 * Global Error Page
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error(error)
  }, [error])

  return (
    <Section padding="lg">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Something went wrong on our end.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-charcoal/70">
            Your cart and any order you completed are safe. Please try again, or contact us if it
            keeps happening.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to home</Link>
            </Button>
          </div>

          {process.env['NODE_ENV'] === 'development' && error.message && (
            <div className="mt-8 rounded-lg bg-destructive/10 p-4 text-left">
              <p className="font-mono text-sm text-destructive">{error.message}</p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}

'use client'

import { useEffect } from 'react'
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
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-6xl font-bold text-destructive mb-4">Error</h1>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We apologize for the inconvenience. An error has occurred.
          </p>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button asChild variant="outline">
              <button onClick={() => window.location.href = '/'}>Go Home</button>
            </Button>
          </div>

          {process.env['NODE_ENV'] === 'development' && error.message && (
            <div className="mt-8 p-4 bg-destructive/10 rounded-lg text-left">
              <p className="font-mono text-sm text-destructive">{error.message}</p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}

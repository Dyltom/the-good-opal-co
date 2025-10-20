'use client'

import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isDBError = error.message?.includes('connect') || error.message?.includes('Postgres')

  return (
    <Section padding="lg">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-destructive mb-4">
            {isDBError ? 'Database Not Connected' : 'Admin Panel Error'}
          </h1>

          {isDBError ? (
            <>
              <p className="text-lg text-muted-foreground mb-8">
                The admin panel requires a database connection. Please set up your database first.
              </p>
              <div className="bg-muted p-6 rounded-lg text-left mb-8">
                <h3 className="font-semibold mb-4">Quick Setup:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Start Docker: <code className="bg-background px-2 py-1 rounded">pnpm docker:up</code></li>
                  <li>Or set <code className="bg-background px-2 py-1 rounded">DATABASE_URL</code> in .env.local</li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
            </>
          ) : (
            <p className="text-lg text-muted-foreground mb-8">
              An error occurred in the admin panel.
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>

          {process.env['NODE_ENV'] === 'development' && error.message && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm font-semibold mb-2">Error Details</summary>
              <pre className="p-4 bg-destructive/10 rounded-lg text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </Container>
    </Section>
  )
}

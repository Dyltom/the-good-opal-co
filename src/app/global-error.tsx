'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { trackClientError } from '@/lib/analytics'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    trackClientError(error.digest ? `Server error ${error.digest}` : error.message, 'global error')
  }, [error])

  return (
    <html lang="en-AU">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f5f2ec',
          color: '#1c1813',
          fontFamily: 'system-ui, sans-serif',
          padding: 16,
        }}
      >
        <main style={{ maxWidth: '60ch' }}>
          <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: '0 0 12px' }}>
            Something went wrong on our end.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
            Your bag and any order you completed are safe. Please reload the page, or contact us if
            it keeps happening.
          </p>
          <Link href="/" style={{ color: '#7a5c24' }}>
            Back to home
          </Link>
        </main>
      </body>
    </html>
  )
}

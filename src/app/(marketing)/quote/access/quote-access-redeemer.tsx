'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'

export function QuoteAccessRedeemer() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = window.location.hash.slice(1)
    window.history.replaceState(null, '', '/quote/access')
    if (!token) {
      setError('This secure quote link is unavailable. Please request a fresh link from us.')
      return
    }

    const controller = new AbortController()
    void fetch('/api/quote/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as { error?: string; redirectTo?: string }
        if (!response.ok || !result.redirectTo) {
          throw new Error(result.error ?? 'This secure quote link is unavailable.')
        }
        window.location.replace(result.redirectTo)
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(
          reason instanceof Error ? reason.message : 'This secure quote link is unavailable.'
        )
      })

    return () => controller.abort()
  }, [])

  return (
    <MarketingShell>
      <main className="bg-bg py-24 sm:py-32">
        <Container className="max-w-xl text-center">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Private quote
          </p>
          <h1 className="mt-4 font-serif text-4xl text-ink">Opening your secure quote</h1>
          <p className="mt-5 font-sans leading-7 text-ink-2" aria-live="polite">
            {error ?? 'Verifying the private link…'}
          </p>
          {error && (
            <p className="mt-6 font-sans text-sm text-ink-2">
              Secure quote links require JavaScript. Contact us if you need another way to review
              the quote.
            </p>
          )}
        </Container>
      </main>
    </MarketingShell>
  )
}

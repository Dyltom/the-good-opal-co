'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout'

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
    <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            Opening your secure quote
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2" aria-live="polite">
            {error ?? 'Verifying the private link…'}
          </p>
          {error && (
            <p className="mt-4 text-sm leading-6 text-ink-3">
              Secure quote links require JavaScript. Contact us if you need another way to review
              the quote.
            </p>
          )}
        </div>
    </Container>
  )
}

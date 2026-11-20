'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackClientError } from '@/lib/analytics'
import { captureInsight } from '@/lib/insights/client'

const MAX_ERRORS_PER_PAGE = 5

function sameOriginSource(filename: string): boolean {
  if (!filename) return true
  try {
    return new URL(filename, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

function rejectionMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  return typeof reason === 'string' ? reason : 'Unhandled promise rejection'
}

export function InsightsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    captureInsight('page_view')
  }, [pathname])

  useEffect(() => {
    const seen = new Set<string>()
    const report = (message: string, source?: string) => {
      const text = message.trim().slice(0, 300)
      if (!text || seen.has(text) || seen.size >= MAX_ERRORS_PER_PAGE) return
      seen.add(text)
      trackClientError(text, source)
    }
    const onError = (event: ErrorEvent) => {
      if (event.message === 'Script error.' || !sameOriginSource(event.filename)) return
      report(event.message, event.filename ? new URL(event.filename, window.location.href).pathname : undefined)
    }
    const onRejection = (event: PromiseRejectionEvent) => report(rejectionMessage(event.reason), 'promise')
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}

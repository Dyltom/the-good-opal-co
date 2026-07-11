'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { parseCookiePreferences } from '@/lib/cookie-consent'
import { GoogleAnalyticsProvider } from './GoogleAnalytics'

function analyticsAllowed(): boolean {
  try {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) return false
    return parseCookiePreferences(stored)?.analytics ?? false
  } catch {
    return false
  }
}

export function AnalyticsConsentGate() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed())
    sync()
    window.addEventListener('cookie-consent-updated', sync)
    return () => window.removeEventListener('cookie-consent-updated', sync)
  }, [])

  if (!allowed) return null
  return (
    <>
      <Analytics />
      <GoogleAnalyticsProvider />
    </>
  )
}

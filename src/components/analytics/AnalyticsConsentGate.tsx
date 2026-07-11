'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalyticsProvider } from './GoogleAnalytics'

function analyticsAllowed(): boolean {
  try {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) return false
    const value: unknown = JSON.parse(stored)
    return Boolean(value && typeof value === 'object' && 'analytics' in value && value.analytics)
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

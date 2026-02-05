'use client'

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'

interface GoogleAnalyticsProps {
  measurementId: string
}

/**
 * Google Analytics 4 Component
 * Handles GA4 script loading and page view tracking
 * Single Responsibility: Only manages GA4 integration
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()

  // Track page views on route change
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  if (!measurementId) {
    console.warn('Google Analytics measurement ID not provided')
    return null
  }

  return <NextGoogleAnalytics gaId={measurementId} />
}

/**
 * Wrapper component with conditional rendering
 * Only renders in production
 */
export function GoogleAnalyticsProvider() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId || process.env.NODE_ENV !== 'production') {
    return null
  }

  return <GoogleAnalytics measurementId={measurementId} />
}
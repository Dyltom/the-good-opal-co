'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { trackClientError } from '@/lib/analytics'
import { captureInsight, landingPath } from '@/lib/insights/client'
import { WEB_VITAL_METRICS, type WebVitalMetric } from '@/lib/insights/events'
import { trackEngagement, trackRageClicks } from '@/lib/insights/page-signals'

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

type ReportedMetric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0]

function isTrackedMetric(name: string): name is WebVitalMetric {
  return WEB_VITAL_METRICS.some((metric) => metric === name)
}

function reportWebVital(metric: ReportedMetric) {
  if (!isTrackedMetric(metric.name)) return
  captureInsight('web_vital', {
    path: landingPath(),
    value: metric.name === 'CLS' ? Math.round(metric.value * 1000) / 1000 : Math.round(metric.value),
    detail: { metric: metric.name, rating: metric.rating },
  })
}

export function InsightsTracker() {
  const pathname = usePathname()
  useReportWebVitals(reportWebVital)

  useEffect(() => {
    captureInsight('page_view')
    return trackEngagement(pathname)
  }, [pathname])

  useEffect(() => trackRageClicks(), [])

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

import {
  INSIGHTS_ENDPOINT,
  type ClientInsightEvent,
  type InsightDetail,
} from './events'

interface Entry {
  landing: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

let entry: Entry | undefined

function captureEntry(): Entry {
  if (entry) return entry
  const params = new URLSearchParams(window.location.search)
  entry = {
    landing: window.location.pathname,
    referrer: document.referrer || undefined,
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
  }
  return entry
}

export function landingPath(): string | undefined {
  return typeof window === 'undefined' ? undefined : captureEntry().landing
}

export interface InsightOptions {
  path?: string
  productId?: string
  value?: number
  detail?: InsightDetail
}

export function captureInsight(name: ClientInsightEvent, options: InsightOptions = {}): void {
  if (typeof window === 'undefined') return
  const path = options.path ?? window.location.pathname
  if (path.startsWith('/admin')) return
  try {
    const { landing, referrer, utmSource, utmMedium, utmCampaign } = captureEntry()
    const body = JSON.stringify({
      name,
      path,
      landing,
      referrer: referrer?.slice(0, 500),
      utmSource: utmSource?.slice(0, 100),
      utmMedium: utmMedium?.slice(0, 100),
      utmCampaign: utmCampaign?.slice(0, 100),
      productId: options.productId,
      value: options.value,
      detail: options.detail,
    })
    if (navigator.sendBeacon?.(INSIGHTS_ENDPOINT, body)) return
    void fetch(INSIGHTS_ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    return
  }
}

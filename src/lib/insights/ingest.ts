import { createHash } from 'node:crypto'
import { z } from 'zod'
import {
  CHECKOUT_FEEDBACK_NOTE_MAX,
  CHECKOUT_FEEDBACK_REASONS,
  CLIENT_INSIGHT_EVENTS,
  WEB_VITAL_METRICS,
  type ClientInsightEvent,
  type InsightDetail,
} from './events'

export const MAX_INSIGHT_BODY_BYTES = 2048

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional()

const sitePath = z.string().startsWith('/').max(300)

export const insightPayloadSchema = z
  .object({
    name: z.enum(CLIENT_INSIGHT_EVENTS),
    path: sitePath,
    landing: sitePath.optional(),
    referrer: z.string().max(500).optional(),
    utmSource: optionalText(100),
    utmMedium: optionalText(100),
    utmCampaign: optionalText(100),
    productId: z
      .string()
      .regex(/^[\w-]{1,40}$/)
      .optional(),
    value: z.number().finite().min(0).max(10_000_000).optional(),
    detail: z
      .record(
        z.string().regex(/^[a-zA-Z]{1,24}$/),
        z.union([z.string().max(300), z.number().finite(), z.boolean()])
      )
      .refine((detail) => Object.keys(detail).length <= 8, 'Too many detail fields')
      .optional(),
  })
  .strict()

export type InsightPayload = z.infer<typeof insightPayloadSchema>

const percent = z.number().int().min(0).max(100)

const eventDetailSchemas: Partial<Record<ClientInsightEvent, z.ZodType<InsightDetail>>> = {
  engagement: z
    .object({
      seconds: z.number().int().min(0).max(1800),
      scroll: percent,
      sawPhotos: z.boolean().optional(),
      sawPrice: z.boolean().optional(),
      sawDetails: z.boolean().optional(),
    })
    .strict(),
  web_vital: z
    .object({
      metric: z.enum(WEB_VITAL_METRICS),
      rating: z.enum(['good', 'needs-improvement', 'poor']),
    })
    .strict(),
  rage_click: z.object({ target: z.string().trim().min(1).max(80) }).strict(),
  checkout_feedback: z
    .object({
      reason: z.enum(Object.keys(CHECKOUT_FEEDBACK_REASONS) as [keyof typeof CHECKOUT_FEEDBACK_REASONS]),
      source: z.enum(['cancelled', 'cart']),
      note: z
        .string()
        .trim()
        .max(CHECKOUT_FEEDBACK_NOTE_MAX)
        .transform((note) => note || undefined)
        .optional(),
    })
    .strict()
    .transform(({ note, ...rest }) => (note ? { ...rest, note } : rest)),
}

const requiresValue: ReadonlySet<ClientInsightEvent> = new Set(['web_vital'])

export type ParsedInsight =
  | { ok: true; payload: InsightPayload }
  | { ok: false; status: 400 | 413 }

export function parseInsightBody(body: string): ParsedInsight {
  if (new TextEncoder().encode(body).length > MAX_INSIGHT_BODY_BYTES) {
    return { ok: false, status: 413 }
  }
  let json: unknown
  try {
    json = JSON.parse(body)
  } catch {
    return { ok: false, status: 400 }
  }
  const result = insightPayloadSchema.safeParse(json)
  if (!result.success) return { ok: false, status: 400 }
  const payload = result.data
  if (requiresValue.has(payload.name) && payload.value === undefined) return { ok: false, status: 400 }
  const detailSchema = eventDetailSchemas[payload.name]
  if (!detailSchema) return { ok: true, payload }
  const detail = detailSchema.safeParse(payload.detail)
  return detail.success ? { ok: true, payload: { ...payload, detail: detail.data } } : { ok: false, status: 400 }
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|scrap|headless|lighthouse|pagespeed|preview|prerender|monitor|uptime|pingdom|phantom|puppeteer|playwright|selenium|webdriver|curl|wget|python|httpclient|okhttp|java\/|go-http|axios|node-fetch|undici|facebookexternalhit|embedly|whatsapp|telegram|discord|skype|vercel-/i

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  return !userAgent || userAgent.length < 20 || BOT_PATTERN.test(userAgent)
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function deviceType(userAgent: string): DeviceType {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet'
  if (/Mobi|iPhone|iPod|Windows Phone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

export function browserFamily(userAgent: string): string {
  if (/Edg(e|A|iOS)?\//.test(userAgent)) return 'Edge'
  if (/OPR\/|Opera/.test(userAgent)) return 'Opera'
  if (/SamsungBrowser\//.test(userAgent)) return 'Samsung Internet'
  if (/Firefox\/|FxiOS\//.test(userAgent)) return 'Firefox'
  if (/Chrome\/|CriOS\//.test(userAgent)) return 'Chrome'
  if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) return 'Safari'
  return 'Other'
}

export function requestCountry(headers: Headers): string | undefined {
  const country = (headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry'))
    ?.trim()
    .toUpperCase()
  return country && /^[A-Z]{2}$/.test(country) && country !== 'XX' ? country : undefined
}

export function requestIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

export function hashVisitor(salt: string, ip: string, userAgent: string): string {
  return createHash('sha256').update(`${salt}|${ip}|${userAgent}`).digest('hex').slice(0, 32)
}

export function referrerHost(referrer: string | undefined, ownHost: string): string | undefined {
  if (!referrer) return undefined
  try {
    const url = new URL(referrer)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    return host && host !== ownHost.toLowerCase().replace(/^www\./, '') ? host : undefined
  } catch {
    return undefined
  }
}

export function normalisePath(path: string): string {
  const pathname = path.split(/[?#]/)[0] || '/'
  if (pathname === '/quote' || pathname.startsWith('/quote/')) return '/quote'
  return pathname.slice(0, 200)
}

export interface InsightRequestContext {
  userAgent: string
  visitor: string
  country?: string
  ownHost: string
  now: Date
}

export function toInsightRow(payload: InsightPayload, context: InsightRequestContext) {
  return {
    name: payload.name,
    path: normalisePath(payload.path),
    landingPage: payload.landing ? normalisePath(payload.landing) : undefined,
    productId: payload.productId,
    value: payload.value,
    visitor: context.visitor,
    referrerHost: referrerHost(payload.referrer, context.ownHost),
    utmSource: payload.utmSource,
    utmMedium: payload.utmMedium,
    utmCampaign: payload.utmCampaign,
    country: context.country,
    device: deviceType(context.userAgent),
    browser: browserFamily(context.userAgent),
    detail: payload.detail,
    occurredAt: context.now.toISOString(),
  }
}

import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  MAX_INSIGHT_BODY_BYTES,
  isBotUserAgent,
  parseInsightBody,
  requestCountry,
  toInsightRow,
} from '@/lib/insights/ingest'
import { saveInsight } from '@/lib/insights/record'
import { visitorKey } from '@/lib/insights/visitor'

function empty(status: number): Response {
  return new Response(null, { status })
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_INSIGHT_BODY_BYTES) return empty(413)

  const userAgent = request.headers.get('user-agent')
  if (isBotUserAgent(userAgent) || !userAgent) return empty(204)

  const parsed = parseInsightBody(await request.text())
  if (!parsed.ok) return empty(parsed.status)

  try {
    const now = new Date()
    const visitor = await visitorKey(request.headers, now)
    const allowed = await checkRateLimit({
      scope: 'insights',
      identifier: visitor,
      limit: 120,
      windowSeconds: 60,
    })
    if (!allowed) return empty(429)

    await saveInsight(
      toInsightRow(parsed.payload, {
        userAgent,
        visitor,
        country: requestCountry(request.headers),
        ownHost: request.nextUrl.hostname,
        now,
      })
    )
    return empty(204)
  } catch (error) {
    console.error('Insight event not stored:', error)
    return empty(503)
  }
}

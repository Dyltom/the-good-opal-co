import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getCustomerQuoteAccess, QUOTE_ACCESS_COOKIE } from '@/lib/custom-quotes/customer-access'

const bodySchema = z.object({ token: z.string().min(1).max(1024) }).strict()

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null))
  if (!body.success) {
    return NextResponse.json({ error: 'This secure quote link is unavailable.' }, { status: 400 })
  }

  try {
    const identifier = await getRequestIdentifier()
    if (
      !(await checkRateLimit({
        scope: 'quote-access',
        identifier,
        limit: 30,
        windowSeconds: 15 * 60,
      }))
    ) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }
  } catch (error) {
    console.error('Quote access abuse protection unavailable:', error)
    return NextResponse.json(
      { error: 'Secure quote access is temporarily unavailable.' },
      { status: 503 }
    )
  }

  const access = await getCustomerQuoteAccess(body.data.token)
  if (!access) {
    return NextResponse.json({ error: 'This secure quote link is unavailable.' }, { status: 404 })
  }

  const response = NextResponse.json({
    redirectTo: `/quote/${encodeURIComponent(access.quote.quoteNumber)}`,
  })
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.cookies.set(QUOTE_ACCESS_COOKIE, body.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/quote',
    maxAge: Math.max(1, access.claims.expiresAt - Math.floor(Date.now() / 1000)),
  })
  return response
}

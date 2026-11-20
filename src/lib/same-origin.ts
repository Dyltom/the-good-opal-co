import type { NextRequest } from 'next/server'

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const publicHost =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host') ||
    request.nextUrl.host
  try {
    return new URL(origin).host === publicHost
  } catch {
    return false
  }
}

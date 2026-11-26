import { NextRequest } from 'next/server'
import { getNewsletterService } from '@/lib/newsletter/service'

function token(request: NextRequest): string {
  return request.nextUrl.searchParams.get('token') ?? ''
}

export async function POST(request: NextRequest) {
  const { success } = await getNewsletterService().unsubscribe(token(request))
  return new Response(null, { status: success ? 200 : 400 })
}

export function GET(request: NextRequest) {
  return new Response(null, {
    status: 303,
    headers: { Location: `/newsletter/unsubscribe?token=${encodeURIComponent(token(request))}` },
  })
}

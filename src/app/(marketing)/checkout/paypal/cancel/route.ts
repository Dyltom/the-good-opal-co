import { NextRequest, NextResponse } from 'next/server'
import { APP_URL } from '@/lib/constants'
import { cancelPayPalCheckout } from '@/lib/paypal-checkout'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const destination = await cancelPayPalCheckout(request.nextUrl.searchParams.get('token') ?? '')
  return NextResponse.redirect(new URL(destination, APP_URL), 303)
}

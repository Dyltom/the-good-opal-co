import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendPieceAlerts } from '@/lib/piece-alerts'

export const maxDuration = 300

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(supplied)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await sendPieceAlerts())
}

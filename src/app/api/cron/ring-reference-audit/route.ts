import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auditInstagramReferences } from '@/lib/custom-builder/instagram-reference-audit'

export const maxDuration = 120

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

  if (process.env.RING_REFERENCE_AUDIT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Ring reference audit is disabled' }, { status: 409 })
  }

  try {
    const result = await auditInstagramReferences()
    console.info('Instagram ring reference audit completed', result)
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Instagram ring reference audit failed', error)
    return NextResponse.json({ error: 'Instagram reference audit failed' }, { status: 500 })
  }
}

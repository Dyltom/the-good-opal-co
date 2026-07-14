import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { processBuilderMappings } from '@/lib/custom-builder/mapping-processor'

export const maxDuration = 300

const DEFAULT_BATCH_SIZE = 10
const MAX_BATCH_SIZE = 25

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(supplied)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function batchSize(): number {
  const configured = Number.parseInt(process.env.BUILDER_MAPPING_BATCH_SIZE ?? '', 10)
  if (!Number.isInteger(configured) || configured < 1) return DEFAULT_BATCH_SIZE
  return Math.min(configured, MAX_BATCH_SIZE)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await processBuilderMappings({ limit: batchSize() })
    console.info('Opal builder mapping cron completed', result)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown builder mapping error'
    console.error('Opal builder mapping cron failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

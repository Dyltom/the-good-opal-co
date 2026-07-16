import { timingSafeEqual } from 'node:crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import { persistCanonicalFaceArtifact } from '@/lib/custom-builder/canonical-face-artifact-store'
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
    const result = await processBuilderMappings({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: batchSize(),
    })
    const degradedReasons = [
      ...(result.failed > 0 ? ['processing-failures'] : []),
      ...(result.coverage.failedCurrent > 0 ? ['coverage-failures'] : []),
    ]
    const degraded = degradedReasons.length > 0
    const body = { ...result, degraded, degradedReasons }
    if (degraded) {
      console.error('Opal builder mapping cron completed with failures', body)
    } else {
      console.info('Opal builder mapping cron completed', body)
    }
    return NextResponse.json(body, { status: degraded ? 503 : 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown builder mapping error'
    console.error('Opal builder mapping cron failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const requestedProductId = request.nextUrl.searchParams.get('productId')
  const productId = requestedProductId ? Number(requestedProductId) : undefined
  if (
    requestedProductId &&
    (!Number.isSafeInteger(productId) || productId === undefined || productId < 1)
  ) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
  }

  after(async () => {
    try {
      const result = await processBuilderMappings({
        canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
        limit: batchSize(),
        ...(productId !== undefined ? { productId } : {}),
      })
      console.info('Opal builder mapping event trigger completed', result)
    } catch (error: unknown) {
      console.error('Opal builder mapping event trigger failed; scheduled cron remains fallback', error)
    }
  })

  return NextResponse.json({ queued: true }, { status: 202 })
}

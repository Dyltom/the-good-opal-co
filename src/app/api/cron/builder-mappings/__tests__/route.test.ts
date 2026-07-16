import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { afterMock, persistCanonicalFaceArtifact, processBuilderMappings } = vi.hoisted(() => ({
  afterMock: vi.fn(),
  persistCanonicalFaceArtifact: vi.fn(),
  processBuilderMappings: vi.fn(),
}))

vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: afterMock,
}))
vi.mock('@/lib/custom-builder/canonical-face-artifact-store', () => ({
  persistCanonicalFaceArtifact,
}))
vi.mock('@/lib/custom-builder/mapping-processor', () => ({ processBuilderMappings }))

import { GET, POST } from '../route'

function request(secret = 'cron-test-secret') {
  return new NextRequest('https://example.com/api/cron/builder-mappings', {
    headers: { authorization: `Bearer ${secret}` },
  })
}

function productRequest(productId: string) {
  return new NextRequest(
    `https://example.com/api/cron/builder-mappings?productId=${encodeURIComponent(productId)}`,
    { headers: { authorization: 'Bearer cron-test-secret' }, method: 'POST' }
  )
}

describe('builder mapping cron', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-test-secret')
    processBuilderMappings.mockResolvedValue({
      analyzed: 2,
      checked: 3,
      coverage: { failedCurrent: 0 },
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      unchanged: 1,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  test('requires the Vercel cron bearer secret', async () => {
    const response = await GET(request('wrong-secret'))

    expect(response.status).toBe(401)
    expect(processBuilderMappings).not.toHaveBeenCalled()
  })

  test('processes a bounded configured batch', async () => {
    vi.stubEnv('BUILDER_MAPPING_BATCH_SIZE', '500')

    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(processBuilderMappings).toHaveBeenCalledWith({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: 25,
    })
    await expect(response.json()).resolves.toEqual({
      analyzed: 2,
      checked: 3,
      coverage: { failedCurrent: 0 },
      degraded: false,
      degradedReasons: [],
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      unchanged: 1,
    })
  })

  test('returns a failing status when per-product mapping work is degraded', async () => {
    processBuilderMappings.mockResolvedValue({
      analyzed: 0,
      checked: 1,
      coverage: { failedCurrent: 1 },
      failed: 1,
      manual: 0,
      nonIndividual: 0,
      unchanged: 0,
    })

    const response = await GET(request())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      degraded: true,
      degradedReasons: ['processing-failures', 'coverage-failures'],
    })
  })

  test('accepts one event wake-up and runs the worker after the response', async () => {
    let scheduled: (() => Promise<void>) | undefined
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      scheduled = callback
    })

    const response = await POST(productRequest('42'))

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toEqual({ queued: true })
    expect(processBuilderMappings).not.toHaveBeenCalled()

    await scheduled?.()
    expect(processBuilderMappings).toHaveBeenCalledWith({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: 10,
      productId: 42,
    })
  })

  test('rejects an invalid event product id before scheduling work', async () => {
    const response = await POST(productRequest('not-a-product'))
    expect(response.status).toBe(400)
    expect(afterMock).not.toHaveBeenCalled()
    expect(processBuilderMappings).not.toHaveBeenCalled()
  })

  test('does not recursively queue when event processing fails', async () => {
    let scheduled: (() => Promise<void>) | undefined
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      scheduled = callback
    })
    processBuilderMappings.mockRejectedValue(new Error('database unavailable'))

    const response = await POST(request())

    expect(response.status).toBe(202)
    await expect(scheduled?.()).resolves.toBeUndefined()
    expect(processBuilderMappings).toHaveBeenCalledOnce()
    expect(afterMock).toHaveBeenCalledOnce()
  })

  test('reports worker failures without exposing a successful response', async () => {
    processBuilderMappings.mockRejectedValue(new Error('database unavailable'))

    const response = await GET(request())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'database unavailable' })
  })
})

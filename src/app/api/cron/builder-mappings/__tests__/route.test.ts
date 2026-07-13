import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { processBuilderMappings } = vi.hoisted(() => ({
  processBuilderMappings: vi.fn(),
}))

vi.mock('@/lib/custom-builder/mapping-processor', () => ({ processBuilderMappings }))

import { GET } from '../route'

function request(secret = 'cron-test-secret') {
  return new NextRequest('https://example.com/api/cron/builder-mappings', {
    headers: { authorization: `Bearer ${secret}` },
  })
}

describe('builder mapping cron', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-test-secret')
    processBuilderMappings.mockResolvedValue({
      analyzed: 2,
      checked: 3,
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
    expect(processBuilderMappings).toHaveBeenCalledWith({ limit: 25 })
    await expect(response.json()).resolves.toEqual({
      analyzed: 2,
      checked: 3,
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      unchanged: 1,
    })
  })

  test('reports worker failures without exposing a successful response', async () => {
    processBuilderMappings.mockRejectedValue(new Error('database unavailable'))

    const response = await GET(request())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'database unavailable' })
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { auditInstagramReferences } = vi.hoisted(() => ({
  auditInstagramReferences: vi.fn(),
}))

vi.mock('@/lib/custom-builder/instagram-reference-audit', () => ({ auditInstagramReferences }))

import { GET } from '../route'

function request(secret?: string) {
  return new NextRequest('https://example.com/api/cron/ring-reference-audit', {
    headers: secret === undefined ? undefined : { authorization: `Bearer ${secret}` },
  })
}

describe('Instagram ring reference audit cron', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-test-secret')
    vi.stubEnv('RING_REFERENCE_AUDIT_ENABLED', 'true')
    auditInstagramReferences.mockResolvedValue({
      available: 9,
      checked: 10,
      failed: 1,
      recorded: 10,
      redirected: 0,
      skipped: 1,
    })
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it.each([
    ['missing', undefined],
    ['incorrect', 'wrong-secret'],
  ])('rejects %s authorization', async (_case, secret) => {
    const response = await GET(request(secret))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(auditInstagramReferences).not.toHaveBeenCalled()
  })

  it('stays inert until the audit is explicitly enabled', async () => {
    vi.stubEnv('RING_REFERENCE_AUDIT_ENABLED', 'false')

    const response = await GET(request('cron-test-secret'))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ error: 'Ring reference audit is disabled' })
    expect(auditInstagramReferences).not.toHaveBeenCalled()
  })

  it('runs the audit and returns its summary', async () => {
    const response = await GET(request('cron-test-secret'))

    expect(response.status).toBe(200)
    expect(auditInstagramReferences).toHaveBeenCalledOnce()
    await expect(response.json()).resolves.toEqual({
      available: 9,
      checked: 10,
      failed: 1,
      recorded: 10,
      redirected: 0,
      skipped: 1,
    })
    expect(console.info).toHaveBeenCalledWith('Instagram ring reference audit completed', {
      available: 9,
      checked: 10,
      failed: 1,
      recorded: 10,
      redirected: 0,
      skipped: 1,
    })
  })

  it('logs worker failures without exposing internal details', async () => {
    const failure = new Error('Instagram token expired for account 17841400000000000')
    auditInstagramReferences.mockRejectedValue(failure)

    const response = await GET(request('cron-test-secret'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Instagram reference audit failed' })
    expect(console.error).toHaveBeenCalledWith('Instagram ring reference audit failed', failure)
  })
})

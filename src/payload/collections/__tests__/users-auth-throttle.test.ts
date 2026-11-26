import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { throttleAuthAttempts } from '../Users'

function attempt(operation: string, address: string) {
  const req = { headers: new Headers({ 'x-real-ip': address }) } as unknown as PayloadRequest
  return throttleAuthAttempts({ args: {}, operation, req } as unknown as Parameters<
    typeof throttleAuthAttempts
  >[0])
}

describe('admin sign-in throttle', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_KV_REST_API_URL', '')
  })

  it('refuses the eleventh login or reset attempt from one address within 15 minutes', async () => {
    for (let i = 0; i < 5; i++) await attempt('login', '198.51.100.20')
    for (let i = 0; i < 5; i++) await attempt('forgotPassword', '198.51.100.20')

    await expect(attempt('login', '198.51.100.20')).rejects.toMatchObject({ status: 429 })
    await expect(attempt('login', '198.51.100.21')).resolves.toEqual({})
  })

  it('never throttles ordinary reads', async () => {
    for (let i = 0; i < 20; i++) await attempt('read', '198.51.100.30')

    await expect(attempt('read', '198.51.100.30')).resolves.toEqual({})
  })
})

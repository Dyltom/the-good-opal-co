import type { PayloadRequest } from 'payload'
import { describe, expect, test } from 'vitest'
import { signedInAccessEndpoint } from '../access-endpoint'

describe('Payload access endpoint', () => {
  test('refuses anonymous callers before revealing the permission schema', async () => {
    const response = await signedInAccessEndpoint.handler({ user: null } as PayloadRequest)

    expect(response.status).toBe(401)
  })
})

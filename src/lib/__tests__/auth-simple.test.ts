import { afterEach, describe, expect, test, vi } from 'vitest'

const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET

async function importAuthSimple() {
  vi.resetModules()
  vi.doMock('@/lib/payload', () => ({
    getPayload: vi.fn(),
  }))
  return import('../auth-simple')
}

describe('auth-simple JWT secret handling', () => {
  afterEach(() => {
    if (ORIGINAL_JWT_SECRET === undefined) {
      delete process.env.JWT_SECRET
    } else {
      process.env.JWT_SECRET = ORIGINAL_JWT_SECRET
    }
    vi.resetModules()
  })

  test('can be imported when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET

    await expect(importAuthSimple()).resolves.toHaveProperty('verifyToken')
  })

  test('returns null when verifying a token without JWT_SECRET', async () => {
    delete process.env.JWT_SECRET
    const { verifyToken } = await importAuthSimple()

    expect(verifyToken('token-value')).toBeNull()
  })

  test('requires JWT_SECRET only when creating a token', async () => {
    delete process.env.JWT_SECRET
    const { createToken } = await importAuthSimple()

    expect(() =>
      createToken({
        id: 'user-1',
        email: 'opal@example.com',
      })
    ).toThrow('JWT_SECRET environment variable is required but not set')
  })
})

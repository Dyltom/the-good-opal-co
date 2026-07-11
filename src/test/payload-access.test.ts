import { describe, expect, test } from 'vitest'
import type { Access, PayloadRequest } from 'payload'
import { isAdmin, isAdminOrFirstUser, isAdminOrSelf, publishedOrAdmin } from '@/lib/payload-access'

function args(user: PayloadRequest['user']): Parameters<Access>[0] {
  return { req: { user } } as Parameters<Access>[0]
}

describe('Payload access rules', () => {
  test('anonymous requests cannot mutate admin data', async () => {
    expect(await isAdmin(args(null))).toBe(false)
  })

  test('non-admin users can only access their own user record', async () => {
    const result = await isAdminOrSelf(args({ id: 42, role: 'user' } as PayloadRequest['user']))

    expect(result).toEqual({ id: { equals: 42 } })
  })

  test('public catalog access is restricted to published records', async () => {
    expect(await publishedOrAdmin(args(null))).toEqual({
      status: { equals: 'published' },
    })
  })

  test('admins retain full access', async () => {
    const request = args({ id: 1, role: 'admin' } as PayloadRequest['user'])

    expect(await isAdmin(request)).toBe(true)
    expect(await isAdminOrSelf(request)).toBe(true)
    expect(await publishedOrAdmin(request)).toBe(true)
  })

  test('only the first anonymous user can bootstrap Payload admin', async () => {
    const previousAdminEmail = process.env.ADMIN_EMAIL
    process.env.ADMIN_EMAIL = 'owner@example.com'
    const firstUserRequest = {
      req: {
        user: null,
        payload: { count: async () => ({ totalDocs: 0 }) },
      },
      data: { email: 'owner@example.com' },
    } as unknown as Parameters<Access>[0]
    const laterUserRequest = {
      req: {
        user: null,
        payload: { count: async () => ({ totalDocs: 1 }) },
      },
      data: { email: 'owner@example.com' },
    } as unknown as Parameters<Access>[0]

    expect(await isAdminOrFirstUser(firstUserRequest)).toBe(true)
    expect(await isAdminOrFirstUser(laterUserRequest)).toBe(false)
    expect(
      await isAdminOrFirstUser({
        ...firstUserRequest,
        data: { email: 'attacker@example.com' },
      })
    ).toBe(false)

    if (previousAdminEmail === undefined) delete process.env.ADMIN_EMAIL
    else process.env.ADMIN_EMAIL = previousAdminEmail
  })
})

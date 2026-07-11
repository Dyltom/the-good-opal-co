import { describe, expect, test } from 'vitest'
import type { Access, PayloadRequest } from 'payload'
import {
  isAdmin,
  isAdminField,
  isAdminOrFirstUser,
  isAdminOrSelf,
  publishedOrAdmin,
  publishedVersionOrAdmin,
} from '@/lib/payload-access'
import { Products } from '@/payload/collections/Products'

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

  test('public catalog responses omit legacy commerce and tenancy fields', () => {
    for (const name of [
      'legacyWooId',
      'wooStatus',
      'wooCatalogVisibility',
      'wooManageStock',
      'wooModifiedAt',
      'tenantId',
    ]) {
      const field = Products.fields.find(
        (candidate) => 'name' in candidate && candidate.name === name
      )
      expect(field && 'access' in field ? field.access?.read : undefined, name).toBe(isAdminField)
    }
  })

  test('public draft-enabled content access uses Payload publication state', async () => {
    expect(await publishedVersionOrAdmin(args(null))).toEqual({
      _status: { equals: 'published' },
    })
  })

  test('admins retain full access', async () => {
    const request = args({ id: 1, role: 'admin' } as PayloadRequest['user'])

    expect(await isAdmin(request)).toBe(true)
    expect(await isAdminOrSelf(request)).toBe(true)
    expect(await publishedOrAdmin(request)).toBe(true)
    expect(await publishedVersionOrAdmin(request)).toBe(true)
  })

  test('only the configured first anonymous user can bootstrap Payload admin locally', async () => {
    const previousAdminEmail = process.env.ADMIN_EMAIL
    process.env.ADMIN_EMAIL = 'owner@example.com'
    const firstUserRequest = {
      req: {
        user: null,
        payload: { count: async () => ({ totalDocs: 0 }) },
      },
      data: { email: 'owner@example.com', password: 'local-password' },
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

  test('production first-user bootstrap requires the temporary bootstrap password', async () => {
    const previousAdminEmail = process.env.ADMIN_EMAIL
    const previousBootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD
    const previousVercelEnvironment = process.env.VERCEL_ENV
    process.env.ADMIN_EMAIL = 'owner@example.com'
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'high-entropy-bootstrap-password'
    process.env.VERCEL_ENV = 'production'

    const request = (password: string | undefined) =>
      ({
        req: {
          user: null,
          payload: { count: async () => ({ totalDocs: 0 }) },
        },
        data: { email: 'owner@example.com', password },
      }) as unknown as Parameters<Access>[0]

    try {
      expect(await isAdminOrFirstUser(request(undefined))).toBe(false)
      expect(await isAdminOrFirstUser(request('incorrect-bootstrap-password'))).toBe(false)
      expect(await isAdminOrFirstUser(request('high-entropy-bootstrap-password'))).toBe(true)

      delete process.env.ADMIN_BOOTSTRAP_PASSWORD
      expect(await isAdminOrFirstUser(request('high-entropy-bootstrap-password'))).toBe(false)

      process.env.ADMIN_BOOTSTRAP_PASSWORD = 'too-short'
      expect(await isAdminOrFirstUser(request('too-short'))).toBe(false)

      process.env.ADMIN_BOOTSTRAP_PASSWORD = 'high-entropy-bootstrap-password'
      delete process.env.ADMIN_EMAIL
      expect(await isAdminOrFirstUser(request('high-entropy-bootstrap-password'))).toBe(false)
    } finally {
      if (previousAdminEmail === undefined) delete process.env.ADMIN_EMAIL
      else process.env.ADMIN_EMAIL = previousAdminEmail
      if (previousBootstrapPassword === undefined) delete process.env.ADMIN_BOOTSTRAP_PASSWORD
      else process.env.ADMIN_BOOTSTRAP_PASSWORD = previousBootstrapPassword
      if (previousVercelEnvironment === undefined) delete process.env.VERCEL_ENV
      else process.env.VERCEL_ENV = previousVercelEnvironment
    }
  })
})

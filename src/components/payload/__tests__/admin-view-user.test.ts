import { describe, expect, test } from 'vitest'
import type { PayloadRequest } from 'payload'
import { requireAdminViewUser } from '../admin-view-user'

describe('custom admin views', () => {
  test('send signed-out visitors to the admin login and back to the view', () => {
    expect(() => requireAdminViewUser({ user: null } as PayloadRequest, '/admin/help')).toThrow(
      expect.objectContaining({ digest: expect.stringContaining('/admin/login?redirect=%2Fadmin%2Fhelp') })
    )
  })

  test('let a signed-in user through', () => {
    const user = { id: 1, role: 'admin' }

    expect(requireAdminViewUser({ user } as unknown as PayloadRequest, '/admin/help')).toBe(user)
  })
})

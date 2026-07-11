import { describe, expect, test, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { promoteFirstUser } from '../Users'

function requestWithUserCount(totalDocs: number) {
  return {
    payload: {
      count: vi.fn().mockResolvedValue({ totalDocs }),
    },
  } as unknown as PayloadRequest
}

describe('first Payload user bootstrap', () => {
  test('promotes exactly the first created user to admin', async () => {
    const result = await promoteFirstUser({
      data: { email: 'owner@example.com', role: 'user' },
      operation: 'create',
      req: requestWithUserCount(0),
      collection: {} as never,
      context: {},
      originalDoc: undefined,
    })

    expect(result).toMatchObject({ role: 'admin' })
  })

  test('does not promote later users', async () => {
    const data = { email: 'staff@example.com', role: 'user' }
    const result = await promoteFirstUser({
      data,
      operation: 'create',
      req: requestWithUserCount(1),
      collection: {} as never,
      context: {},
      originalDoc: undefined,
    })

    expect(result).toEqual(data)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { auth, find } = vi.hoisted(() => ({ auth: vi.fn(), find: vi.fn() }))
vi.mock('@/lib/payload', () => ({ getPayload: async () => ({ auth, find }) }))

import { GET } from '../route'

const request = () => new NextRequest('https://goodopalco.com/api/admin/orders/mypost-csv')

describe('admin MyPost labels CSV endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    find.mockResolvedValue({ docs: [] })
  })

  it('refuses anyone who is not an admin', async () => {
    auth.mockResolvedValue({ user: null })
    expect((await GET(request())).status).toBe(403)
    auth.mockResolvedValue({ user: { id: 2, role: 'editor' } })
    expect((await GET(request())).status).toBe(403)
    expect(find).not.toHaveBeenCalled()
  })

  it('downloads a dated CSV attachment for an admin', async () => {
    auth.mockResolvedValue({ user: { id: 1, role: 'admin' } })
    const response = await GET(request())
    expect(response.status).toBe(200)
    expect(response.headers.get('content-disposition')).toMatch(
      /attachment; filename="australia-post-labels-\d{4}-\d{2}-\d{2}\.csv"/
    )
  })
})

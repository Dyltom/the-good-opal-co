import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  getPayload: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))

import { POST } from '../route'

const admin = { id: 1, role: 'admin', email: 'owner@example.com', _strategy: 'api-key' }

function rpc(
  method: string,
  params: Record<string, unknown> = {},
  key: string | null = 'shop-key'
) {
  const headers: Record<string, string> = {
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
  }
  if (key) headers['authorization'] = `Bearer ${key}`
  return POST(
    new Request('https://example.com/api/mcp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
  )
}

async function callTool(name: string, args: Record<string, unknown>) {
  const response = await rpc('tools/call', { name, arguments: args })
  const body = await response.json()
  return body.result as { isError?: boolean; content: { text: string }[] }
}

const draftInput = {
  name: 'Lightning Ridge black opal ring',
  price: 1450,
  category: 'opal-rings',
  descriptionHtml: '<p>A bright black opal set in silver.</p>',
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getPayload.mockResolvedValue({
    auth: mocks.auth,
    count: mocks.count,
    create: mocks.create,
    find: mocks.find,
    findByID: mocks.findByID,
    update: mocks.update,
    logger: { info: vi.fn() },
  })
  mocks.auth.mockResolvedValue({ user: admin })
  mocks.count.mockResolvedValue({ totalDocs: 0 })
  mocks.create.mockImplementation(async ({ data }) => ({ id: 9, images: [], ...data }))
})

describe('Claude shop MCP endpoint', () => {
  test('refuses a request without an API key', async () => {
    const response = await rpc('tools/list', {}, null)

    expect(response.status).toBe(401)
    expect(mocks.auth).not.toHaveBeenCalled()
  })

  test('refuses an unknown API key', async () => {
    mocks.auth.mockResolvedValue({ user: null })

    const response = await rpc('tools/list')

    expect(response.status).toBe(401)
    expect(mocks.auth.mock.calls[0][0].headers.get('authorization')).toBe('users API-Key shop-key')
  })

  test('refuses an API key that belongs to a customer account', async () => {
    mocks.auth.mockResolvedValue({ user: { ...admin, role: 'user' } })

    const response = await rpc('tools/list')

    expect(response.status).toBe(403)
  })

  test('exposes no delete or publish tools', async () => {
    const response = await rpc('tools/list')
    const names: string[] = (await response.json()).result.tools.map(
      (tool: { name: string }) => tool.name
    )

    expect(names).toContain('create_product_draft')
    expect(names.filter((name) => /delete|remove|publish/.test(name))).toEqual([])
  })

  test('creates products as drafts even when asked to publish', async () => {
    const result = await callTool('create_product_draft', { ...draftInput, status: 'published' })

    expect(result.isError).toBeUndefined()
    expect(mocks.create).toHaveBeenCalledTimes(1)
    const call = mocks.create.mock.calls[0][0]
    expect(call.collection).toBe('products')
    expect(call.data.status).toBe('draft')
    expect(call.overrideAccess).toBe(false)
    expect(call.user).toBe(admin)
  })

  test('will not edit a product that is already live', async () => {
    mocks.findByID.mockResolvedValue({ id: 5, name: 'Live ring', status: 'published' })

    const result = await callTool('update_product_draft', { id: 5, price: 1 })

    expect(result.isError).toBe(true)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test('lists orders without customer contact details', async () => {
    mocks.find.mockResolvedValue({
      totalDocs: 1,
      docs: [
        {
          orderNumber: 'GOC-1001',
          orderPlacedAt: '2026-11-20T00:00:00.000Z',
          status: 'processing',
          customer: { name: 'Sam Buyer', email: 'sam@example.com', phone: '0400000000' },
          shippingAddress: { line1: '1 Opal St', city: 'Cowra' },
          items: [{ name: 'Opal ring', quantity: 1, price: 1450 }],
          total: 1450,
          currency: 'AUD',
        },
      ],
    })

    const result = await callTool('list_recent_orders', {})
    const text = result.content[0]!.text

    expect(text).toContain('Sam Buyer')
    expect(text).not.toContain('sam@example.com')
    expect(text).not.toContain('0400000000')
    expect(text).not.toContain('Opal St')
  })
})

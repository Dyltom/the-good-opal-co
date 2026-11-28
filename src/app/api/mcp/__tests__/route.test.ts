import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  findGlobal: vi.fn(),
  updateGlobal: vi.fn(),
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
    findGlobal: mocks.findGlobal,
    updateGlobal: mocks.updateGlobal,
    update: mocks.update,
    collections: { media: { config: { upload: {} } } },
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

  test('will not edit a blog post that is already live', async () => {
    mocks.findByID.mockResolvedValue({ id: 7, title: 'Opal care', _status: 'published' })

    const result = await callTool('update_post_draft', { id: 7, title: 'Caring for opal' })

    expect(result.isError).toBe(true)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  describe('page content', () => {
    const stored = {
      id: 1,
      home: {
        customText: 'Steph quotes every ring.',
        customHeading: { text: 'Make your own', italic: 'ring' },
        closingImage: { image: 12, alt: 'Steph at the bench' },
      },
      about: { heroText: 'A small studio.' },
      services: {},
    }

    beforeEach(() => {
      mocks.findGlobal.mockResolvedValue(stored)
      mocks.updateGlobal.mockImplementation(async ({ data }) => ({ id: 1, ...data }))
      mocks.find.mockResolvedValue({ docs: [{ id: 30, mimeType: 'image/jpeg' }] })
    })

    test('changes only the named fields and keeps the rest of every page', async () => {
      const result = await callTool('update_site_content', {
        home: { customHeading: { italic: 'opal ring' }, customImage: { mediaId: 30 } },
      })

      expect(result.isError).toBeUndefined()
      const call = mocks.updateGlobal.mock.calls[0][0]
      expect(call.overrideAccess).toBe(false)
      expect(call.user).toBe(admin)
      expect(call.data.home).toEqual({
        customText: 'Steph quotes every ring.',
        customHeading: { text: 'Make your own', italic: 'opal ring' },
        closingImage: { image: 12, alt: 'Steph at the bench' },
        customImage: { image: 30, alt: null },
      })
      expect(call.data.about).toEqual({ heroText: 'A small studio.' })
    })

    test('refuses a photo that is not in the media library', async () => {
      mocks.find.mockResolvedValue({ docs: [] })

      const result = await callTool('update_site_content', {
        about: { heroImage1: { mediaId: 999 } },
      })

      expect(result.isError).toBe(true)
      expect(result.content[0]!.text).toContain('999')
      expect(mocks.updateGlobal).not.toHaveBeenCalled()
    })

    test('replaces a page list such as the course pillars as a whole', async () => {
      const pillars = [{ title: 'Read the rough', body: 'Bars, potch and host rock.' }]

      const result = await callTool('update_site_content', {
        courses: { pillars, heroImage1: { mediaId: 30 } },
      })

      expect(result.isError).toBeUndefined()
      const call = mocks.updateGlobal.mock.calls[0][0]
      expect(call.data.courses).toEqual({ pillars, heroImage1: { image: 30, alt: null } })
      expect(call.data.home).toEqual(stored.home)
    })

    test('offers search titles and every policy page for editing', async () => {
      const response = await rpc('tools/list')
      const body = await response.json()
      const tool = body.result.tools.find(
        (candidate: { name: string }) => candidate.name === 'update_site_content'
      )

      expect(Object.keys(tool.inputSchema.properties)).toEqual(
        expect.arrayContaining(['home', 'terms', 'privacy', 'cookies', 'shipping', 'returns'])
      )
    })

    test('stores a policy written in markdown as rich text, and an empty one as the original page', async () => {
      const result = await callTool('update_site_content', {
        terms: {
          body: '## Orders\n\nWe confirm every order by email.\n\n- Tracked post\n- [Returns](/returns)',
          lastUpdated: '2026-12-01',
        },
        privacy: { body: '' },
        faq: { seo: { title: 'Opal questions' } },
      })

      expect(result.isError).toBeUndefined()
      const { data } = mocks.updateGlobal.mock.calls[0][0]
      const blocks = data.terms.body.root.children
      expect(blocks.map((block: { type: string }) => block.type)).toEqual([
        'heading',
        'paragraph',
        'list',
      ])
      expect(blocks[0].children[0].text).toBe('Orders')
      expect(blocks[2].children[1].children[0].children[0]).toMatchObject({
        type: 'link',
        fields: { url: '/returns' },
      })
      expect(data.terms.lastUpdated).toBe('2026-12-01')
      expect(data.privacy.body).toBeNull()
      expect(data.faq.seo).toEqual({ title: 'Opal questions' })
    })

    test('refuses a customer account', async () => {
      mocks.auth.mockResolvedValue({ user: { ...admin, role: 'user' } })

      const response = await rpc('tools/call', {
        name: 'update_site_content',
        arguments: { home: { customText: 'Hacked' } },
      })

      expect(response.status).toBe(403)
      expect(mocks.updateGlobal).not.toHaveBeenCalled()
    })
  })

  describe('courses', () => {
    beforeEach(() => {
      mocks.update.mockImplementation(async ({ id, data }) => ({
        id,
        title: 'Opal cutting',
        slug: 'opal-cutting',
        status: 'published',
        summary: 'Learn to cut opal.',
        introduction: 'An outline.',
        ...data,
      }))
    })

    test('sets a course photo from the media library as the signed-in admin', async () => {
      mocks.find.mockResolvedValue({ docs: [{ id: 30, mimeType: 'image/jpeg' }] })

      const result = await callTool('update_course', { id: 4, featuredImageId: 30 })

      expect(result.isError).toBeUndefined()
      const call = mocks.update.mock.calls[0][0]
      expect(call).toMatchObject({
        collection: 'courses',
        id: 4,
        data: { featuredImage: 30 },
        user: admin,
        overrideAccess: false,
      })
      expect(JSON.parse(result.content[0]!.text).featuredImageId).toBe(30)
    })

    test('refuses a course photo that is not in the media library', async () => {
      mocks.find.mockResolvedValue({ docs: [] })

      const result = await callTool('update_course', { id: 4, featuredImageId: 999 })

      expect(result.isError).toBe(true)
      expect(mocks.update).not.toHaveBeenCalled()
    })
  })
})

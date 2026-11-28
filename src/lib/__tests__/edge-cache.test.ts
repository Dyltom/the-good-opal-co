import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

type ChangeArgs = Parameters<CollectionAfterChangeHook>[0]
type DeleteArgs = Parameters<CollectionAfterDeleteHook>[0]
type GlobalArgs = Parameters<GlobalAfterChangeHook>[0]

const TOKEN = 'cf-secret-token-value'
const logger = { info: vi.fn(), warn: vi.fn() }
const fetchMock = vi.fn<typeof fetch>()

async function loadEdgeCache() {
  vi.resetModules()
  return import('../edge-cache')
}

async function change(
  slug: string,
  operation: 'create' | 'update',
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> = {}
) {
  const { edgeCached } = await loadEdgeCache()
  const hooks = edgeCached({ slug, fields: [] }).hooks?.afterChange ?? []
  const args = {
    collection: { slug },
    doc,
    previousDoc,
    operation,
    req: { payload: { logger } },
    context: {},
  }
  return hooks.map((hook) => hook(args as unknown as ChangeArgs))
}

async function settle() {
  await vi.advanceTimersByTimeAsync(20_000)
}

describe('edge cache purge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubEnv('CLOUDFLARE_ZONE_ID', 'zone-1')
    vi.stubEnv('CLOUDFLARE_PURGE_TOKEN', TOKEN)
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(new Response('{"success":true}', { status: 200 }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  test('a stock change purges the cached pages by their tag', async () => {
    await change('products', 'update', { id: 7, stock: 0 }, { id: 7, stock: 1 })
    await settle()

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.cloudflare.com/client/v4/zones/zone-1/purge_cache')
    expect(init?.method).toBe('POST')
    expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${TOKEN}`)
    expect(JSON.parse(String(init?.body))).toEqual({ tags: ['html'] })
  })

  test('a burst of saves sends one purge, and a later save sends another after the gap', async () => {
    const { edgeCached } = await loadEdgeCache()
    const [hook] = edgeCached({ slug: 'products', fields: [] }).hooks?.afterChange ?? []
    const save = (stock: number) =>
      hook({
        collection: { slug: 'products' },
        doc: { id: 7, stock },
        previousDoc: { id: 7 },
        operation: 'update',
        req: { payload: { logger } },
        context: {},
      } as unknown as ChangeArgs)

    for (let stock = 0; stock < 5; stock += 1) save(stock)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    save(9)
    await vi.advanceTimersByTimeAsync(5_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test('collections that never appear on public pages are left without purge hooks', async () => {
    const { edgeCached } = await loadEdgeCache()
    for (const slug of [
      'orders',
      'customers',
      'enquiries',
      'custom-quotes',
      'gift-vouchers',
      'users',
    ]) {
      const collection = { slug, fields: [] }
      expect(edgeCached(collection)).toBe(collection)
    }
  })

  test('uploading a new photo does not purge, replacing one does', async () => {
    await change('media', 'create', { id: 1, filename: 'new.jpg' })
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()

    await change(
      'media',
      'update',
      { id: 1, filename: 'replaced.jpg' },
      { id: 1, filename: 'new.jpg' }
    )
    await settle()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  test('saving a draft post does not purge, publishing or unpublishing does', async () => {
    await change('posts', 'create', { id: 3, _status: 'draft' })
    await change('posts', 'update', { id: 3, _status: 'draft' }, { id: 3, _status: 'draft' })
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()

    await change('posts', 'update', { id: 3, _status: 'published' }, { id: 3, _status: 'draft' })
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await change('posts', 'update', { id: 3, _status: 'draft' }, { id: 3, _status: 'published' })
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test('deleting a product and editing page content both purge', async () => {
    const { edgeCached, edgeCachedGlobal } = await loadEdgeCache()
    const [afterDelete] = edgeCached({ slug: 'products', fields: [] }).hooks?.afterDelete ?? []
    afterDelete({ doc: { id: 7 }, id: 7, req: { payload: { logger } } } as unknown as DeleteArgs)
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const globalHooks =
      edgeCachedGlobal({ slug: 'site-content', fields: [] }).hooks?.afterChange ?? []
    globalHooks.forEach((hook) =>
      hook({ doc: {}, req: { payload: { logger } } } as unknown as GlobalArgs)
    )
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test('a failed purge is logged without the token and never reaches the save', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          errors: [{ code: 10000, message: 'Authentication error' }],
        }),
        {
          status: 403,
        }
      )
    )
    const doc = { id: 7, stock: 0 }
    expect(await change('products', 'update', doc, { id: 7, stock: 1 })).toEqual([doc])
    await settle()

    fetchMock.mockRejectedValueOnce(new Error('network down'))
    await change('products', 'update', doc, { id: 7, stock: 1 })
    await settle()

    expect(logger.warn).toHaveBeenCalledTimes(2)
    expect(logger.warn.mock.calls[0][0]).toMatchObject({
      status: 403,
      errors: [{ code: 10000, message: 'Authentication error' }],
    })
    expect(logger.warn.mock.calls[1][0]).toMatchObject({ error: 'network down' })
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(TOKEN)
  })

  test('without Cloudflare credentials saves skip the purge and say so once', async () => {
    vi.stubEnv('CLOUDFLARE_PURGE_TOKEN', '')
    const { edgeCached } = await loadEdgeCache()
    const [hook] = edgeCached({ slug: 'products', fields: [] }).hooks?.afterChange ?? []
    const args = {
      collection: { slug: 'products' },
      doc: { id: 7 },
      previousDoc: { id: 7 },
      operation: 'update',
      req: { payload: { logger } },
      context: {},
    } as unknown as ChangeArgs
    hook(args)
    hook(args)
    await settle()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledOnce()
  })
})

import { afterEach, describe, expect, test, vi } from 'vitest'

const { afterMock } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://goodopalco.com'
  return { afterMock: vi.fn() }
})

vi.mock('next/server', () => ({ after: afterMock }))

import { INDEXNOW_KEY, indexNowOnPublish, indexNowPayload } from '../indexnow'

const hook = indexNowOnPublish((doc) => (doc.status === 'published' ? `/store/${String(doc.slug)}` : null))

function run(doc: Record<string, unknown>) {
  return hook({
    collection: null,
    context: {},
    doc,
    operation: 'update',
    previousDoc: doc,
    req: { payload: { logger: { warn: vi.fn() } } },
  } as unknown as Parameters<typeof hook>[0])
}

describe('IndexNow', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  test('submits only unique https URLs on the site host, with the hosted key', () => {
    expect(
      indexNowPayload(
        ['/store/blue-opal', 'https://goodopalco.com/store/blue-opal', 'https://elsewhere.com/x', '/blog/care'],
        'https://goodopalco.com'
      )
    ).toEqual({
      host: 'goodopalco.com',
      key: INDEXNOW_KEY,
      keyLocation: 'https://goodopalco.com/indexnow-key.txt',
      urlList: ['https://goodopalco.com/store/blue-opal', 'https://goodopalco.com/blog/care'],
    })
    expect(indexNowPayload(['/store/blue-opal'], 'http://localhost:8412')).toBeNull()
  })

  test('pings nothing unless enabled, and only for published pages', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)

    run({ status: 'published', slug: 'blue-opal' })
    expect(afterMock).not.toHaveBeenCalled()

    vi.stubEnv('INDEXNOW_ENABLED', 'true')
    run({ status: 'draft', slug: 'blue-opal' })
    expect(afterMock).not.toHaveBeenCalled()

    run({ status: 'published', slug: 'blue-opal' })
    expect(afterMock).toHaveBeenCalledTimes(1)
    await afterMock.mock.calls[0]![0]()
    expect(fetchMock).toHaveBeenCalledWith('https://api.indexnow.org/indexnow', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).urlList).toEqual(['https://goodopalco.com/store/blue-opal'])
  })
})

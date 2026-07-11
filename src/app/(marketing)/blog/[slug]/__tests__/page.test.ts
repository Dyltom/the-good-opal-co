import type { Post } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

import { generateMetadata } from '../page'

function postFixture(overrides: Partial<Post> = {}): Post {
  return {
    id: 42,
    title: 'How to choose an Australian opal',
    slug: 'choose-an-australian-opal',
    excerpt: 'A practical guide to colour, origin, and value.',
    content: {
      root: {
        type: 'root',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    status: 'published',
    publishedAt: '2025-04-10T00:00:00.000Z',
    tenantId: 'default',
    updatedAt: '2025-04-12T00:00:00.000Z',
    createdAt: '2025-04-09T00:00:00.000Z',
    ...overrides,
  }
}

describe('blog post metadata', () => {
  test('uses CMS SEO fields and emits a canonical article URL', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        postFixture({
          seo: {
            title: 'Australian opal buying guide',
            description: 'Learn what to inspect before buying an Australian opal.',
            keywords: ['Australian opal', 'opal buying guide'],
          },
        }),
      ],
    })
    vi.mocked(getPayload).mockResolvedValue({ find } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'choose-an-australian-opal' }),
    })

    expect(metadata.title).toBe('Australian opal buying guide | The Good Opal Co')
    expect(metadata.description).toBe(
      'Learn what to inspect before buying an Australian opal.',
    )
    expect(metadata.alternates?.canonical).toBe(
      new URL(
        '/blog/choose-an-australian-opal',
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8412',
      ).toString(),
    )
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2025-04-10T00:00:00.000Z',
      modifiedTime: '2025-04-12T00:00:00.000Z',
    })
  })

  test('prevents indexing when no published post matches', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({ find } as unknown as Awaited<
      ReturnType<typeof getPayload>
    >)

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'missing-article' }),
    })

    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})

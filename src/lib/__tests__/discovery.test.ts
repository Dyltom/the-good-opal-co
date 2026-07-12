import { describe, expect, test } from 'vitest'
import { buildLlmsIndex, buildRssFeed, escapeXml } from '../discovery'

describe('discovery documents', () => {
  test('escapes untrusted text for RSS XML', () => {
    expect(escapeXml(`Opal & <Fire> "Guide"`)).toBe('Opal &amp; &lt;Fire&gt; &quot;Guide&quot;')

    const feed = buildRssFeed([
      {
        title: 'Opal & care',
        slug: 'opal-care',
        excerpt: 'Keep it <safe>.',
        publishedAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ])

    expect(feed).toContain('<rss version="2.0"')
    expect(feed).toContain('<title>Opal &amp; care</title>')
    expect(feed).toContain('<description>Keep it &lt;safe&gt;.</description>')
    expect(feed).toContain('<language>en-AU</language>')
  })

  test('publishes a factual AI discovery index with canonical content links', () => {
    const index = buildLlmsIndex({
      products: [
        { name: 'Blue opal', slug: 'blue-opal', category: 'raw-opals', price: 123, stock: 1 },
      ],
      courses: [
        {
          title: 'Cut opal',
          slug: 'cut-opal',
          summary: 'A practical cutting outline.',
        },
      ],
      articles: [
        {
          title: 'Care guide',
          slug: 'care-guide',
          excerpt: 'How to care for opal.',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    })

    expect(index).toContain('# The Good Opal Co')
    expect(index).toContain('[Blue opal](')
    expect(index).toContain('/store/blue-opal): raw opals; AUD $123.00; available.')
    expect(index).toContain('/courses/cut-opal)')
    expect(index).toContain('/blog/care-guide)')
    expect(index).toContain('Product pages and published policies are the source of truth')
  })
})

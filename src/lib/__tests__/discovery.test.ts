import { describe, expect, test } from 'vitest'
import { buildLlmsFull, buildLlmsIndex, buildRssFeed, escapeXml } from '../discovery'
import { catalogProduct } from './catalog-fixture'

const input = {
  products: [
    catalogProduct({ stone: 'Black opal', origin: 'Lightning Ridge, NSW', weight: { value: 2.1, unit: 'ct' } }),
    catalogProduct({ name: 'Sold ring', slug: 'sold-ring', sku: 'WP-2', stock: 0, availability: 'sold' }),
    catalogProduct({ name: 'Held pendant', slug: 'held-pendant', sku: 'WP-3', stock: 0, availability: 'reserved' }),
  ],
  courses: [{ title: 'Cut opal', slug: 'cut-opal', summary: 'A practical cutting outline.' }],
  articles: [
    {
      title: 'Care guide',
      slug: 'care-guide',
      excerpt: 'How to care for opal.',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ],
  contactEmail: 'shop@example.com',
}

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

  test('indexes the pieces still in the shop with real facts, policies, and contact', () => {
    const index = buildLlmsIndex(input)

    expect(index).toContain('## Pieces in the shop (2)')
    expect(index).toContain('/store/blue-opal): Raw opals; Black opal; Lightning Ridge, NSW; 2.1 ct; AUD $123.00; available.')
    expect(index).toContain('/store/held-pendant): Raw opals; AUD $123.00; reserved in a checkout.')
    expect(index).not.toContain('/store/sold-ring)')
    expect(index).toContain('1 sold piece is not listed here')
    expect(index).toContain('Visa, Mastercard, Amex, Apple Pay, Klarna')
    expect(index).toContain('Lightning Ridge and Coober Pedy')
    expect(index).not.toContain('Sydney')
    expect(index).toContain('Australia: Parcel Post AUD $10.20, Express Post AUD $13.20 per order.')
    expect(index).toContain('Free shipping on orders of AUD $500.00 or more')
    expect(index).toContain('within 30 days of delivery')
    expect(index).toContain('shop@example.com')
    expect(index).toContain('/llms-full.txt')
    expect(index).toContain('/courses/cut-opal)')
    expect(index).toContain('/blog/care-guide)')
    expect(index).not.toContain('\u2014')
  })

  test('describes only pieces that can still be bought in the full document', () => {
    const full = buildLlmsFull(input)

    expect(full).toContain('## Available pieces (1)')
    expect(full).toContain('### Blue opal')
    expect(full).toContain('- Origin: Lightning Ridge, NSW')
    expect(full).toContain('A bright blue opal.')
    expect(full).not.toContain('Sold ring')
    expect(full).not.toContain('Held pendant')
    expect(full).not.toContain('\u2014')
  })
})

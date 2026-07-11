import { describe, expect, it, vi } from 'vitest'
import {
  assertSafeLegacyMediaUrl,
  downloadWordPressMedia,
  fetchPublishedWordPressPosts,
  parseWordPressPostPage,
  wordpressHtmlToLexical,
} from '../content-import'

const sourcePost = {
  id: 5423,
  date_gmt: '2021-12-17T09:30:48',
  slug: 'diy-jewellery-hack',
  status: 'publish',
  title: { rendered: 'DIY Jewellery &#8211; Hack' },
  content: {
    rendered:
      '<h2>Care guide</h2><p>Use a <a href="https://goodopalco.com/shop/" target="_blank">soft cloth</a>.</p><ol><li>Wash gently</li><li>Dry fully</li></ol>',
  },
  excerpt: { rendered: '<p>Clean opals safely &#8230; <a>Read more</a></p>' },
  featured_media: 5425,
  _embedded: {
    'wp:featuredmedia': [
      {
        id: 5425,
        alt_text: 'DIY care',
        mime_type: 'image/jpeg',
        source_url: 'https://goodopalco.com/wp-content/uploads/2021/05/care.jpg',
        title: { rendered: 'Care image' },
      },
    ],
  },
}

describe('WordPress content import', () => {
  it('maps stable identity, rendered fields, date, and featured media', () => {
    const post = parseWordPressPostPage([sourcePost])[0]
    expect(post).toMatchObject({
      id: 5423,
      title: 'DIY Jewellery – Hack',
      slug: 'diy-jewellery-hack',
      excerpt: 'Clean opals safely …',
      publishedAt: '2021-12-17T09:30:48.000Z',
      featuredMedia: { id: 5425, alt: 'DIY care', mimeType: 'image/jpeg' },
    })
  })

  it('preserves headings, paragraphs, links, and ordered lists in Lexical content', () => {
    const document = wordpressHtmlToLexical(sourcePost.content.rendered)
    expect(document.root.children.map((node) => node.type)).toEqual([
      'heading',
      'paragraph',
      'list',
    ])
    expect(document.root.children[0]).toMatchObject({ type: 'heading', tag: 'h2' })
    expect(document.root.children[1]).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Use a ' },
        {
          type: 'link',
          version: 3,
          fields: { doc: null, url: 'https://goodopalco.com/shop/', newTab: true },
          children: [{ text: 'soft cloth' }],
        },
        { type: 'text', text: '.' },
      ],
    })
    expect(document.root.children[2]).toMatchObject({
      type: 'list',
      listType: 'number',
      children: [{ type: 'listitem' }, { type: 'listitem' }],
    })
  })

  it('fetches all advertised post pages', async () => {
    const fetcher = vi.fn<typeof fetch>()
    fetcher
      .mockResolvedValueOnce(
        new Response(JSON.stringify([sourcePost]), { headers: { 'x-wp-totalpages': '2' } })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ ...sourcePost, id: 5327, slug: 'second' }]), {
          headers: { 'x-wp-totalpages': '2' },
        })
      )
    const posts = await fetchPublishedWordPressPosts({ fetcher, perPage: 1 })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(posts.map((post) => post.id)).toEqual([5423, 5327])
  })

  it('rejects malformed post data and unsafe media locations', () => {
    expect(() => parseWordPressPostPage([{ ...sourcePost, status: 'draft' }])).toThrow()
    expect(() =>
      assertSafeLegacyMediaUrl('https://evil.example/wp-content/uploads/a.jpg')
    ).toThrow()
    expect(() => assertSafeLegacyMediaUrl('https://goodopalco.com/wp-admin/a.jpg')).toThrow()
    expect(
      assertSafeLegacyMediaUrl('https://www.goodopalco.com/wp-content/uploads/a.jpg').hostname
    ).toBe('www.goodopalco.com')
  })

  it('turns unsafe links into plain text', () => {
    const document = wordpressHtmlToLexical('<p><a href="javascript:alert(1)">Read this</a></p>')
    expect(document.root.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ type: 'text', text: 'Read this' }],
    })
  })

  it('downloads safe image bytes with a stable deduplicating filename', async () => {
    const media = parseWordPressPostPage([sourcePost])[0]?.featuredMedia
    if (!media) throw new Error('Expected fixture media')
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-length': '3', 'content-type': 'image/jpeg' },
      })
    )

    const file = await downloadWordPressMedia(media, fetcher)

    expect(file).toMatchObject({
      name: 'wp-5425-care.jpg',
      mimetype: 'image/jpeg',
      size: 3,
    })
    expect(file.data).toEqual(Buffer.from([1, 2, 3]))
  })

  it('rejects oversized and non-raster media responses', async () => {
    const media = parseWordPressPostPage([sourcePost])[0]?.featuredMedia
    if (!media) throw new Error('Expected fixture media')
    const oversized = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([1]), {
        headers: { 'content-length': '20', 'content-type': 'image/jpeg' },
      })
    )
    await expect(downloadWordPressMedia(media, oversized, 10)).rejects.toThrow('exceeds')

    const svg = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response('<svg></svg>', { headers: { 'content-type': 'image/svg+xml' } })
      )
    await expect(downloadWordPressMedia(media, svg)).rejects.toThrow('unsafe content type')
  })
})

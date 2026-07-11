import path from 'node:path'
import { z } from 'zod'

const DEFAULT_MAX_MEDIA_BYTES = 15 * 1024 * 1024
const SAFE_IMAGE_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const renderedSchema = z.object({ rendered: z.string() })

const featuredMediaSchema = z.object({
  id: z.number().int().positive(),
  alt_text: z.string(),
  mime_type: z.string().regex(/^image\//),
  source_url: z.url(),
  title: renderedSchema,
})

const wordpressPostSchema = z.object({
  id: z.number().int().positive(),
  date_gmt: z.iso.datetime({ local: true }),
  slug: z.string().min(1),
  status: z.literal('publish'),
  title: renderedSchema,
  content: renderedSchema,
  excerpt: renderedSchema,
  featured_media: z.number().int().nonnegative(),
  _embedded: z
    .object({
      'wp:featuredmedia': z.array(featuredMediaSchema).optional(),
    })
    .optional(),
})

const wordpressPostPageSchema = z.array(wordpressPostSchema)
type WordPressPost = z.infer<typeof wordpressPostSchema>

export interface WordPressFeaturedMedia {
  id: number
  alt: string
  mimeType: string
  sourceUrl: string
  title: string
}

export interface WordPressContentPost {
  id: number
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  content: LexicalDocument
  featuredMedia: WordPressFeaturedMedia | null
}

interface LexicalTextNode {
  type: 'text'
  text: string
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  version: 1
}

interface LexicalLinkNode extends Omit<LexicalBlockFields, 'version'> {
  type: 'link'
  version: 3
  fields: {
    doc: null
    linkType: 'custom'
    newTab: boolean
    url: string
  }
  children: LexicalTextNode[]
}

type LexicalInlineNode = LexicalTextNode | LexicalLinkNode

interface LexicalBlockFields {
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

interface LexicalParagraphNode extends LexicalBlockFields {
  type: 'paragraph'
  children: LexicalInlineNode[]
  textFormat: 0
  textStyle: ''
}

interface LexicalHeadingNode extends LexicalBlockFields {
  type: 'heading'
  tag: `h${1 | 2 | 3 | 4 | 5 | 6}`
  children: LexicalInlineNode[]
}

interface LexicalListItemNode extends LexicalBlockFields {
  type: 'listitem'
  value: number
  children: LexicalParagraphNode[]
}

interface LexicalListNode extends LexicalBlockFields {
  type: 'list'
  listType: 'bullet' | 'number'
  start: number
  tag: 'ul' | 'ol'
  children: LexicalListItemNode[]
}

type LexicalBlockNode = LexicalParagraphNode | LexicalHeadingNode | LexicalListNode

export interface LexicalDocument {
  root: LexicalBlockFields & {
    type: 'root'
    children: LexicalBlockNode[]
  }
}

export interface FetchWordPressOptions {
  endpoint?: string
  fetcher?: typeof fetch
  perPage?: number
}

export interface DownloadedWordPressMedia {
  name: string
  data: Buffer
  mimetype: string
  size: number
}

const entities: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  hellip: '…',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

const blockFields: LexicalBlockFields = {
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
}

export function decodeWordPressHtml(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    const codePoint = code.startsWith('#x')
      ? Number.parseInt(code.slice(2), 16)
      : code.startsWith('#')
        ? Number.parseInt(code.slice(1), 10)
        : null

    if (codePoint !== null) {
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity
    }
    return entities[code.toLowerCase()] ?? entity
  })
}

function plainText(value: string): string {
  return decodeWordPressHtml(
    value
      .replace(/<(script|style|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .trim()
}

function inlineText(value: string): string {
  return decodeWordPressHtml(value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
}

function textNode(text: string): LexicalTextNode {
  return { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }
}

function safeLink(value: string): string | null {
  const decoded = decodeWordPressHtml(value).trim()
  if (decoded.startsWith('/')) return decoded
  try {
    const url = new URL(decoded)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function inlineNodes(html: string): LexicalInlineNode[] {
  const nodes: LexicalInlineNode[] = []
  const linkPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let cursor = 0
  let match: RegExpExecArray | null

  const appendText = (value: string) => {
    const text = inlineText(value)
    if (text.trim()) nodes.push(textNode(text))
  }

  while ((match = linkPattern.exec(html)) !== null) {
    appendText(html.slice(cursor, match.index))
    const attributes = match[1] ?? ''
    const label = plainText(match[2] ?? '')
    const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2]
    const url = href ? safeLink(href) : null
    if (label && url) {
      nodes.push({
        ...blockFields,
        type: 'link',
        version: 3,
        fields: {
          doc: null,
          linkType: 'custom',
          newTab: /\btarget\s*=\s*(["'])_blank\1/i.test(attributes),
          url,
        },
        children: [textNode(label)],
      })
    } else if (label) {
      nodes.push(textNode(label))
    }
    cursor = match.index + match[0].length
  }
  appendText(html.slice(cursor))
  const first = nodes[0]
  if (first?.type === 'text') first.text = first.text.trimStart()
  const last = nodes.at(-1)
  if (last?.type === 'text') last.text = last.text.trimEnd()
  return nodes
}

function paragraph(html: string): LexicalParagraphNode | null {
  const children = inlineNodes(html)
  return children.length
    ? { ...blockFields, type: 'paragraph', children, textFormat: 0, textStyle: '' }
    : null
}

export function wordpressHtmlToLexical(html: string): LexicalDocument {
  const cleanHtml = html.replace(/<(script|style|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const children: LexicalBlockNode[] = []
  const blockPattern = /<(h[1-6]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(cleanHtml)) !== null) {
    const tag = match[1]?.toLowerCase()
    const body = match[2] ?? ''
    if (!tag) continue

    if (/^h[1-6]$/.test(tag)) {
      const headingChildren = inlineNodes(body)
      if (headingChildren.length) {
        children.push({
          ...blockFields,
          type: 'heading',
          tag: tag as LexicalHeadingNode['tag'],
          children: headingChildren,
        })
      }
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const items: LexicalListItemNode[] = []
      const itemPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi
      let itemMatch: RegExpExecArray | null
      while ((itemMatch = itemPattern.exec(body)) !== null) {
        const itemParagraph = paragraph(itemMatch[1] ?? '')
        if (itemParagraph) {
          items.push({
            ...blockFields,
            type: 'listitem',
            value: items.length + 1,
            children: [itemParagraph],
          })
        }
      }
      if (items.length) {
        children.push({
          ...blockFields,
          type: 'list',
          listType: tag === 'ol' ? 'number' : 'bullet',
          start: 1,
          tag,
          children: items,
        })
      }
      continue
    }

    const node = paragraph(body)
    if (node) children.push(node)
  }

  if (!children.length) {
    const fallback = paragraph(cleanHtml)
    if (fallback) children.push(fallback)
  }

  return { root: { ...blockFields, type: 'root', children } }
}

export function excerptFromWordPressHtml(html: string): string {
  return plainText(html)
    .replace(/\s*Read more\s*$/i, '')
    .trim()
}

function featuredMediaFor(post: WordPressPost): WordPressFeaturedMedia | null {
  if (post.featured_media === 0) return null
  const media = post._embedded?.['wp:featuredmedia']?.find(
    (candidate) => candidate.id === post.featured_media
  )
  if (!media) return null
  return {
    id: media.id,
    alt: plainText(media.alt_text || media.title.rendered) || `Featured image for post ${post.id}`,
    mimeType: media.mime_type,
    sourceUrl: media.source_url,
    title: plainText(media.title.rendered),
  }
}

export function parseWordPressPostPage(input: unknown): WordPressContentPost[] {
  return wordpressPostPageSchema.parse(input).map((post) => ({
    id: post.id,
    title: plainText(post.title.rendered),
    slug: post.slug,
    excerpt: excerptFromWordPressHtml(post.excerpt.rendered),
    publishedAt: new Date(`${post.date_gmt}Z`).toISOString(),
    content: wordpressHtmlToLexical(post.content.rendered),
    featuredMedia: featuredMediaFor(post),
  }))
}

export async function fetchPublishedWordPressPosts(
  options: FetchWordPressOptions = {}
): Promise<WordPressContentPost[]> {
  const fetcher = options.fetcher ?? fetch
  const endpoint = options.endpoint ?? 'https://goodopalco.com/wp-json/wp/v2/posts'
  const perPage = options.perPage ?? 100
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
    throw new Error('WordPress perPage must be an integer from 1 to 100')
  }

  const posts: WordPressContentPost[] = []
  let page = 1
  let totalPages: number | null = null

  do {
    const url = new URL(endpoint)
    url.searchParams.set('_embed', '1')
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('status', 'publish')
    const response = await fetcher(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok)
      throw new Error(`WordPress post request failed (${response.status}) on page ${page}`)

    const pagePosts = parseWordPressPostPage(await response.json())
    posts.push(...pagePosts)
    const totalPagesHeader = response.headers.get('x-wp-totalpages')
    if (totalPagesHeader !== null) {
      totalPages = Number.parseInt(totalPagesHeader, 10)
      if (!Number.isInteger(totalPages) || totalPages < 0) {
        throw new Error(`WordPress returned invalid X-WP-TotalPages: ${totalPagesHeader}`)
      }
    }
    if (totalPages === null && pagePosts.length < perPage) break
    page += 1
  } while (totalPages === null || page <= totalPages)

  if (new Set(posts.map((post) => post.id)).size !== posts.length) {
    throw new Error('WordPress returned duplicate post IDs')
  }
  return posts
}

export function assertSafeLegacyMediaUrl(sourceUrl: string): URL {
  const url = new URL(sourceUrl)
  const hostname = url.hostname.toLowerCase()
  if (
    url.protocol !== 'https:' ||
    (hostname !== 'goodopalco.com' && hostname !== 'www.goodopalco.com')
  ) {
    throw new Error(`Refusing untrusted legacy media URL: ${sourceUrl}`)
  }
  if (!url.pathname.startsWith('/wp-content/uploads/')) {
    throw new Error(`Refusing non-upload legacy media URL: ${sourceUrl}`)
  }
  return url
}

export function legacyMediaFilename(media: WordPressFeaturedMedia): string {
  const pathname = assertSafeLegacyMediaUrl(media.sourceUrl).pathname
  const basename = decodeURIComponent(path.basename(pathname)).replace(/[^a-zA-Z0-9._-]/g, '-')
  return `wp-${media.id}-${basename || 'featured-image'}`
}

export async function downloadWordPressMedia(
  media: WordPressFeaturedMedia,
  fetcher: typeof fetch = fetch,
  maxBytes: number = DEFAULT_MAX_MEDIA_BYTES
): Promise<DownloadedWordPressMedia> {
  const sourceUrl = assertSafeLegacyMediaUrl(media.sourceUrl)
  if (!SAFE_IMAGE_TYPES.has(media.mimeType.toLowerCase())) {
    throw new Error(`Legacy media ${media.id} has unsafe declared type: ${media.mimeType}`)
  }

  const response = await fetcher(sourceUrl, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Legacy media ${media.id} download failed (${response.status})`)
  if (response.url) assertSafeLegacyMediaUrl(response.url)

  const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (!mimeType || !SAFE_IMAGE_TYPES.has(mimeType)) {
    throw new Error(
      `Legacy media ${media.id} returned unsafe content type: ${mimeType ?? 'missing'}`
    )
  }
  const declaredLength = Number(response.headers.get('content-length') ?? 0)
  if (declaredLength > maxBytes)
    throw new Error(`Legacy media ${media.id} exceeds ${maxBytes} bytes`)

  const data = Buffer.from(await response.arrayBuffer())
  if (data.byteLength === 0 || data.byteLength > maxBytes) {
    throw new Error(`Legacy media ${media.id} has invalid size ${data.byteLength}`)
  }
  return {
    name: legacyMediaFilename(media),
    data,
    mimetype: mimeType,
    size: data.byteLength,
  }
}

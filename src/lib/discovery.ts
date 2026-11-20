import { APP_NAME, APP_URL } from './constants'
import { RETURN_WINDOW_DAYS, SHIPPING_CONFIG, SHIPPING_COUNTRIES } from './constants/shipping'
import type { CatalogProduct } from './catalog'

export interface DiscoveryArticle {
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  updatedAt: string
}

export interface DiscoveryCourse {
  title: string
  slug: string
  summary: string
}

export function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildRssFeed(articles: DiscoveryArticle[]): string {
  const items = articles
    .map((article) => {
      const url = `${APP_URL}/blog/${encodeURIComponent(article.slug)}`
      const date = new Date(article.publishedAt ?? article.updatedAt).toUTCString()

      return [
        '<item>',
        `<title>${escapeXml(article.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${date}</pubDate>`,
        article.excerpt ? `<description>${escapeXml(article.excerpt)}</description>` : '',
        '</item>',
      ]
        .filter(Boolean)
        .join('')
    })
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${APP_NAME} — Opal Notes</title>`,
    `<link>${APP_URL}/blog</link>`,
    '<description>Practical guidance about Australian opals, jewellery, buying, cutting, and care.</description>',
    '<language>en-AU</language>',
    `<atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    '</channel>',
    '</rss>',
  ].join('')
}

function markdownLink(label: string, path: string): string {
  return `[${label.replace(/[[\]]/g, '')}](${APP_URL}${path})`
}

function aud(amount: number): string {
  return `AUD $${amount.toFixed(2)}`
}

function countryNames(codes: readonly string[]): string {
  const names = new Intl.DisplayNames(['en-AU'], { type: 'region' })
  return codes.map((code) => names.of(code) ?? code).join(', ')
}

function productFacts(product: CatalogProduct): string {
  return [
    product.categoryLabel,
    product.stone,
    product.origin,
    product.weight,
    aud(product.price),
    product.inStock ? 'available' : 'sold',
  ]
    .filter(Boolean)
    .join('; ')
}

export interface DiscoveryInput {
  products: CatalogProduct[]
  courses: DiscoveryCourse[]
  articles: DiscoveryArticle[]
  contactEmail: string
}

function storeFacts(contactEmail: string): string[] {
  const { RATES, FREE_SHIPPING_THRESHOLD } = SHIPPING_CONFIG

  return [
    '## Business',
    '',
    '- Founder: Stephanie Caruana.',
    '- Location: Australia.',
    '- Prices are in Australian dollars (AUD).',
    `- Contact: ${contactEmail} or ${markdownLink('the contact form', '/contact')}. Ask for extra photographs or a virtual viewing before buying.`,
    '',
    '## How to buy',
    '',
    '- Each product page shows the current price and whether the piece is still available.',
    '- Add the piece to the cart and pay through Stripe secure checkout.',
    '- Most pieces are one of a kind. Sold pieces keep their page and are marked sold.',
    `- Custom ring designs start in the ${markdownLink('ring designer', '/services/design')} and are quoted personally.`,
    '',
    '## Shipping',
    '',
    `- Australia: tracked shipping, ${aud(RATES.AUSTRALIA.EXPRESS)} per order.`,
    `- International (${countryNames(SHIPPING_COUNTRIES.INTERNATIONAL)}): tracked shipping, ${aud(RATES.INTERNATIONAL.EXPRESS)} per order. Import duties, taxes, and local charges are paid by the recipient.`,
    `- Free shipping on orders of ${aud(FREE_SHIPPING_THRESHOLD)} or more.`,
    '- Tracking details are sent when the carrier accepts the parcel.',
    `- Full policy: ${markdownLink('Shipping', '/shipping')}`,
    '',
    '## Returns',
    '',
    `- Change of mind: contact us within ${RETURN_WINDOW_DAYS} days of delivery. Unused pieces in original condition and packaging can be returned; the customer pays return postage.`,
    '- Custom, personalised, altered, worn, hygiene-sensitive, and final-sale pieces are not eligible for change-of-mind returns.',
    '- Contact us before posting anything back. Rights under the Australian Consumer Law are not limited by this policy.',
    `- Full policy: ${markdownLink('Returns', '/returns')}`,
    '',
  ]
}

function contentLists(input: DiscoveryInput): string[] {
  const courses = input.courses.map(
    (course) =>
      `- ${markdownLink(course.title, `/courses/${encodeURIComponent(course.slug)}`)}: ${course.summary.replace(/\s+/g, ' ').trim()}`
  )
  const articles = input.articles.map((article) => {
    const summary = article.excerpt?.replace(/\s+/g, ' ').trim()
    return `- ${markdownLink(article.title, `/blog/${encodeURIComponent(article.slug)}`)}${summary ? `: ${summary}` : ''}`
  })

  return [
    '## Courses',
    '',
    ...(courses.length ? courses : ['- No courses are currently published.']),
    '',
    '## Articles',
    '',
    ...(articles.length ? articles : ['- No articles are currently published.']),
    '',
  ]
}

const INTRO = [
  `# ${APP_NAME}`,
  '',
  '> Australian opals, finished opal jewellery, custom ring design, and opal education from Sydney, Australia.',
  '',
]

export function buildLlmsIndex(input: DiscoveryInput): string {
  const products = input.products.map(
    (product) =>
      `- ${markdownLink(product.name, `/store/${encodeURIComponent(product.slug)}`)}: ${productFacts(product)}.`
  )

  return [
    ...INTRO,
    `Product pages are the source of truth for current price and availability. A fuller version with every available piece described is at ${APP_URL}/llms-full.txt.`,
    '',
    ...storeFacts(input.contactEmail),
    '## Key pages',
    '',
    `- ${markdownLink('Store', '/store')}`,
    `- ${markdownLink('Custom opal ring designer', '/services/design')}`,
    `- ${markdownLink('Opal courses', '/courses')}`,
    `- ${markdownLink('Opal notes and guides', '/blog')}`,
    `- ${markdownLink('Frequently asked questions', '/faq')}`,
    `- ${markdownLink('About', '/about')}`,
    '',
    '## Products',
    '',
    ...(products.length ? products : ['- No products are currently published.']),
    '',
    ...contentLists(input),
  ].join('\n')
}

export function buildLlmsFull(input: DiscoveryInput): string {
  const available = input.products.filter((product) => product.inStock)
  const products = available.flatMap((product) => [
    `### ${product.name.replace(/[[\]]/g, '')}`,
    '',
    `- URL: ${product.url}`,
    `- Price: ${aud(product.price)}`,
    `- Availability: in stock (${product.stock} available)`,
    `- Category: ${product.categoryLabel}`,
    ...(product.stone ? [`- Stone: ${product.stone}`] : []),
    ...(product.origin ? [`- Origin: ${product.origin}`] : []),
    ...(product.weight ? [`- Weight: ${product.weight}`] : []),
    ...(product.metal ? [`- Metal: ${product.metal}`] : []),
    ...(product.ringSize ? [`- Ring size: ${product.ringSize}`] : []),
    `- SKU: ${product.sku}`,
    '',
    ...(product.description ? [product.description, ''] : []),
  ])

  return [
    ...INTRO,
    'Every piece currently available, with the store facts that apply to it. Product pages are the source of truth for current price and availability.',
    '',
    ...storeFacts(input.contactEmail),
    `## Available pieces (${available.length})`,
    '',
    ...(products.length ? products : ['No pieces are currently available.', '']),
    ...contentLists(input),
  ].join('\n')
}

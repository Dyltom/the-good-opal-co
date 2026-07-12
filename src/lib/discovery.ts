import { APP_NAME, APP_URL } from './constants'

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

export interface DiscoveryProduct {
  name: string
  slug: string
  category: string
  price: number
  stock?: number | null
}

export function escapeXml(value: string): string {
  return value
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
  return `[${label.replace(/[\[\]]/g, '')}](${APP_URL}${path})`
}

export function buildLlmsIndex(input: {
  products: DiscoveryProduct[]
  courses: DiscoveryCourse[]
  articles: DiscoveryArticle[]
}): string {
  const products = input.products.map((product) => {
    const category = product.category.replace(/-/g, ' ')
    const availability = (product.stock ?? 0) > 0 ? 'available' : 'sold or unavailable'
    return `- ${markdownLink(product.name, `/store/${encodeURIComponent(product.slug)}`)}: ${category}; AUD $${product.price.toFixed(2)}; ${availability}.`
  })
  const courses = input.courses.map(
    (course) =>
      `- ${markdownLink(course.title, `/courses/${encodeURIComponent(course.slug)}`)}: ${course.summary.replace(/\s+/g, ' ').trim()}`
  )
  const articles = input.articles.map((article) => {
    const summary = article.excerpt?.replace(/\s+/g, ' ').trim()
    return `- ${markdownLink(article.title, `/blog/${encodeURIComponent(article.slug)}`)}${summary ? `: ${summary}` : ''}`
  })

  return [
    `# ${APP_NAME}`,
    '',
    '> Australian opals, finished jewellery, custom ring design, and practical opal education from Sydney, Australia.',
    '',
    'This file is a concise discovery index. Product pages and published policies are the source of truth for current price, stock, shipping, returns, and availability.',
    '',
    '## Business and provenance',
    '',
    '- Founder: Stephanie Caruana.',
    '- Location: Sydney, New South Wales, Australia.',
    '- Store currency: Australian dollars (AUD).',
    `- ${markdownLink('About the business', '/about')}`,
    `- ${markdownLink('Contact', '/contact')}`,
    `- ${markdownLink('Shipping policy', '/shipping')}`,
    `- ${markdownLink('Returns policy', '/returns')}`,
    '',
    '## Key pages',
    '',
    `- ${markdownLink('Store', '/store')}`,
    `- ${markdownLink('Custom opal ring designer', '/services/design')}`,
    `- ${markdownLink('Opal courses', '/courses')}`,
    `- ${markdownLink('Opal notes and guides', '/blog')}`,
    `- ${markdownLink('Frequently asked questions', '/faq')}`,
    '',
    '## Published products',
    '',
    ...(products.length ? products : ['- No products are currently published.']),
    '',
    '## Published courses',
    '',
    ...(courses.length ? courses : ['- No courses are currently published.']),
    '',
    '## Published articles',
    '',
    ...(articles.length ? articles : ['- No articles are currently published.']),
    '',
  ].join('\n')
}

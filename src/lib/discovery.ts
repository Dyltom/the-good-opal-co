import { APP_NAME, APP_URL } from './constants'
import {
  DELIVERY_ESTIMATE,
  RETURN_WINDOW_DAYS,
  SHIPPING_CONFIG,
  SHIPPING_COUNTRIES,
} from './constants/shipping'
import { METHODS_ENABLED_IN_STRIPE } from './constants/payment'
import { weightLabel, type CatalogProduct } from './catalog'

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
    `<title>${APP_NAME} — Journal</title>`,
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
    product.weight && weightLabel(product.weight),
    product.metal,
    aud(product.price),
    product.availability === 'reserved' ? 'reserved in a checkout' : 'available',
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

function storeFacts(input: DiscoveryInput): string[] {
  const { RATES, FREE_SHIPPING_THRESHOLD } = SHIPPING_CONFIG
  const categories = [
    ...new Set(
      input.products
        .filter(
          (product) => product.availability !== 'sold' && product.category !== 'custom-commissions'
        )
        .map((product) => product.categoryLabel)
    ),
  ]

  return [
    '## About',
    '',
    '- The Good Opal Co is a small Australian opal business. Prices, including shipping, are in Australian dollars (AUD) and include GST.',
    '- Founder: Stephanie Caruana (Steph), who leads The Good Opal Co and the personal guidance behind each enquiry.',
    '- Steph has written about opal since 2020: cutting a first stone by hand, building a cutting machine on a budget, and how opal from each field behaves on the wheel.',
    '- Sourcing, in Steph\'s words: "We are committed to sourcing all opal ethically and directly from Australian Miners. A majority of the material we source is from Lightning Ridge and Coober Pedy."',
    `- More: ${markdownLink('About', '/about')}`,
    '',
    '## What is sold',
    '',
    '- Loose Australian opals and finished opal jewellery.',
    ...(categories.length
      ? [`- Categories with pieces available now: ${categories.join(', ')}.`]
      : []),
    '- Most pieces are one of a kind: a single stone, photographed individually. Studio shots change the background, never the colour.',
    '- Each product page shows the details known for that piece, such as stone type, origin, weight, dimensions, metal, and ring size. A certificate is included only when the listing says so.',
    '',
    '## How to buy',
    '',
    '- Each product page shows the current price and whether the piece is available, reserved, or sold.',
    `- Payment is by Stripe secure checkout: ${METHODS_ENABLED_IN_STRIPE.join(', ')}. Pay in full or in instalments.`,
    "- A reserved piece is in someone's checkout. If they don't complete payment, it returns to the shop within 30 minutes.",
    `- Sold pieces keep their page and are marked sold. Recently sold pieces: ${markdownLink('Pieces that have found a home', '/store/collected')}.`,
    '- Ask for extra photographs or a virtual viewing before buying.',
    '',
    '## Custom design',
    '',
    `- Custom ring designs start in the ${markdownLink('ring designer', '/services/design')}. More on custom work: ${markdownLink('Custom opal jewellery', '/services')}.`,
    '- Custom work is quoted after the stone, design, material, and timing are understood. The design direction, quote, expected timing, and what is included are confirmed before work begins.',
    '- Custom work is not eligible for change-of-mind returns: commissions, custom rings, stones or parcels cut to order, and the deposit paid for custom work. Australian Consumer Law rights still apply.',
    '',
    '## Courses',
    '',
    `- Steph's course starts with opal anatomy, then moves through low-cost hand cutting, rotary tools, cabbing machines, polishing, and valuation. ${markdownLink('Opal courses', '/courses')}`,
    '',
    '## Shipping',
    '',
    `- Australia: tracked shipping, ${aud(RATES.AUSTRALIA.EXPRESS)} per order.`,
    `- International (${countryNames(SHIPPING_COUNTRIES.INTERNATIONAL)}): tracked shipping, ${aud(RATES.INTERNATIONAL.EXPRESS)} per order. Import duties, taxes, and local charges are paid by the recipient.`,
    `- Free shipping on orders of ${aud(FREE_SHIPPING_THRESHOLD)} or more.`,
    `- ${DELIVERY_ESTIMATE}`,
    '- Tracking details are sent when the carrier accepts the parcel.',
    `- Full policy: ${markdownLink('Shipping', '/shipping')}`,
    '',
    '## Returns',
    '',
    `- Change of mind: contact us within ${RETURN_WINDOW_DAYS} days of delivery. Unused, undamaged pieces in original condition and packaging can be returned; the customer pays return postage.`,
    '- Custom work (commissions, custom rings, stones or parcels cut to order, and the deposit for custom work) is not eligible for change-of-mind returns. Personalised, altered, worn, hygiene-sensitive, and final-sale pieces are excluded too.',
    '- Contact us before posting anything back. Rights under the Australian Consumer Law are not limited by this policy, including for custom work.',
    '- Refunds go to the original payment method through Stripe; Klarna purchases are refunded through Klarna. A change-of-mind refund covers the item price; faulty or incorrect items also get the original shipping refunded. Stripe says refunds take 5 to 10 business days to appear.',
    `- Full policy: ${markdownLink('Returns', '/returns')}`,
    '',
    '## Contact',
    '',
    `- Email ${input.contactEmail} or use ${markdownLink('the contact form', '/contact')}.`,
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
    '## Published courses',
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
  '> Australian opals, finished opal jewellery, custom ring design, and opal education from a small Australian business founded by Stephanie Caruana.',
  '',
]

export function buildLlmsIndex(input: DiscoveryInput): string {
  const live = input.products.filter((product) => product.availability !== 'sold')
  const soldCount = input.products.length - live.length
  const products = live.map(
    (product) =>
      `- ${markdownLink(product.name, `/store/${encodeURIComponent(product.slug)}`)}: ${productFacts(product)}.`
  )

  return [
    ...INTRO,
    `Product pages are the source of truth for current price and availability. A fuller version with every available piece described is at ${APP_URL}/llms-full.txt.`,
    '',
    ...storeFacts(input),
    '## Key pages',
    '',
    `- ${markdownLink('Store', '/store')}`,
    `- ${markdownLink('Custom opal ring designer', '/services/design')}`,
    `- ${markdownLink('Opal courses', '/courses')}`,
    `- ${markdownLink('Journal: opal guides and notes', '/blog')}`,
    `- ${markdownLink('Frequently asked questions', '/faq')}`,
    `- ${markdownLink('About', '/about')}`,
    '',
    `## Pieces in the shop (${live.length})`,
    '',
    ...(products.length ? products : ['- No pieces are currently in the shop.']),
    ...(soldCount > 0
      ? [
          '',
          `${soldCount} sold ${soldCount === 1 ? 'piece is' : 'pieces are'} not listed here. Recently sold pieces are at ${APP_URL}/store/collected.`,
        ]
      : []),
    '',
    ...contentLists(input),
  ].join('\n')
}

export function buildLlmsFull(input: DiscoveryInput): string {
  const available = input.products.filter((product) => product.availability === 'in_stock')
  const products = available.flatMap((product) => [
    `### ${product.name.replace(/[[\]]/g, '')}`,
    '',
    `- URL: ${product.url}`,
    `- Price: ${aud(product.price)}`,
    `- Availability: in stock (${product.stock} available)`,
    `- Category: ${product.categoryLabel}`,
    ...(product.stone ? [`- Stone: ${product.stone}`] : []),
    ...(product.origin ? [`- Origin: ${product.origin}`] : []),
    ...(product.weight ? [`- Weight: ${weightLabel(product.weight)}`] : []),
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
    ...storeFacts(input),
    `## Available pieces (${available.length})`,
    '',
    ...(products.length ? products : ['No pieces are currently available.', '']),
    ...contentLists(input),
  ].join('\n')
}

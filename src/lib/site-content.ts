import { cache } from 'react'
import type { Metadata } from 'next'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { SITE_OPEN_GRAPH } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { extractPlainText } from '@/lib/rich-text'
import { resolveMediaUrl } from '@/lib/media-url'
import type { Media, SiteContent } from '@/types/payload-types'
import { FAQ_DEFAULTS } from '@/lib/faq-defaults'

export type Heading = { text: string; italic: string }
export type Picture = { src: string; alt: string; position?: string }
export type ListItem = Record<string, string>
export type Seo = { title: string; description: string }
export type DateValue = { date: string }
export type RichBody = SerializedEditorState | null
export type ContentValue = string | Heading | Picture | ListItem[] | Seo | DateValue | RichBody

const NO_BODY: RichBody = null

function seo(title: string, description: string): Seo {
  return { title, description }
}

export const SITE_CONTENT_DEFAULTS = {
  home: {
    collectionHeading: { text: 'Walk the', italic: 'collection' },
    customImage: {
      src: '/images/products/shell-freeform-bezel-opal-ring.jpg',
      alt: 'Opal ring in a freeform silver bezel, worn on a finger',
    },
    customHeading: { text: 'Design your own', italic: 'ring' },
    customText: 'Sketch it in 3D. Steph quotes it before any work begins.',
    reviewsHeading: 'In their words.',
    closingHeading: { text: 'Chosen by hand,', italic: 'one stone at a time.' },
    closingText:
      'Stephanie Caruana buys opal direct from Australian miners, mostly from Lightning Ridge and Coober Pedy.',
    closingImage: {
      src: '/images/studio/steph-palm-opals.jpg',
      alt: 'An open palm holding about thirty cut Australian opals, black, white and crystal',
      position: '45% 55%',
    },
    seo: seo(
      'Australian Opals, Chosen by Hand | The Good Opal Co',
      'Shop one-of-a-kind Australian opals and handcrafted jewellery with clear origin, authenticity, delivery, and care details.'
    ),
  },
  about: {
    heroHeading: { text: 'A closer look at', italic: 'Australian opal.' },
    heroText: 'A small Australian opal studio. Every stone is chosen by hand and shown as it is.',
    heroImage1: {
      src: '/images/products/20210819_102749.jpg',
      alt: 'A white opal in a beaded silver halo ring, worn on a finger',
    },
    heroImage2: {
      src: '/images/products/20211129_164004-1-1.jpg',
      alt: 'A polished black opal with green and orange fire',
    },
    heroImage3: {
      src: '/images/products/20211104_231959.jpg',
      alt: 'A polished white opal with green fire, held between two fingers',
    },
    closingHeading: { text: 'Stephanie Caruana,', italic: 'founder and cutter.' },
    closingText:
      'She buys opal direct from Australian miners, mostly from Lightning Ridge and Coober Pedy, and has written about cutting it since 2020.',
    closingImage: {
      src: '/images/studio/steph-at-the-wheel.jpg',
      alt: 'Fingers holding a freshly cut white opal in front of the cutting wheel',
      position: '40% 35%',
    },
    seo: seo(
      'Our Story | The Good Opal Co',
      'Meet The Good Opal Co, an Australian opal studio focused on clear product details, thoughtful selection, and personal guidance.'
    ),
  },
  services: {
    heroHeading: { text: 'Begin with', italic: 'the stone.' },
    heroText:
      'Bring an idea, an occasion or a colour you love. Steph shapes a one-of-a-kind piece around an Australian opal.',
    heroImage: {
      src: '/images/customs/custom-2.jpg',
      alt: 'Four Australian opals viewed together in natural light',
    },
    processHeading: { text: 'Clear decisions,', italic: 'one at a time.' },
    closingHeading: { text: 'Tell us what you', italic: 'have in mind.' },
    closingText:
      'Sketch a ring in 3D or send an enquiry. Steph quotes every piece before work begins.',
    closingImage: {
      src: '/images/customs/custom-1.jpg',
      alt: 'Three heart-shaped Australian opals considered for a personal piece',
    },
    seo: seo(
      'Custom Opal Jewellery | The Good Opal Co',
      'Start with an Australian opal, an idea, or an occasion. Enquire about a one-of-a-kind custom jewellery piece.'
    ),
  },
  courses: {
    heroHeading: { text: 'Learn what the stone can become.', italic: '' },
    heroText:
      'Steph’s course starts with opal anatomy, then moves through low-cost hand cutting, rotary tools, cabbing machines, polishing, and valuation.',
    heroImage1: {
      src: '/images/customs/custom-1.jpg',
      alt: 'Three pale Australian opals cut into heart shapes',
    },
    heroImage2: {
      src: '/images/customs/custom-3.jpg',
      alt: 'Six bright Australian opals showing varied shapes and colour',
    },
    pillars: [
      {
        title: 'Understand the rough',
        body: 'Colour bars, potch, host rock, origin, and opal types.',
      },
      {
        title: 'Choose a cutting method',
        body: 'Sandpaper, rotary tool, and cabbing-machine pathways.',
      },
      {
        title: 'Build valuation judgment',
        body: 'Brightness, pattern, weight, inclusions, and market factors.',
      },
    ],
    courseImage1: {
      src: '/images/customs/custom-2.jpg',
      alt: 'Australian opals selected for cutting practice',
    },
    courseImage2: {
      src: '/images/customs/custom-3.jpg',
      alt: 'Australian opals selected for cutting practice',
    },
    detailImage: {
      src: '/images/customs/custom-2.jpg',
      alt: 'Four Australian opals showing varied colour and pattern',
    },
    seo: seo(
      'Opal cutting courses | The Good Opal Co',
      "Explore Steph's public outline for Australian opal anatomy, cutting, polishing, and valuation."
    ),
  },
  faq: {
    heroHeading: { text: 'Clear answers', italic: 'before you choose.' },
    heroText:
      'Product details, delivery, eligible returns, care, and custom work. If your question is specific to one opal, send us the product link.',
    heroImage: {
      src: '/images/products/20211012_174237.jpg',
      alt: 'Three polished white opals on a dark stone surface',
    },
    questions: FAQ_DEFAULTS,
    closingHeading: { text: 'Still', italic: 'deciding?' },
    closingText: 'Send the product link and tell us what you need to see or understand.',
    closingImage: {
      src: '/images/studio/opal-to-the-torch.jpg',
      alt: 'A hand holding a rough opal up to a small torch in a dark room',
      position: '50% 55%',
    },
    seo: seo(
      'Frequently Asked Questions | The Good Opal Co',
      'Clear answers about Australian opals, product details, delivery, eligible returns, payment, care, and custom work.'
    ),
  },
  gifts: {
    heroHeading: { text: 'Opal gifts, by budget.', italic: '' },
    heroText:
      'Natural Australian opals and opal jewellery, grouped by budget. Every order ships tracked from Cowra NSW.',
    closingHeading: { text: 'Not sure', italic: 'which one?' },
    closingText: 'Tell us who it is for and your budget, and we will suggest a few pieces.',
    closingImage: {
      src: '/images/customs/custom-3.jpg',
      alt: 'Six polished Australian opals with blue, green and pink colour play',
    },
    seo: seo(
      'Opal Gifts by Budget | The Good Opal Co',
      'Natural Australian opals and opal jewellery grouped by budget: under $100, $100 to $250, and $250 and over. Tracked delivery from Cowra NSW.'
    ),
  },
  giftVouchers: {
    heroHeading: { text: 'Gift vouchers.', italic: '' },
    heroText:
      'Let them choose their own opal. The voucher is emailed with your message and can be spent across more than one order.',
    seo: seo(
      'Gift Vouchers | The Good Opal Co',
      'Give a Good Opal Co gift voucher from $25 to $2000, emailed straight to the recipient and valid for three years on natural Australian opals and opal jewellery.'
    ),
  },
  contact: {
    heroHeading: { text: 'Let’s talk', italic: 'opals.' },
    heroText:
      'Ask about a piece, request a closer viewing, or get help with an existing order. Choose the closest topic and share what matters.',
    customIntro:
      'Tell us the piece, stone, budget, and occasion you have in mind. A rough idea is enough to begin.',
    courseIntro:
      'Tell us what you want to learn and your current experience. We will share the confirmed format, timing, and availability when they are ready. This is an interest enquiry only.',
    tipsHeading: 'A useful first message',
    tipsText:
      'Include a product name or link, your approximate budget, and any date that matters. Leave anything unknown blank.',
    courseTipsHeading: 'What helps us reply',
    courseTipsText:
      'Share your current experience, the cutting method you want to learn, and any tools you already use. Leave anything unknown blank.',
    seo: seo(
      'Contact | The Good Opal Co',
      'Ask about an Australian opal, custom piece, order, course, or private product viewing.'
    ),
  },
  blog: {
    heroHeading: { text: 'Journal', italic: '' },
    heroText:
      'Notes on Australian opal: the fields it comes from, how it is cut and set, and what to check before you buy.',
    seo: seo(
      'Journal | The Good Opal Co',
      'Notes on Australian opal: the fields it comes from, how it is cut and set, and what to check before you buy.'
    ),
  },
  terms: {
    heading: 'Terms of Service',
    lastUpdated: { date: '2026-11-25' },
    body: NO_BODY,
  },
  privacy: {
    heading: 'Privacy Policy',
    lastUpdated: { date: '2026-11-25' },
    body: NO_BODY,
  },
  cookies: {
    heading: 'Cookie Policy',
    lastUpdated: { date: '2026-11-25' },
    body: NO_BODY,
  },
  shipping: {
    heading: 'Shipping, without surprises.',
    lastUpdated: { date: '' },
    body: NO_BODY,
  },
  returns: {
    heading: 'A clear way to make things right.',
    lastUpdated: { date: '' },
    body: NO_BODY,
  },
} satisfies Record<string, Record<string, ContentValue>>

export type SitePage = keyof typeof SITE_CONTENT_DEFAULTS
export const SITE_PAGES = Object.keys(SITE_CONTENT_DEFAULTS) as SitePage[]
export type PageContent<P extends SitePage> = (typeof SITE_CONTENT_DEFAULTS)[P]

export const POLICY_PAGES = ['terms', 'privacy', 'cookies', 'shipping', 'returns'] as const

type StoredHeading = { text?: string | null; italic?: string | null }
type StoredPicture = { image?: number | Media | null; alt?: string | null }

function filled(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function resolveHeading(stored: StoredHeading | undefined, fallback: Heading): Heading {
  if (!filled(stored?.text) && !filled(stored?.italic)) return fallback
  return { text: stored?.text?.trim() ?? '', italic: stored?.italic?.trim() ?? '' }
}

function resolvePicture(stored: StoredPicture | undefined, fallback: Picture): Picture {
  const media = stored?.image
  const src = typeof media === 'object' && media ? resolveMediaUrl(media.url) : undefined
  if (!src || typeof media !== 'object' || !media) {
    return filled(stored?.alt) ? { ...fallback, alt: stored.alt } : fallback
  }
  return { src, alt: filled(stored?.alt) ? stored.alt : (media.alt ?? '') }
}

export function isPicture(value: ContentValue): value is Picture {
  return typeof value === 'object' && value !== null && 'src' in value
}

export function isRichBody(value: ContentValue): value is RichBody {
  return value === null || (typeof value === 'object' && 'root' in value)
}

export function isSeo(value: ContentValue): value is Seo {
  return typeof value === 'object' && value !== null && 'description' in value
}

export function isDate(value: ContentValue): value is DateValue {
  return typeof value === 'object' && value !== null && 'date' in value
}

export function formatDate(value: DateValue): string {
  if (!value.date) return ''
  return new Date(value.date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  })
}

function resolveSeo(
  stored: Partial<Record<keyof Seo, string | null>> | undefined,
  fallback: Seo
): Seo {
  return {
    title: filled(stored?.title) ? stored.title.trim() : fallback.title,
    description: filled(stored?.description) ? stored.description.trim() : fallback.description,
  }
}

function resolveDate(stored: unknown, fallback: DateValue): DateValue {
  return typeof stored === 'string' && !Number.isNaN(Date.parse(stored))
    ? { date: stored }
    : fallback
}

function resolveBody(stored: unknown): RichBody {
  if (!stored || typeof stored !== 'object' || !('root' in stored)) return null
  return extractPlainText(stored) ? (stored as SerializedEditorState) : null
}

function resolveList(stored: unknown, fallback: ListItem[]): ListItem[] {
  const keys = Object.keys(fallback[0] ?? {})
  const rows = Array.isArray(stored) ? (stored as Record<string, unknown>[]) : []
  const items = rows
    .map((row) =>
      Object.fromEntries(
        keys.map((key) => {
          const value = row[key]
          return [key, typeof value === 'string' ? value.trim() : '']
        })
      )
    )
    .filter((item) => Object.values(item).some(filled))
  return items.length > 0 ? items : fallback
}

export function resolvePageContent<P extends SitePage>(
  page: P,
  stored: SiteContent[P] | null | undefined
): PageContent<P> {
  const defaults: Record<string, ContentValue> = SITE_CONTENT_DEFAULTS[page]
  const values: Record<string, unknown> = stored ?? {}
  const resolved = Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => {
      const value = values[key]
      if (isRichBody(fallback)) return [key, resolveBody(value)]
      if (typeof fallback === 'string')
        return [key, typeof value === 'string' && filled(value) ? value.trim() : fallback]
      if (Array.isArray(fallback)) return [key, resolveList(value, fallback)]
      if (isPicture(fallback)) return [key, resolvePicture(value as StoredPicture, fallback)]
      if (isSeo(fallback)) return [key, resolveSeo(value as Partial<Seo>, fallback)]
      if (isDate(fallback)) return [key, resolveDate(value, fallback)]
      return [key, resolveHeading(value as StoredHeading, fallback)]
    })
  )
  return resolved as PageContent<P>
}

const readSiteContent = cache(async () => {
  const payload = await getPayload()
  return payload.findGlobal({ slug: 'site-content', depth: 1 })
})

export async function getPageContent<P extends SitePage>(page: P): Promise<PageContent<P>> {
  const payload = await getPayload()
  try {
    const global = await readSiteContent()
    return resolvePageContent(page, global[page])
  } catch (error) {
    payload.logger.error({
      msg: 'Page content could not be read; showing the built-in wording',
      error,
    })
    return SITE_CONTENT_DEFAULTS[page]
  }
}

type SeoPage = { [P in SitePage]: PageContent<P> extends { seo: Seo } ? P : never }[SitePage]

export async function pageMetadata(page: SeoPage, canonical: string): Promise<Metadata> {
  const { seo: values } = await getPageContent(page)
  return {
    title: values.title,
    description: values.description,
    alternates: { canonical },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      title: values.title,
      description: values.description,
      url: canonical,
    },
  }
}

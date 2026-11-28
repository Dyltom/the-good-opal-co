import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import type { Media, SiteContent } from '@/types/payload-types'

export type Heading = { text: string; italic: string }
export type Picture = { src: string; alt: string; position?: string }

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
  },
} satisfies Record<SitePage, Record<string, string | Heading | Picture>>

export type SitePage = 'home' | 'about' | 'services'
export type PageContent<P extends SitePage> = (typeof SITE_CONTENT_DEFAULTS)[P]

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
  return { src, alt: filled(stored?.alt) ? stored.alt : media.alt }
}

function isPicture(value: string | Heading | Picture): value is Picture {
  return typeof value === 'object' && 'src' in value
}

export function resolvePageContent<P extends SitePage>(
  page: P,
  stored: SiteContent[P] | null | undefined
): PageContent<P> {
  const defaults: Record<string, string | Heading | Picture> = SITE_CONTENT_DEFAULTS[page]
  const values: Record<string, unknown> = stored ?? {}
  const resolved = Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => {
      const value = values[key]
      if (typeof fallback === 'string')
        return [key, typeof value === 'string' && filled(value) ? value.trim() : fallback]
      if (isPicture(fallback)) return [key, resolvePicture(value as StoredPicture, fallback)]
      return [key, resolveHeading(value as StoredHeading, fallback)]
    })
  )
  return resolved as PageContent<P>
}

export async function getPageContent<P extends SitePage>(page: P): Promise<PageContent<P>> {
  const payload = await getPayload()
  try {
    const global = await payload.findGlobal({ slug: 'site-content', depth: 1 })
    return resolvePageContent(page, global[page])
  } catch (error) {
    payload.logger.error({
      msg: 'Page content could not be read; showing the built-in wording',
      error,
    })
    return SITE_CONTENT_DEFAULTS[page]
  }
}

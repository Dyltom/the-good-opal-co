import { describe, expect, test, vi } from 'vitest'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

import { resolvePageContent, SITE_CONTENT_DEFAULTS } from '../site-content'
import type { Media } from '@/types/payload-types'

describe('page content', () => {
  test('an empty global shows today’s wording and photos', () => {
    expect(resolvePageContent('home', undefined)).toEqual(SITE_CONTENT_DEFAULTS.home)
    expect(
      resolvePageContent('about', { heroHeading: { text: '', italic: null }, heroText: '  ' })
    ).toEqual(SITE_CONTENT_DEFAULTS.about)
  })

  test('a chosen photo and heading replace the defaults', () => {
    const photo = { id: 4, url: '/api/media/file/bench.jpg', alt: 'Steph at the bench' } as Media

    const content = resolvePageContent('services', {
      heroHeading: { text: 'Start with', italic: 'an opal.' },
      heroImage: { image: photo, alt: null },
    })

    expect(content.heroHeading).toEqual({ text: 'Start with', italic: 'an opal.' })
    expect(content.heroImage).toEqual({
      src: '/api/media/file/bench.jpg',
      alt: 'Steph at the bench',
    })
    expect(content.closingImage).toEqual(SITE_CONTENT_DEFAULTS.services.closingImage)
  })
})

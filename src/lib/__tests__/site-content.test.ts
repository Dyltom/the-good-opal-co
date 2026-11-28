import { describe, expect, test, vi } from 'vitest'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

import { formatDate, resolvePageContent, SITE_CONTENT_DEFAULTS } from '../site-content'
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

  test('an empty or blank list shows today’s list', () => {
    expect(resolvePageContent('faq', { questions: [] }).questions).toEqual(
      SITE_CONTENT_DEFAULTS.faq.questions
    )
    expect(
      resolvePageContent('courses', { pillars: [{ title: ' ', body: null }] }).pillars
    ).toEqual(SITE_CONTENT_DEFAULTS.courses.pillars)
  })

  test('a saved list replaces today’s list in its order', () => {
    const content = resolvePageContent('courses', {
      pillars: [
        { title: 'Polish', body: 'Felt wheels.', id: 'a' },
        { title: 'Cut', body: null, id: 'b' },
      ],
    })

    expect(content.pillars).toEqual([
      { title: 'Polish', body: 'Felt wheels.' },
      { title: 'Cut', body: '' },
    ])
  })

  test('an empty policy page keeps today’s text, heading, date and search title', () => {
    const content = resolvePageContent('privacy', {
      heading: ' ',
      lastUpdated: null,
      body: {
        root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
      },
    })

    expect(content).toEqual(SITE_CONTENT_DEFAULTS.privacy)
    expect(content.body).toBeNull()
    expect(formatDate(content.lastUpdated)).toBe('25 November 2026')
    expect(resolvePageContent('faq', { seo: { title: 'FAQ', description: '' } }).seo).toEqual({
      title: 'FAQ',
      description: SITE_CONTENT_DEFAULTS.faq.seo.description,
    })
  })

  test('a written policy body and date replace today’s page', () => {
    const body = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [{ type: 'text', text: 'We keep it simple.', version: 1 }],
          },
        ],
        direction: null,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    }

    const content = resolvePageContent('terms', { body, lastUpdated: '2026-12-01T13:00:00.000Z' })

    expect(content.body).toEqual(body)
    expect(formatDate(content.lastUpdated)).toBe('2 December 2026')
  })
})

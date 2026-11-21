import { describe, expect, test } from 'vitest'
import { extractPlainText, postSummary, rewriteLegacyPostLinks } from '@/lib/rich-text'

describe('rich text plain-text extraction', () => {
  test('returns a trimmed string unchanged', () => {
    expect(extractPlainText('  Australian opal  ')).toBe('Australian opal')
  })

  test('recursively reads nested Lexical text nodes', () => {
    expect(
      extractPlainText({
        root: {
          children: [
            { children: [{ text: 'Bright' }, { text: ' Australian' }] },
            { children: [{ children: [{ text: 'opal' }] }] },
          ],
        },
      })
    ).toBe('Bright Australian opal')
  })

  test.each([null, undefined, 42, { root: { children: [] } }])(
    'returns an empty string for unsupported content',
    (value) => {
      expect(extractPlainText(value)).toBe('')
    }
  )
})

describe('legacy blog links', () => {
  function link(url: string, text: string) {
    return { root: { children: [{ type: 'paragraph', children: [{ type: 'link', fields: { url, newTab: false }, children: [{ type: 'text', text }] }] }] } }
  }

  test('points dated WordPress post links at the matching /blog page', () => {
    const legacy = 'https://goodopalco.com/2021/05/27/lightning-ridge-opal/'

    expect(rewriteLegacyPostLinks(link(legacy, legacy), 'https://goodopalco.com')).toEqual(
      link('/blog/lightning-ridge-opal', 'https://goodopalco.com/blog/lightning-ridge-opal')
    )
    expect(rewriteLegacyPostLinks(link(legacy, 'our Lightning Ridge guide'), 'https://goodopalco.com')).toEqual(
      link('/blog/lightning-ridge-opal', 'our Lightning Ridge guide')
    )
  })

  test('leaves other goodopalco.com links alone', () => {
    const contact = link('https://goodopalco.com/contact/', 'https://goodopalco.com/contact/')

    expect(rewriteLegacyPostLinks(contact, 'https://goodopalco.com')).toEqual(contact)
  })
})

describe('post summaries', () => {
  const content = {
    root: {
      children: [
        { type: 'heading', children: [{ text: 'How Opal is mined' }] },
        { type: 'paragraph', children: [{ text: 'When the first opal shafts were dug, miners worked by hand.' }] },
        { type: 'paragraph', children: [{ text: 'Later fields brought in diesel equipment and blowers.' }] },
      ],
    },
  }

  test('rebuilds a truncated excerpt from body paragraphs without the heading running into it', () => {
    expect(postSummary('How Opal is mined When the first opal shafts were dug, they …', content, 80)).toBe(
      'When the first opal shafts were dug, miners worked by hand. Later fields…'
    )
  })

  test('keeps a hand-written excerpt', () => {
    expect(postSummary('A short guide to mining.', content)).toBe('A short guide to mining.')
  })
})

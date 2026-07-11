import { describe, expect, test } from 'vitest'
import { extractPlainText } from '@/lib/rich-text'

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

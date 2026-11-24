import { describe, expect, test } from 'vitest'
import { hasSameNumbers, parseProductDescription } from '@/lib/product-description'

const wooListing = `This Lightning Ridge Semi Black Opal weighs 5.50 cts and would make a beautiful ring stone. Inclusions are: natural webbing and a sand spot.

This opal is free form but can be reshaped into an oval free of charge if desired.

Please note:

Priced in AUD

All images and videos are taken under white light to provide the best real-life presentation of the opal and are not edited or misleading.

If you have any queries regarding the item, please fill out the form below.

 Message Sent
Name:
Email Address:`

describe('product description from imported listings', () => {
  test('drops the legacy store footer and contact form text', () => {
    const description = parseProductDescription(wooListing)

    expect(description.paragraphs).toEqual([
      'This Lightning Ridge Semi Black Opal weighs 5.50 cts and would make a beautiful ring stone.',
      'This opal is free form but can be reshaped into an oval free of charge if desired.',
    ])
  })

  test('surfaces disclosed inclusions and the white-light photo statement', () => {
    const description = parseProductDescription(wooListing)

    expect(description.inclusions).toBe('natural webbing and a sand spot')
    expect(description.photographedUnderWhiteLight).toBe(true)
  })

  test('keeps paragraph breaks from rich text and makes no photo claim it was not given', () => {
    const description = parseProductDescription({
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'First paragraph.' }] },
          { type: 'paragraph', children: [{ type: 'text', text: 'Second paragraph.' }] },
        ],
      },
    })

    expect(description.paragraphs).toEqual(['First paragraph.', 'Second paragraph.'])
    expect(description.photographedUnderWhiteLight).toBe(false)
  })
})

describe('hasSameNumbers', () => {
  test('treats a described measurement as the same fact as the structured dimensions in any order', () => {
    expect(hasSameNumbers('9.5 × 5.3 × 2.5 mm', '5.3 x 9.5 x 2.5 mm')).toBe(true)
    expect(hasSameNumbers('9.5 × 5.3 × 2.5 mm', '9.5 x 5.3 x 3 mm')).toBe(false)
    expect(hasSameNumbers('Lightning Ridge', 'Coober Pedy')).toBe(false)
  })
})

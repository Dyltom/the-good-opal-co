import { describe, expect, it } from 'vitest'
import { parseWordPressProductImages } from '../product-images'

describe('WordPress product image import', () => {
  it('maps the first safe source image and creates useful fallback alt text', () => {
    expect(
      parseWordPressProductImages([
        {
          id: 5676,
          name: 'Crystal Opal Earrings &#8211; Bouquet studs',
          images: [
            {
              id: 5679,
              src: 'https://goodopalco.com/wp-content/uploads/2023/07/IMG_5903.jpg',
              alt: '',
              name: 'IMG_5903',
            },
          ],
        },
      ])
    ).toEqual([
      {
        productId: 5676,
        productName: 'Crystal Opal Earrings – Bouquet studs',
        media: {
          id: 5679,
          alt: 'Crystal Opal Earrings – Bouquet studs',
          mimeType: 'image/jpeg',
          sourceUrl: 'https://goodopalco.com/wp-content/uploads/2023/07/IMG_5903.jpg',
          title: 'IMG_5903',
        },
      },
    ])
  })

  it('skips products without images and rejects unsupported files', () => {
    expect(parseWordPressProductImages([{ id: 1, name: 'No image', images: [] }])).toEqual([])
    expect(() =>
      parseWordPressProductImages([
        {
          id: 2,
          name: 'Vector',
          images: [
            {
              id: 3,
              src: 'https://goodopalco.com/wp-content/uploads/vector.svg',
              alt: '',
              name: 'Vector',
            },
          ],
        },
      ])
    ).toThrow('Unsupported')
  })
})

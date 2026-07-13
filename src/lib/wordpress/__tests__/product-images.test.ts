import { describe, expect, it, vi } from 'vitest'
import { fetchWordPressProductImages, parseWordPressProductImages } from '../product-images'

describe('WordPress product image import', () => {
  it('maps every source image in Woo order and creates useful fallback alt text', () => {
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
            {
              id: 5680,
              src: 'https://goodopalco.com/wp-content/uploads/2023/07/IMG_5903-side.jpg',
              alt: 'Earring profile',
              name: 'IMG_5903 side',
            },
          ],
        },
      ])
    ).toEqual([
      {
        productId: 5676,
        productName: 'Crystal Opal Earrings – Bouquet studs',
        media: [
          {
            id: 5679,
            alt: 'Crystal Opal Earrings – Bouquet studs',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2023/07/IMG_5903.jpg',
            title: 'IMG_5903',
          },
          {
            id: 5680,
            alt: 'Earring profile',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2023/07/IMG_5903-side.jpg',
            title: 'IMG_5903 side',
          },
        ],
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

  it('includes sold products when fetching the source gallery', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([]), {
        headers: { 'x-wp-totalpages': '1' },
      })
    )

    await fetchWordPressProductImages(fetcher)

    const input = fetcher.mock.calls[0]?.[0]
    expect(new URL(String(input)).searchParams.get('stock_status')).toBe(
      'instock,outofstock,onbackorder'
    )
  })
})

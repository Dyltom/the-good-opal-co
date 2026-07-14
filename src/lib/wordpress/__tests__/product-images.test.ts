import { describe, expect, it, vi } from 'vitest'
import { fetchWordPressProductImages, parseWordPressProductImages } from '../product-images'

describe('WordPress product image import', () => {
  it('maps every source image in Woo order and creates useful fallback alt text', () => {
    expect(
      parseWordPressProductImages([
        {
          id: 5676,
          name: 'Crystal Opal Earrings &#8211; Bouquet studs',
          is_in_stock: true,
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
        inStock: true,
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

  it('retains empty galleries so stale Payload images can be cleared', () => {
    expect(
      parseWordPressProductImages([
        { id: 1, name: 'No image', is_in_stock: false, images: [] },
      ])
    ).toEqual([{ inStock: false, productId: 1, productName: 'No image', media: [] }])
  })

  it('repairs the known cross-product alt assignment at the import boundary', () => {
    const [product] = parseWordPressProductImages([
      {
        id: 4543,
        name: 'Queensland Boulder Opal 20 cts',
        is_in_stock: true,
        images: [
          {
            id: 4544,
            src: 'https://goodopalco.com/wp-content/uploads/2021/05/20210505_102859.jpg',
            alt: 'Large Koroit Boulder Opal Specimen 108.65 cts',
            name: '20210505_102859',
          },
        ],
      },
    ])

    expect(product?.media[0]?.alt).toBe('Queensland Boulder Opal 20 cts')
  })

  it('rejects unsupported files', () => {
    expect(() =>
      parseWordPressProductImages([
        {
          id: 2,
          name: 'Vector',
          is_in_stock: true,
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

    await fetchWordPressProductImages({
      baseUrl: 'https://goodopalco.com/wp-json/wc/store/v1/products',
      fetcher,
    })

    const input = fetcher.mock.calls[0]?.[0]
    expect(new URL(String(input)).searchParams.get('stock_status')).toBe(
      'instock,outofstock,onbackorder'
    )
  })

  it('uses the configured Store API endpoint', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([]), {
        headers: { 'x-wp-totalpages': '1' },
      })
    )

    await fetchWordPressProductImages({
      baseUrl: 'https://www.goodopalco.com/custom/store/products',
      fetcher,
    })

    expect(String(fetcher.mock.calls[0]?.[0])).toContain(
      'https://www.goodopalco.com/custom/store/products'
    )
  })
})

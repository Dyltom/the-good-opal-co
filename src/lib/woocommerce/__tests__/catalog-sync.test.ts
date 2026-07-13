import { describe, expect, it, vi } from 'vitest'
import {
  decodeHtmlEntities,
  fetchWooCatalog,
  parseWooProductPage,
  reconciledStock,
} from '../catalog-sync'

const wooProduct = {
  id: 5681,
  name: 'Doublet Opal Earrings &#8211; Bouquet studs',
  slug: 'doublet-opal-earrings-bouquet-studs',
  description: '<p>Lightning Ridge <strong>opal</strong>.</p>',
  short_description: '',
  prices: {
    price: '17500',
    regular_price: '20000',
    sale_price: '17500',
    currency_code: 'AUD',
    currency_minor_unit: 2,
  },
  categories: [{ name: 'Jewellery', slug: 'good-jewels' }],
  tags: [{ name: 'opal earrings', slug: 'opal-earrings' }],
  is_in_stock: true,
}

describe('WooCommerce catalog sync', () => {
  it('validates and maps Store API prices, entities, taxonomy, and SKU', () => {
    expect(parseWooProductPage([wooProduct])).toEqual([
      {
        wooId: 5681,
        sku: 'WP-5681',
        name: 'Doublet Opal Earrings – Bouquet studs',
        slug: 'doublet-opal-earrings-bouquet-studs',
        description: 'Lightning Ridge opal.',
        price: 175,
        compareAtPrice: 200,
        category: 'opal-earrings',
        tags: ['opal earrings'],
        inStock: true,
      },
    ])
  })

  it('rejects malformed or non-AUD source data', () => {
    expect(() =>
      parseWooProductPage([
        { ...wooProduct, prices: { ...wooProduct.prices, currency_code: 'USD' } },
      ])
    ).toThrow()
  })

  it('never restocks sold local inventory unless explicitly requested', () => {
    expect(reconciledStock(0, true, false)).toBe(0)
    expect(reconciledStock(0, true, true)).toBe(1)
    expect(reconciledStock(4, true, false)).toBe(4)
    expect(reconciledStock(4, false, false)).toBe(0)
  })

  it('fetches every advertised page', async () => {
    const fetcher = vi.fn<typeof fetch>()
    fetcher
      .mockResolvedValueOnce(
        new Response(JSON.stringify([wooProduct]), {
          headers: { 'x-wp-totalpages': '2' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ ...wooProduct, id: 5676, slug: 'second-product' }]), {
          headers: { 'x-wp-totalpages': '2' },
        })
      )

    const products = await fetchWooCatalog({ fetcher, perPage: 1 })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(products.map((product) => product.wooId)).toEqual([5681, 5676])
    for (const [input] of fetcher.mock.calls) {
      expect(new URL(String(input)).searchParams.get('stock_status')).toBe(
        'instock,outofstock,onbackorder'
      )
    }
  })

  it('decodes named and numeric HTML entities', () => {
    expect(decodeHtmlEntities('A &amp; B &#8211; C &#x27;D&#x27;')).toBe("A & B – C 'D'")
  })

  it('drops embedded forms from imported fallback descriptions', () => {
    const mapped = parseWooProductPage([
      {
        ...wooProduct,
        description: '<p>Real product copy.</p><form><label>Name</label><input></form>',
      },
    ])

    expect(mapped[0]?.description).toBe('Real product copy.')
  })
})

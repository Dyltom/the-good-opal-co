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

  it('uses authenticated managed quantity as stock truth', () => {
    expect(reconciledStock(5, true, false, 3)).toBe(3)
    expect(reconciledStock(0, true, false, 8)).toBe(8)
    expect(reconciledStock(8, false, false, 8)).toBe(0)
    expect(reconciledStock(8, true, false, null)).toBe(8)
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

  it('overlays exact stock through authenticated REST without putting secrets in the URL', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([wooProduct]), {
          headers: { 'x-wp-totalpages': '1' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ id: 5681, stock_quantity: 5, stock_status: 'instock' }])
        )
      )

    const products = await fetchWooCatalog({
      consumerKey: 'ck_read_only',
      consumerSecret: 'cs_private',
      fetcher,
    })

    expect(products[0]).toMatchObject({ inStock: true, stockQuantity: 5, wooId: 5681 })
    const [stockInput, stockInit] = fetcher.mock.calls[1] ?? []
    const stockUrl = new URL(String(stockInput))
    expect(stockUrl.pathname).toBe('/wp-json/wc/v3/products')
    expect(stockUrl.searchParams.get('include')).toBe('5681')
    expect(stockUrl.toString()).not.toContain('ck_read_only')
    expect(stockUrl.toString()).not.toContain('cs_private')
    expect(new Headers(stockInit?.headers).get('authorization')).toBe(
      `Basic ${Buffer.from('ck_read_only:cs_private').toString('base64')}`
    )
  })

  it('preserves public fallback when both stock credentials are absent', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify([wooProduct]), {
        headers: { 'x-wp-totalpages': '1' },
      })
    )

    const products = await fetchWooCatalog({ fetcher })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(products[0]).not.toHaveProperty('stockQuantity')
  })

  it('rejects partial stock credentials before making an authenticated request', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify([wooProduct]), {
        headers: { 'x-wp-totalpages': '1' },
      })
    )

    await expect(
      fetchWooCatalog({ consumerKey: 'ck_without_secret', fetcher })
    ).rejects.toThrow('must include both key and secret')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refuses an incomplete authenticated stock snapshot', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([wooProduct]), {
          headers: { 'x-wp-totalpages': '1' },
        })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([])))

    await expect(
      fetchWooCatalog({
        consumerKey: 'ck_read_only',
        consumerSecret: 'cs_private',
        fetcher,
      })
    ).rejects.toThrow('omitted catalogue products')
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

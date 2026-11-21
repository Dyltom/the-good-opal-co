import { describe, expect, test } from 'vitest'
import { buildGoogleMerchantFeed } from '../merchant-feed'
import { catalogProduct } from './catalog-fixture'

function item(feed: string, sku: string): string {
  return feed.split('<item>').find((entry) => entry.includes(`<g:id>${sku}</g:id>`)) ?? ''
}

describe('Google Merchant feed', () => {
  test('lists prices in AUD with two decimals and maps stock to availability', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'A', price: 350 }),
      catalogProduct({ sku: 'B', price: 99.5, stock: 0, inStock: false }),
    ])

    expect(item(feed, 'A')).toContain('<g:price>350.00 AUD</g:price>')
    expect(item(feed, 'A')).toContain('<g:availability>in_stock</g:availability>')
    expect(item(feed, 'B')).toContain('<g:price>99.50 AUD</g:price>')
    expect(item(feed, 'B')).toContain('<g:availability>out_of_stock</g:availability>')
  })

  test('escapes CMS text and drops characters that would break the XML', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'X', name: 'Opal & <Fire> "ring"', description: 'Bright\u0007 & bold' }),
    ])

    expect(feed).toContain('<g:title>Opal &amp; &lt;Fire&gt; &quot;ring&quot;</g:title>')
    expect(feed).toContain('<g:description>Bright &amp; bold</g:description>')
    expect(feed).not.toContain('\u0007')
  })

  test('skips products Google would reject for having no image', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'WITH' }),
      catalogProduct({ sku: 'WITHOUT', images: [] }),
    ])

    expect(feed).toContain('<g:id>WITH</g:id>')
    expect(feed).not.toContain('<g:id>WITHOUT</g:id>')
  })

  test('leaves out commission deposits, which Google rejects as services', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'RING', category: 'opal-rings' }),
      catalogProduct({ sku: 'DEPOSIT', category: 'custom-commissions', price: 50 }),
    ])

    expect(feed).toContain('<g:id>RING</g:id>')
    expect(feed).not.toContain('<g:id>DEPOSIT</g:id>')
  })

  test('quotes the real per-country shipping charge, free from the threshold', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'LOW', price: 120 }),
      catalogProduct({ sku: 'HIGH', price: 500 }),
    ])
    const shipping = (sku: string, country: string) =>
      item(feed, sku).match(new RegExp(`<g:country>${country}</g:country>.*?<g:price>([^<]+)</g:price>`))?.[1]

    expect(shipping('LOW', 'AU')).toBe('15.00 AUD')
    expect(shipping('LOW', 'NZ')).toBe('25.00 AUD')
    expect(shipping('HIGH', 'AU')).toBe('0.00 AUD')
    expect(shipping('HIGH', 'US')).toBe('0.00 AUD')
  })
})

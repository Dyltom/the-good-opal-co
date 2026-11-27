import { describe, expect, test } from 'vitest'
import { buildGoogleMerchantFeed } from '../merchant-feed'
import { catalogProduct } from './catalog-fixture'

function item(feed: string, sku: string): string {
  return feed.split('<item>').find((entry) => entry.includes(`<g:id>${sku}</g:id>`)) ?? ''
}

describe('Google Merchant feed', () => {
  test('lists prices in AUD with two decimals and only offers pieces that can be bought now', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'A', price: 350 }),
      catalogProduct({ sku: 'B', price: 99.5, stock: 0, availability: 'sold' }),
      catalogProduct({ sku: 'C', stock: 0, availability: 'reserved' }),
    ])

    expect(item(feed, 'A')).toContain('<g:price>350.00 AUD</g:price>')
    expect(item(feed, 'A')).toContain('<g:availability>in_stock</g:availability>')
    expect(item(feed, 'B')).toContain('<g:price>99.50 AUD</g:price>')
    expect(item(feed, 'B')).toContain('<g:availability>out_of_stock</g:availability>')
    expect(item(feed, 'C')).toContain('<g:availability>out_of_stock</g:availability>')
  })

  test('escapes CMS text and drops characters that would break the XML', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({
        sku: 'X',
        name: 'Opal & <Fire> "ring"',
        description: 'Bright\u0007 & bold',
      }),
    ])

    expect(feed).toContain('<g:title>Opal &amp; &lt;Fire&gt; &quot;ring&quot;</g:title>')
    expect(feed).toContain('<g:description>Bright &amp; bold')
    expect(feed).not.toContain('\u0007')
  })

  test('spells out the variety, origin and weight Google looks for in a loose opal description', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({
        sku: 'HEART',
        description: 'A carved heart parcel.',
        stone: 'White Opal',
        origin: 'Coober Pedy, SA',
        weight: { value: 1.25, unit: 'ct' },
      }),
    ])

    expect(item(feed, 'HEART')).toContain(
      '<g:description>A carved heart parcel. Variety: White Opal. Origin: Coober Pedy, SA. Weight: 1.25 ct.</g:description>'
    )
  })

  test('announces the Black Friday price ahead of time with the dates it applies', () => {
    const feed = buildGoogleMerchantFeed(
      [catalogProduct({ sku: 'RING', category: 'opal-rings', price: 345 })],
      new Date('2026-11-24T09:00:00+11:00')
    )

    expect(item(feed, 'RING')).toContain('<g:price>345.00 AUD</g:price>')
    expect(item(feed, 'RING')).toContain('<g:sale_price>293.25 AUD</g:sale_price>')
    expect(item(feed, 'RING')).toContain(
      '<g:sale_price_effective_date>2026-11-26T13:00:00.000Z/2026-11-30T13:00:00.000Z</g:sale_price_effective_date>'
    )
  })

  test('drops the sale price once the sale is over', () => {
    const feed = buildGoogleMerchantFeed(
      [catalogProduct({ sku: 'RING' })],
      new Date('2026-12-02T09:00:00+11:00')
    )
    expect(item(feed, 'RING')).not.toContain('sale_price')
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

  test('quotes the real per-country shipping charge, with Extra Cover in Australia over $100', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'LOW', price: 90 }),
      catalogProduct({ sku: 'HIGH', price: 500 }),
    ])
    const shipping = (sku: string, country: string) =>
      item(feed, sku).match(
        new RegExp(`<g:country>${country}</g:country>.*?<g:price>([^<]+)</g:price>`)
      )?.[1]

    expect(shipping('LOW', 'AU')).toBe('10.20 AUD')
    expect(shipping('LOW', 'NZ')).toBe('17.90 AUD')
    expect(shipping('LOW', 'US')).toBe('23.05 AUD')
    expect(shipping('HIGH', 'AU')).toBe('20.20 AUD')
    expect(shipping('HIGH', 'US')).toBe('23.05 AUD')
  })

  test('marks jewellery for adults, as Google requires for apparel and accessories', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'RING', category: 'opal-rings' }),
      catalogProduct({ sku: 'ROUGH', category: 'raw-opals' }),
    ])

    expect(item(feed, 'RING')).toContain('<g:age_group>adult</g:age_group>')
    expect(item(feed, 'ROUGH')).not.toContain('age_group')
  })

  test('offers loose opals to every destination but Singapore, which needs an import permit', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'RING', category: 'opal-rings' }),
      catalogProduct({ sku: 'ROUGH', category: 'raw-opals' }),
    ])

    expect(item(feed, 'RING')).toContain('<g:country>SG</g:country>')
    expect(item(feed, 'ROUGH')).not.toContain('<g:country>SG</g:country>')
    expect(item(feed, 'ROUGH')).toContain('<g:country>US</g:country>')
  })

  test('states the same dispatch and transit times as the shipping page', () => {
    const entry = item(buildGoogleMerchantFeed([catalogProduct({ sku: 'T' })]), 'T')
    const transit = (country: string) =>
      entry
        .match(
          new RegExp(
            `<g:country>${country}</g:country>.*?<g:min_transit_time>(\\d+)</g:min_transit_time><g:max_transit_time>(\\d+)</g:max_transit_time>`
          )
        )
        ?.slice(1)

    expect(entry).toContain('<g:max_handling_time>2</g:max_handling_time>')
    expect(transit('AU')).toEqual(['2', '6'])
    expect(transit('NZ')).toEqual(['5', '10'])
  })

  test('labels each piece with its price band so ads can bid less on cheap stones', () => {
    const feed = buildGoogleMerchantFeed([
      catalogProduct({ sku: 'CHEAP', price: 45 }),
      catalogProduct({ sku: 'MID', price: 60 }),
      catalogProduct({ sku: 'UPPER', price: 175 }),
      catalogProduct({ sku: 'RING', price: 350 }),
    ])

    expect(item(feed, 'CHEAP')).toContain('<g:custom_label_0>under-60</g:custom_label_0>')
    expect(item(feed, 'MID')).toContain('<g:custom_label_0>60-149</g:custom_label_0>')
    expect(item(feed, 'UPPER')).toContain('<g:custom_label_0>150-249</g:custom_label_0>')
    expect(item(feed, 'RING')).toContain('<g:custom_label_0>250-plus</g:custom_label_0>')
  })
})

import { APP_NAME, APP_URL } from '@/lib/constants'
import {
  cheapestShippingOption,
  DISPATCH_BUSINESS_DAYS,
  SHIPPING_COUNTRIES,
} from '@/lib/constants/shipping'
import { escapeXml } from '@/lib/discovery'
import { nextSale, saleApplies, salePrice } from '@/lib/promotions'
import type { CatalogProduct } from '@/lib/catalog'

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  'opal-rings': '200',
  'opal-necklaces': '196',
  'opal-earrings': '194',
  'opal-bracelets': '191',
  'raw-opals': '198',
}

function shippingTags(price: number): string[] {
  return SHIPPING_COUNTRIES.map((country) => {
    const option = cheapestShippingOption(country, price)
    return `<g:shipping>${tag('country', country)}${tag('service', `Australia Post ${option.label}`)}${tag('price', aud(option.cents / 100))}${tag('min_transit_time', String(option.days.min))}${tag('max_transit_time', String(option.days.max))}</g:shipping>`
  })
}

const PRICE_BANDS: [number, string][] = [
  [250, '250-plus'],
  [150, '150-249'],
  [60, '60-149'],
  [0, 'under-60'],
]

function priceBand(price: number): string {
  return PRICE_BANDS.find(([floor]) => price >= floor)?.[1] ?? 'under-60'
}

function aud(amount: number): string {
  return `${amount.toFixed(2)} AUD`
}

function tag(name: string, value: string): string {
  return `<g:${name}>${escapeXml(value)}</g:${name}>`
}

function saleTags(product: CatalogProduct, now: Date): string[] {
  const sale = saleApplies(product.category) ? nextSale(now) : undefined
  if (!sale) return []
  return [
    tag('sale_price', aud(salePrice(product.regularPrice, sale))),
    tag('sale_price_effective_date', `${sale.startsAt.toISOString()}/${sale.endsAt.toISOString()}`),
  ]
}

function merchantItem(product: CatalogProduct, now: Date): string {
  const [imageLink, ...additionalImages] = product.images

  return [
    '<item>',
    tag('id', product.sku),
    tag('title', product.name.slice(0, 150)),
    tag('description', (product.description || product.name).slice(0, 5000)),
    tag('link', product.url),
    imageLink ? tag('image_link', imageLink) : '',
    ...additionalImages.slice(0, 10).map((image) => tag('additional_image_link', image)),
    tag('availability', product.availability === 'in_stock' ? 'in_stock' : 'out_of_stock'),
    tag('price', aud(product.regularPrice)),
    ...saleTags(product, now),
    tag('brand', APP_NAME),
    tag('condition', 'new'),
    tag('identifier_exists', 'no'),
    tag('google_product_category', GOOGLE_PRODUCT_CATEGORY[product.category] ?? '188'),
    tag('product_type', product.categoryLabel),
    tag('custom_label_0', priceBand(product.regularPrice)),
    product.stone
      ? `<g:product_detail>${tag('section_name', 'Gemstone')}${tag('attribute_name', 'Variety')}${tag('attribute_value', product.stone)}</g:product_detail>`
      : '',
    tag('min_handling_time', String(DISPATCH_BUSINESS_DAYS.min)),
    tag('max_handling_time', String(DISPATCH_BUSINESS_DAYS.max)),
    ...shippingTags(product.price),
    '</item>',
  ].join('')
}

export function buildGoogleMerchantFeed(products: CatalogProduct[], now = new Date()): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    `<title>${escapeXml(APP_NAME)}</title>`,
    `<link>${escapeXml(APP_URL)}</link>`,
    '<description>Australian opals and opal jewellery.</description>',
    ...products
      .filter((product) => product.images.length > 0 && product.category !== 'custom-commissions')
      .map((product) => merchantItem(product, now)),
    '</channel>',
    '</rss>',
  ].join('\n')
}

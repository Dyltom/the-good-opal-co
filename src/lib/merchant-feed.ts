import { APP_NAME, APP_URL } from '@/lib/constants'
import { calculateShipping, SHIPPING_COUNTRIES } from '@/lib/constants/shipping'
import { escapeXml } from '@/lib/discovery'
import type { CatalogProduct } from '@/lib/catalog'

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  'opal-rings': '200',
  'opal-necklaces': '196',
  'opal-earrings': '194',
  'opal-bracelets': '191',
  'raw-opals': '198',
}

interface ShippingRate {
  country: string
  price: number
}

function productShippingRates(price: number): ShippingRate[] {
  return [
    ...SHIPPING_COUNTRIES.AUSTRALIA.map((country) => ({
      country,
      price: calculateShipping(price, 'AUSTRALIA'),
    })),
    ...SHIPPING_COUNTRIES.INTERNATIONAL.map((country) => ({
      country,
      price: calculateShipping(price, 'INTERNATIONAL'),
    })),
  ]
}

function aud(amount: number): string {
  return `${amount.toFixed(2)} AUD`
}

function tag(name: string, value: string): string {
  return `<g:${name}>${escapeXml(value)}</g:${name}>`
}

function merchantItem(product: CatalogProduct): string {
  const [imageLink, ...additionalImages] = product.images

  return [
    '<item>',
    tag('id', product.sku),
    tag('title', product.name.slice(0, 150)),
    tag('description', (product.description || product.name).slice(0, 5000)),
    tag('link', product.url),
    imageLink ? tag('image_link', imageLink) : '',
    ...additionalImages.slice(0, 10).map((image) => tag('additional_image_link', image)),
    tag('availability', product.inStock ? 'in_stock' : 'out_of_stock'),
    tag('price', aud(product.price)),
    tag('brand', APP_NAME),
    tag('condition', 'new'),
    tag('identifier_exists', 'no'),
    tag('google_product_category', GOOGLE_PRODUCT_CATEGORY[product.category] ?? '188'),
    tag('product_type', product.categoryLabel),
    ...productShippingRates(product.price).map(
      (rate) =>
        `<g:shipping>${tag('country', rate.country)}${tag('service', 'Tracked shipping')}${tag('price', aud(rate.price))}</g:shipping>`
    ),
    '</item>',
  ].join('')
}

export function buildGoogleMerchantFeed(products: CatalogProduct[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    `<title>${escapeXml(APP_NAME)}</title>`,
    `<link>${escapeXml(APP_URL)}</link>`,
    '<description>Australian opals and opal jewellery.</description>',
    ...products
      .filter((product) => product.images.length > 0 && product.category !== 'custom-commissions')
      .map(merchantItem),
    '</channel>',
    '</rss>',
  ].join('\n')
}

import { describe, expect, test } from 'vitest'
import {
  collectionStructuredData,
  courseStructuredData,
  organizationStructuredData,
  productStructuredData,
  serializeJsonLd,
} from '../json-ld'
import { APP_URL } from '@/lib/constants'

describe('JSON-LD serialization', () => {
  test('escapes script-breaking CMS content while preserving parsed data', () => {
    const malicious = '</script><script>alert("opal")</script> & \u2028'
    const serialized = serializeJsonLd({ name: malicious })

    expect(serialized).not.toContain('<')
    expect(serialized).not.toContain('>')
    expect(serialized).not.toContain('&')
    expect(serialized).not.toContain('\u2028')
    expect(JSON.parse(serialized)).toEqual({ name: malicious })
  })
})

describe('structured data', () => {
  test('describes the verified business entity and published return policy', () => {
    const data = organizationStructuredData()

    expect(data).toMatchObject({
      '@type': 'Organization',
      name: 'The Good Opal Co',
      founder: { '@type': 'Person', name: 'Stephanie Caruana' },
      address: { addressLocality: 'Sydney', addressRegion: 'NSW', addressCountry: 'AU' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
    })
  })

  test('publishes free Australian delivery when one product meets the threshold', () => {
    const data = productStructuredData({
      name: 'Collector opal',
      slug: 'collector-opal',
      description: 'A collector stone.',
      price: 500,
      images: [],
      stock: 1,
    })

    expect(data).toMatchObject({
      offers: { shippingDetails: { shippingRate: { value: 0, currency: 'AUD' } } },
    })
  })

  test('describes a purchasable product with accurate AUD offer policies', () => {
    const data = productStructuredData({
      name: 'Lightning Ridge opal',
      slug: 'lightning-ridge-opal',
      description: 'A bright loose Australian opal.',
      price: 245,
      images: ['https://example.com/opal.jpg'],
      stock: 1,
      sku: 'OPAL-1',
    })

    expect(data).toMatchObject({
      '@type': 'Product',
      sku: 'OPAL-1',
      offers: {
        '@type': 'Offer',
        price: 245,
        priceCurrency: 'AUD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        shippingDetails: {
          shippingDestination: { addressCountry: 'AU' },
          shippingRate: { value: 15, currency: 'AUD' },
        },
      },
    })
  })

  test('publishes absolute product and course image URLs', () => {
    const product = productStructuredData({
      name: 'Relative-media opal',
      slug: 'relative-media-opal',
      description: 'An Australian opal.',
      price: 245,
      images: ['/api/media/file/relative-opal.jpg', 'https://cdn.example.com/opal.jpg'],
      stock: 1,
    })
    const course = courseStructuredData({
      name: 'Read Australian opal',
      slug: 'read-australian-opal',
      description: 'A practical public outline.',
      image: '/api/media/file/course-cover.jpg',
    })

    expect(product.image).toEqual([
      `${APP_URL}/api/media/file/relative-opal.jpg`,
      'https://cdn.example.com/opal.jpg',
    ])
    expect(course.image).toBe(`${APP_URL}/api/media/file/course-cover.jpg`)

    const collection = collectionStructuredData({
      name: 'Loose opals',
      description: 'Available Australian opals.',
      url: '/store',
      products: [
        {
          name: 'Collection opal',
          slug: 'collection-opal',
          price: 95,
          image: '/api/media/file/collection-opal.jpg',
        },
      ],
    })
    expect(collection).toMatchObject({
      mainEntity: {
        itemListElement: [
          { item: { image: `${APP_URL}/api/media/file/collection-opal.jpg` } },
        ],
      },
    })
  })

  test('describes course ownership, language, level, and instructor', () => {
    const data = courseStructuredData({
      name: 'Cut Australian opal',
      slug: 'cut-australian-opal',
      description: 'A practical public outline.',
      instructor: 'Stephanie Caruana',
      level: 'Beginner',
      format: 'Online course',
    })

    expect(data).toMatchObject({
      '@type': 'Course',
      inLanguage: 'en-AU',
      educationalLevel: 'Beginner',
      courseMode: 'Online course',
      provider: { '@type': 'Organization', name: 'The Good Opal Co' },
      instructor: { '@type': 'Person', name: 'Stephanie Caruana' },
    })
  })
})

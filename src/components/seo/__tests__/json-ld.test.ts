import { describe, expect, test } from 'vitest'
import {
  collectionStructuredData,
  courseStructuredData,
  organizationStructuredData,
  productStructuredData,
  serializeJsonLd,
} from '../json-ld'
import { APP_URL } from '@/lib/constants'
import { catalogProduct } from '@/lib/__tests__/catalog-fixture'

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
      '@type': 'OnlineStore',
      name: 'The Good Opal Co',
      founder: { '@type': 'Person', name: 'Stephanie Caruana' },
      address: { addressCountry: 'AU' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
    })
  })

  test('publishes free Australian delivery when one product meets the threshold', () => {
    const data = productStructuredData(catalogProduct({ price: 500 }))

    const details = (data['offers'] as { shippingDetails: { shippingRate: { value: number } }[] })
      .shippingDetails
    expect(details).toHaveLength(8)
    expect(details.every((detail) => detail.shippingRate.value === 0)).toBe(true)
  })

  test('describes a purchasable product with accurate AUD offer policies and stone facts', () => {
    const data = productStructuredData(
      catalogProduct({
        price: 245,
        sku: 'OPAL-1',
        stone: 'Black opal',
        metal: 'Sterling silver',
        weight: { value: 2.1, unit: 'ct' },
        ringSize: 'N',
      }),
      [{ name: 'Origin', value: 'Lightning Ridge, NSW' }]
    )

    expect(data).toMatchObject({
      '@type': 'Product',
      sku: 'OPAL-1',
      image: ['https://example.com/blue.jpg'],
      material: 'Sterling silver, Black opal',
      weight: { '@type': 'QuantitativeValue', value: 2.1, unitCode: 'CTM' },
      size: 'Ring size N',
      additionalProperty: [{ name: 'Origin', value: 'Lightning Ridge, NSW' }],
      offers: {
        '@type': 'Offer',
        price: 245,
        priceCurrency: 'AUD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        hasMerchantReturnPolicy: { merchantReturnDays: 30 },
        shippingDetails: expect.arrayContaining([
          expect.objectContaining({
            shippingDestination: [{ '@type': 'DefinedRegion', addressCountry: 'AU' }],
            shippingRate: { '@type': 'MonetaryAmount', value: 10.2, currency: 'AUD' },
          }),
          expect.objectContaining({
            shippingDestination: [{ '@type': 'DefinedRegion', addressCountry: 'GB' }],
            shippingRate: { '@type': 'MonetaryAmount', value: 28.4, currency: 'AUD' },
          }),
        ]),
      },
    })
  })

  test('keeps the offer of sold and reserved pieces but marks them unavailable', () => {
    const sold = productStructuredData(catalogProduct({ stock: 0, availability: 'sold' }))
    const reserved = productStructuredData(catalogProduct({ stock: 0, availability: 'reserved' }))

    expect(sold).toMatchObject({
      offers: { availability: 'https://schema.org/SoldOut', price: 123, priceCurrency: 'AUD' },
    })
    expect(reserved).toMatchObject({ offers: { availability: 'https://schema.org/Reserved' } })
  })

  test('does not offer change-of-mind returns on custom commissions', () => {
    const data = productStructuredData(catalogProduct({ category: 'custom-commissions' }))

    expect(data).toMatchObject({
      offers: {
        hasMerchantReturnPolicy: {
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        },
      },
    })
  })

  test('summarises the store listing with absolute URLs and the full match count', () => {
    const course = courseStructuredData({
      name: 'Read Australian opal',
      slug: 'read-australian-opal',
      description: 'A practical public outline.',
      image: '/api/media/file/course-cover.jpg',
    })
    expect(course.image).toBe(`${APP_URL}/api/media/file/course-cover.jpg`)

    const collection = collectionStructuredData({
      name: 'Loose opals',
      description: 'Available Australian opals.',
      url: '/store',
      total: 37,
      products: [
        {
          name: 'Collection opal',
          slug: 'collection-opal',
          image: '/api/media/file/collection-opal.jpg',
        },
      ],
    })
    expect(collection).toMatchObject({
      url: `${APP_URL}/store`,
      mainEntity: {
        numberOfItems: 37,
        itemListElement: [
          {
            position: 1,
            url: `${APP_URL}/store/collection-opal`,
            image: `${APP_URL}/api/media/file/collection-opal.jpg`,
          },
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

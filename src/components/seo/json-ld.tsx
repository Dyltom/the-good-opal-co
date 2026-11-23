import { APP_NAME, APP_URL, SHARE_IMAGE_URL } from '@/lib/constants'
import {
  calculateShipping,
  DELIVERY_BUSINESS_DAYS,
  RETURN_WINDOW_DAYS,
  SHIPPING_COUNTRIES,
} from '@/lib/constants/shipping'
import { SOCIAL_PROFILES } from '@/lib/constants/social'
import { absoluteUrl, type Availability, type CatalogProduct } from '@/lib/catalog'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

const organizationId = `${APP_URL}/#organization`
const websiteId = `${APP_URL}/#website`
const returnPolicyId = `${APP_URL}/returns#policy`
export const founderId = `${APP_URL}/about#stephanie-caruana`
const shippingCountries = [...SHIPPING_COUNTRIES.AUSTRALIA, ...SHIPPING_COUNTRIES.INTERNATIONAL]

export function merchantReturnPolicyStructuredData(): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': returnPolicyId,
    applicableCountry: shippingCountries,
    returnPolicyCountry: 'AU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    merchantReturnLink: `${APP_URL}/returns`,
  }
}

const customWorkReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: shippingCountries,
  returnPolicyCountry: 'AU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  merchantReturnLink: `${APP_URL}/returns`,
}

export function organizationStructuredData(contact?: { email: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': organizationId,
    name: APP_NAME,
    description: 'Australian opals, jewellery, custom ring design, and practical opal education.',
    url: APP_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${APP_URL}/#logo`,
      url: `${APP_URL}/logo.png`,
      contentUrl: `${APP_URL}/logo.png`,
      width: 600,
      height: 600,
      caption: APP_NAME,
    },
    image: SHARE_IMAGE_URL,
    founder: {
      '@type': 'Person',
      '@id': founderId,
      name: 'Stephanie Caruana',
      url: `${APP_URL}/about`,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Melbourne',
      addressRegion: 'VIC',
      addressCountry: 'AU',
    },
    currenciesAccepted: 'AUD',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${APP_URL}/contact`,
      email: contact?.email,
      areaServed: shippingCountries,
      availableLanguage: ['English'],
    },
    sameAs: SOCIAL_PROFILES.length > 0 ? SOCIAL_PROFILES.map((profile) => profile.url) : undefined,
    knowsAbout: [
      'Australian opal',
      'Opal jewellery',
      'Loose opals',
      'Custom opal rings',
      'Opal cutting',
    ],
    hasMerchantReturnPolicy: merchantReturnPolicyStructuredData(),
  }
}

export async function OrganizationJsonLd() {
  const { CONTACT_INFO } = await import('@/lib/constants/contact')
  return <JsonLd data={organizationStructuredData({ email: CONTACT_INFO.email })} />
}

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  in_stock: 'https://schema.org/InStock',
  reserved: 'https://schema.org/Reserved',
  sold: 'https://schema.org/SoldOut',
}

function shippingDetails(price: number, destination: keyof typeof SHIPPING_COUNTRIES) {
  return {
    '@type': 'OfferShippingDetails',
    shippingDestination: SHIPPING_COUNTRIES[destination].map((country) => ({
      '@type': 'DefinedRegion',
      addressCountry: country,
    })),
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: calculateShipping(price, destination),
      currency: 'AUD',
    },
    shippingLabel:
      destination === 'AUSTRALIA' ? 'Australia tracked shipping' : 'International tracked shipping',
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: businessDays(DELIVERY_BUSINESS_DAYS.DISPATCH),
      transitTime: businessDays(DELIVERY_BUSINESS_DAYS[destination]),
    },
  }
}

function businessDays({ min, max }: { min: number; max: number }) {
  return { '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitCode: 'DAY' }
}

interface ProductProperty {
  name: string
  value: string
}

export function productStructuredData(
  product: CatalogProduct,
  properties: ProductProperty[] = []
): Record<string, unknown> {
  const material = [product.metal, product.stone].filter((value): value is string => Boolean(value))

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${product.url}#product`,
    name: product.name,
    description: product.description || undefined,
    image: product.images,
    url: product.url,
    sku: product.sku,
    category: product.categoryLabel,
    material: material.length > 0 ? material.join(', ') : undefined,
    weight: product.weight
      ? {
          '@type': 'QuantitativeValue',
          value: product.weight.value,
          unitCode: product.weight.unit === 'ct' ? 'CTM' : 'GRM',
          unitText: product.weight.unit,
        }
      : undefined,
    size: product.ringSize ? `Ring size ${product.ringSize}` : undefined,
    additionalProperty: properties.length
      ? properties.map((property) => ({
          '@type': 'PropertyValue',
          name: property.name,
          value: property.value,
        }))
      : undefined,
    brand: {
      '@type': 'Brand',
      name: APP_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'AUD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: SCHEMA_AVAILABILITY[product.availability],
      seller: { '@type': 'OnlineStore', '@id': organizationId, name: APP_NAME },
      hasMerchantReturnPolicy:
        product.category === 'custom-commissions'
          ? customWorkReturnPolicy
          : merchantReturnPolicyStructuredData(),
      shippingDetails:
        product.category === 'custom-commissions'
          ? undefined
          : [
              shippingDetails(product.price, 'AUSTRALIA'),
              shippingDetails(product.price, 'INTERNATIONAL'),
            ],
    },
  }
}

export function ProductJsonLd({
  product,
  properties,
}: {
  product: CatalogProduct
  properties?: ProductProperty[]
}) {
  return <JsonLd data={productStructuredData(product, properties)} />
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      }}
    />
  )
}

interface CollectionJsonLdProps {
  name: string
  description: string
  url: string
  total: number
  products: Array<{
    name: string
    slug: string
    image?: string
  }>
}

export function collectionStructuredData({
  name,
  description,
  url,
  total,
  products,
}: CollectionJsonLdProps): Record<string, unknown> {
  const pageUrl = absoluteUrl(url)

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name,
    description,
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', '@id': websiteId },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${APP_URL}/store/${encodeURIComponent(product.slug)}`,
        name: product.name,
        image: absoluteUrl(product.image),
      })),
    },
  }
}

export function CollectionJsonLd(props: CollectionJsonLdProps) {
  return <JsonLd data={collectionStructuredData(props)} />
}

interface FaqItem {
  question: string
  answer: string
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  )
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteId,
        name: APP_NAME,
        url: APP_URL,
        publisher: { '@id': organizationId },
        inLanguage: 'en-AU',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${APP_URL}/store?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

interface CourseJsonLdProps {
  course: {
    name: string
    slug: string
    description: string
    provider?: string
    instructor?: string
    image?: string
    level?: string
    format?: string
  }
}

export function courseStructuredData(course: CourseJsonLdProps['course']): Record<string, unknown> {
  const courseUrl = `${APP_URL}/courses/${course.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${courseUrl}#course`,
    name: course.name,
    description: course.description,
    url: courseUrl,
    image: absoluteUrl(course.image),
    inLanguage: 'en-AU',
    educationalLevel: course.level,
    courseMode: course.format,
    provider: {
      '@type': 'Organization',
      '@id': organizationId,
      name: course.provider ?? APP_NAME,
      sameAs: APP_URL,
    },
    instructor: course.instructor
      ? {
          '@type': 'Person',
          ...(course.instructor === 'Stephanie Caruana' ? { '@id': founderId } : {}),
          name: course.instructor,
        }
      : undefined,
  }
}

export function CourseJsonLd({ course }: CourseJsonLdProps) {
  return <JsonLd data={courseStructuredData(course)} />
}

interface CourseListJsonLdProps {
  courses: Array<{ name: string; slug: string; description: string }>
}

export function CourseListJsonLd({ courses }: CourseListJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Australian opal courses',
        numberOfItems: courses.length,
        itemListElement: courses.map((course, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${APP_URL}/courses/${course.slug}`,
          item: courseStructuredData(course),
        })),
      }}
    />
  )
}

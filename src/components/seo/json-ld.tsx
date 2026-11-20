/**
 * JSON-LD Structured Data Component
 *
 * Provides SEO-friendly structured data for search engines.
 * Supports various schema.org types for products, organization, and breadcrumbs.
 */
import { APP_NAME, APP_URL } from '@/lib/constants'
import { calculateShipping, RETURN_WINDOW_DAYS, SHIPPING_COUNTRIES } from '@/lib/constants/shipping'
import { SOCIAL_PROFILES } from '@/lib/constants/social'
import { absoluteUrl } from '@/lib/catalog'

/**
 * Base JSON-LD component for rendering structured data
 */
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

export function merchantReturnPolicyStructuredData(): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': returnPolicyId,
    applicableCountry: [...SHIPPING_COUNTRIES.AUSTRALIA, ...SHIPPING_COUNTRIES.INTERNATIONAL],
    returnPolicyCountry: 'AU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    merchantReturnLink: `${APP_URL}/returns`,
  }
}

export function organizationStructuredData(contact?: { email: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
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
    image: `${APP_URL}/images/about-hero.jpg`,
    founder: {
      '@type': 'Person',
      '@id': `${APP_URL}/about#stephanie-caruana`,
      name: 'Stephanie Caruana',
      url: `${APP_URL}/about`,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${APP_URL}/contact`,
      email: contact?.email,
      areaServed: [...SHIPPING_COUNTRIES.AUSTRALIA, ...SHIPPING_COUNTRIES.INTERNATIONAL],
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

/**
 * Organization structured data for the business
 */
export async function OrganizationJsonLd() {
  const { CONTACT_INFO } = await import('@/lib/constants/contact')
  return <JsonLd data={organizationStructuredData({ email: CONTACT_INFO.email })} />
}

/**
 * Product structured data
 */
interface ProductJsonLdProps {
  product: {
    name: string
    slug: string
    description: string
    price: number
    images: string[]
    category?: string
    stock?: number
    sku?: string
    properties?: Array<{ name: string; value: string }>
  }
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
    shippingLabel: destination === 'AUSTRALIA' ? 'Australia tracked shipping' : 'International tracked shipping',
  }
}

export function productStructuredData(
  product: ProductJsonLdProps['product']
): Record<string, unknown> {
  const productUrl = `${APP_URL}/store/${product.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: product.images
      .map((image) => absoluteUrl(image))
      .filter((image): image is string => Boolean(image)),
    url: productUrl,
    sku: product.sku ?? product.slug,
    category: product.category ?? 'Gemstones',
    additionalProperty: product.properties?.length
      ? product.properties.map((property) => ({
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
      url: productUrl,
      priceCurrency: 'AUD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      seller: { '@type': 'Organization', '@id': organizationId, name: APP_NAME },
      hasMerchantReturnPolicy: merchantReturnPolicyStructuredData(),
      shippingDetails: [
        shippingDetails(product.price, 'AUSTRALIA'),
        shippingDetails(product.price, 'INTERNATIONAL'),
      ],
    },
  }
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  return <JsonLd data={productStructuredData(product)} />
}

/**
 * Breadcrumb structured data
 */
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const appUrl = APP_URL

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${appUrl}${item.url}`,
    })),
  }

  return <JsonLd data={data} />
}

/**
 * Collection/Category page structured data
 */
interface CollectionJsonLdProps {
  name: string
  description: string
  url: string
  products: Array<{
    name: string
    slug: string
    price: number
    image?: string
  }>
}

export function collectionStructuredData({
  name,
  description,
  url,
  products,
}: CollectionJsonLdProps): Record<string, unknown> {
  const appUrl = APP_URL

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${appUrl}${url}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${appUrl}/store/${product.slug}`,
          image: absoluteUrl(product.image),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'AUD',
            price: product.price,
          },
        },
      })),
    },
  }
}

export function CollectionJsonLd(props: CollectionJsonLdProps) {
  return <JsonLd data={collectionStructuredData(props)} />
}

/**
 * FAQ structured data
 */
interface FaqItem {
  question: string
  answer: string
}

interface FaqJsonLdProps {
  items: FaqItem[]
}

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  const data = {
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
  }

  return <JsonLd data={data} />
}

/**
 * Website structured data with search action
 */
export function WebsiteJsonLd() {
  const appUrl = APP_URL

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: APP_NAME,
    url: appUrl,
    publisher: { '@id': organizationId },
    inLanguage: 'en-AU',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appUrl}/store?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLd data={data} />
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

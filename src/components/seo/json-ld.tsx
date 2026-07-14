/**
 * JSON-LD Structured Data Component
 *
 * Provides SEO-friendly structured data for search engines.
 * Supports various schema.org types for products, organization, and breadcrumbs.
 */
import { APP_NAME, APP_URL } from '@/lib/constants'
import { SHIPPING_CONFIG } from '@/lib/constants/shipping'

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

function structuredDataUrl(value: string | undefined): string | undefined {
  if (!value) return undefined

  try {
    return new URL(value, `${APP_URL}/`).toString()
  } catch {
    return undefined
  }
}

export function merchantReturnPolicyStructuredData(): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': returnPolicyId,
    applicableCountry: ['AU', 'NZ', 'US', 'GB', 'CA', 'SG', 'HK', 'JP'],
    returnPolicyCountry: 'AU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 30,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    merchantReturnLink: `${APP_URL}/returns`,
  }
}

export function organizationStructuredData(): Record<string, unknown> {
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
      addressLocality: 'Sydney',
      addressRegion: 'NSW',
      addressCountry: 'AU',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${APP_URL}/contact`,
      availableLanguage: ['English'],
    },
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
export function OrganizationJsonLd() {
  return <JsonLd data={organizationStructuredData()} />
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
      .map((image) => structuredDataUrl(image))
      .filter((image): image is string => Boolean(image)),
    url: productUrl,
    sku: product.sku ?? product.slug,
    category: product.category ?? 'Gemstones',
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
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', '@id': organizationId, name: APP_NAME },
      hasMerchantReturnPolicy: merchantReturnPolicyStructuredData(),
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'AU',
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value:
            product.price >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
              ? 0
              : SHIPPING_CONFIG.RATES.AUSTRALIA.EXPRESS,
          currency: 'AUD',
        },
      },
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
          image: structuredDataUrl(product.image),
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
    image: structuredDataUrl(course.image),
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

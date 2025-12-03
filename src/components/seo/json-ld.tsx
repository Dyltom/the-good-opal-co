/**
 * JSON-LD Structured Data Component
 *
 * Provides SEO-friendly structured data for search engines.
 * Supports various schema.org types for products, organization, and breadcrumbs.
 */

/**
 * Base JSON-LD component for rendering structured data
 */
interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Organization structured data for the business
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Good Opal Co',
    description: 'Premium Australian opals, ethically sourced from Lightning Ridge, Coober Pedy, and Queensland.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co',
    logo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'}/logo.png`,
    sameAs: [
      'https://instagram.com/thegoodopalco',
      'https://facebook.com/thegoodopalco',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@thegoodopal.co',
      contactType: 'customer service',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    },
  }

  return <JsonLd data={data} />
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

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    url: `${appUrl}/store/${product.slug}`,
    sku: product.sku ?? product.slug,
    category: product.category ?? 'Gemstones',
    brand: {
      '@type': 'Brand',
      name: 'The Good Opal Co',
    },
    offers: {
      '@type': 'Offer',
      url: `${appUrl}/store/${product.slug}`,
      priceCurrency: 'AUD',
      price: product.price,
      availability: product.stock && product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'The Good Opal Co',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 500 ? 0 : 15,
          currency: 'AUD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['AU', 'NZ', 'US', 'GB', 'CA', 'SG', 'HK', 'JP'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
  }

  return <JsonLd data={data} />
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'

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

export function CollectionJsonLd({ name, description, url, products }: CollectionJsonLdProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'

  const data = {
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
          image: product.image,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'AUD',
            price: product.price,
          },
        },
      })),
    },
  }

  return <JsonLd data={data} />
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Good Opal Co',
    url: appUrl,
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

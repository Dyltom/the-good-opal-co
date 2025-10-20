/**
 * SEO and metadata utility functions
 * Helper functions for generating SEO-friendly metadata
 */

import type { Metadata } from 'next'
import type { SEO } from '@/types'
import { APP_NAME, APP_URL, DEFAULT_SEO } from './constants'

/**
 * Generate Next.js metadata object
 * @param seo - SEO configuration
 * @param path - Current path (optional)
 * @returns Next.js Metadata object
 */
export function generateMetadata(seo?: SEO, path?: string): Metadata {
  const {
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    canonicalUrl,
    noindex = false,
    nofollow = false,
  } = seo || {}

  const url = canonicalUrl || (path ? `${APP_URL}${path}` : APP_URL)

  return {
    title: title || DEFAULT_SEO.defaultTitle,
    description: description || DEFAULT_SEO.description,
    keywords: keywords?.join(', '),
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title || DEFAULT_SEO.defaultTitle,
      description: description || DEFAULT_SEO.description,
      url,
      siteName: APP_NAME,
      type: ogType as 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
    },
    twitter: {
      card: twitterCard,
      title: title || DEFAULT_SEO.defaultTitle,
      description: description || DEFAULT_SEO.description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

/**
 * Generate JSON-LD structured data for organization
 * @param name - Organization name
 * @param url - Organization URL
 * @param logo - Logo URL
 * @param social - Social media URLs
 * @returns JSON-LD string
 */
export function generateOrganizationSchema(
  name: string,
  url: string,
  logo?: string,
  social?: string[]
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logo
      ? {
          '@type': 'ImageObject',
          url: logo,
        }
      : undefined,
    sameAs: social,
  }

  return JSON.stringify(schema)
}

/**
 * Generate JSON-LD structured data for local business
 * @param config - Business configuration
 * @returns JSON-LD string
 */
export function generateLocalBusinessSchema(config: {
  name: string
  url: string
  telephone?: string
  email?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    url: config.url,
    telephone: config.telephone,
    email: config.email,
    address: config.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: config.address.street,
          addressLocality: config.address.city,
          addressRegion: config.address.state,
          postalCode: config.address.zip,
          addressCountry: config.address.country,
        }
      : undefined,
    geo: config.geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: config.geo.latitude,
          longitude: config.geo.longitude,
        }
      : undefined,
    openingHoursSpecification: config.openingHours?.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2],
    })),
    priceRange: config.priceRange,
  }

  return JSON.stringify(schema)
}

/**
 * Generate JSON-LD structured data for blog post
 * @param config - Blog post configuration
 * @returns JSON-LD string
 */
export function generateBlogPostSchema(config: {
  title: string
  description: string
  url: string
  image?: string
  datePublished: Date | string
  dateModified?: Date | string
  author: {
    name: string
    url?: string
  }
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: config.title,
    description: config.description,
    url: config.url,
    image: config.image,
    datePublished: new Date(config.datePublished).toISOString(),
    dateModified: config.dateModified
      ? new Date(config.dateModified).toISOString()
      : new Date(config.datePublished).toISOString(),
    author: {
      '@type': 'Person',
      name: config.author.name,
      url: config.author.url,
    },
  }

  return JSON.stringify(schema)
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 * @param items - Breadcrumb items
 * @returns JSON-LD string
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return JSON.stringify(schema)
}

/**
 * Generate meta tags for social sharing
 * @param config - Social sharing configuration
 * @returns Array of meta tag objects
 */
export function generateSocialMeta(config: {
  title: string
  description: string
  image?: string
  url: string
  type?: string
}): Array<{ property?: string; name?: string; content: string }> {
  const meta: Array<{ property?: string; name?: string; content: string }> = []

  // Open Graph
  meta.push(
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:url', content: config.url },
    { property: 'og:type', content: config.type || 'website' }
  )

  if (config.image) {
    meta.push({ property: 'og:image', content: config.image })
  }

  // Twitter
  meta.push(
    { name: 'twitter:card', content: config.image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description }
  )

  if (config.image) {
    meta.push({ name: 'twitter:image', content: config.image })
  }

  return meta
}

/**
 * Extract excerpt from HTML content
 * @param html - HTML content
 * @param maxLength - Maximum length (default: 160)
 * @returns Excerpt string
 */
export function extractExcerpt(html: string, maxLength: number = 160): string {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  const decoded = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Truncate
  if (decoded.length <= maxLength) {
    return decoded.trim()
  }

  return decoded.substring(0, maxLength).trim() + '...'
}

/**
 * Generate sitemap URL entry
 * @param config - URL configuration
 * @returns Sitemap URL object
 */
export function generateSitemapUrl(config: {
  loc: string
  lastmod?: Date | string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}): {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
} {
  return {
    loc: config.loc,
    lastmod: config.lastmod ? new Date(config.lastmod).toISOString() : undefined,
    changefreq: config.changefreq,
    priority: config.priority,
  }
}

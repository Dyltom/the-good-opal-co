/**
 * Dynamic Sitemap Generator
 *
 * Generates a sitemap.xml for search engines with all public pages.
 * Fetches products and blog posts from Payload CMS.
 */

import { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thegoodopal.co'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()

  // Fetch all published products
  const { docs: productDocs } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    limit: 1000,
    select: {
      slug: true,
      updatedAt: true,
    },
  })
  const products = productDocs as Array<{ slug: string; updatedAt: string }>

  // Fetch all published blog posts
  let posts: Array<{ slug: string; updatedAt: string }> = []
  try {
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      limit: 1000,
      select: {
        slug: true,
        updatedAt: true,
      },
    })
    posts = docs as Array<{ slug: string; updatedAt: string }>
  } catch {
    // Posts collection may not exist
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/store/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Blog post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...postPages]
}

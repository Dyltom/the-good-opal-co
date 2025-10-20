/**
 * Seed Data Utility
 *
 * Provides functions to seed demo data for testing and showcasing
 */

import type { Payload } from 'payload'

/**
 * Seed demo products
 */
export async function seedProducts(payload: Payload, tenantId: string) {
  const products = [
    {
      name: 'Premium Coffee Beans',
      slug: 'premium-coffee-beans',
      description: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Organic, fair-trade coffee beans sourced from the highlands of Colombia.',
                },
              ],
            },
          ],
        },
      },
      price: 24.99,
      compareAtPrice: 29.99,
      stock: 50,
      sku: 'COF-001',
      status: 'published',
      featured: true,
      tenantId,
    },
    {
      name: 'Artisan Tea Collection',
      slug: 'artisan-tea-collection',
      description: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'A curated selection of premium loose-leaf teas from around the world.',
                },
              ],
            },
          ],
        },
      },
      price: 34.99,
      stock: 30,
      sku: 'TEA-001',
      status: 'published',
      featured: true,
      tenantId,
    },
    {
      name: 'Handcrafted Mug',
      slug: 'handcrafted-mug',
      description: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Beautiful ceramic mug, handmade by local artisans.',
                },
              ],
            },
          ],
        },
      },
      price: 18.99,
      stock: 25,
      sku: 'MUG-001',
      status: 'published',
      tenantId,
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await payload.create({
      collection: 'products',
      data: product,
    })
    createdProducts.push(created)
  }

  return createdProducts
}

/**
 * Seed demo blog posts
 */
export async function seedBlogPosts(payload: Payload, tenantId: string) {
  const posts = [
    {
      title: 'Getting Started with Our Products',
      slug: 'getting-started',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Welcome to our blog! Learn how to make the most of our products.',
                },
              ],
            },
          ],
        },
      },
      status: 'published',
      publishedAt: new Date().toISOString(),
      tenantId,
    },
    {
      title: 'Behind the Scenes: Our Process',
      slug: 'behind-the-scenes',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Discover the craftsmanship and care that goes into everything we create.',
                },
              ],
            },
          ],
        },
      },
      status: 'published',
      publishedAt: new Date().toISOString(),
      tenantId,
    },
  ]

  const createdPosts = []
  for (const post of posts) {
    const created = await payload.create({
      collection: 'posts',
      data: post,
    })
    createdPosts.push(created)
  }

  return createdPosts
}

/**
 * Seed demo team members
 */
export async function seedTeamMembers(payload: Payload, tenantId: string) {
  const members = [
    {
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      role: 'Founder & CEO',
      bio: 'Passionate about creating exceptional products and experiences.',
      email: 'sarah@example.com',
      tenantId,
    },
    {
      name: 'Michael Chen',
      slug: 'michael-chen',
      role: 'Head of Product',
      bio: 'Dedicated to quality and innovation in every detail.',
      email: 'michael@example.com',
      tenantId,
    },
  ]

  const createdMembers = []
  for (const member of members) {
    const created = await payload.create({
      collection: 'team-members',
      data: member,
    })
    createdMembers.push(created)
  }

  return createdMembers
}

/**
 * Seed demo testimonials
 */
export async function seedTestimonials(payload: Payload, tenantId: string) {
  const testimonials = [
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      company: 'Local Cafe',
      content: 'The quality is outstanding and my customers love it!',
      rating: 5,
      tenantId,
    },
    {
      name: 'David Park',
      role: 'Restaurant Manager',
      company: 'Fine Dining Co',
      content: 'Exceptional service and products. Highly recommended!',
      rating: 5,
      tenantId,
    },
  ]

  const createdTestimonials = []
  for (const testimonial of testimonials) {
    const created = await payload.create({
      collection: 'testimonials',
      data: testimonial,
    })
    createdTestimonials.push(created)
  }

  return createdTestimonials
}

/**
 * Seed all demo data
 */
export async function seedAllDemoData(payload: Payload, tenantId: string) {
  console.log('🌱 Starting seed process...')

  const products = await seedProducts(payload, tenantId)
  console.log(`✅ Created ${products.length} demo products`)

  const posts = await seedBlogPosts(payload, tenantId)
  console.log(`✅ Created ${posts.length} demo blog posts`)

  const teamMembers = await seedTeamMembers(payload, tenantId)
  console.log(`✅ Created ${teamMembers.length} demo team members`)

  const testimonials = await seedTestimonials(payload, tenantId)
  console.log(`✅ Created ${testimonials.length} demo testimonials`)

  console.log('🎉 Seed complete!')

  return {
    products,
    posts,
    teamMembers,
    testimonials,
  }
}

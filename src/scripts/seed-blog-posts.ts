import { getPayload } from '@/lib/payload'

/**
 * Seed blog posts for The Good Opal Co
 * Run with: pnpm tsx src/scripts/seed-blog-posts.ts
 */

const blogPosts = [
  {
    title: 'Understanding Australian Opal Types: A Complete Guide',
    slug: 'understanding-australian-opal-types',
    excerpt: 'Discover the different types of Australian opals, from the prized Black Opal to the unique Boulder Opal, and learn what makes each one special.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Australian opals are among the most beautiful and valuable gemstones in the world. With over 95% of the world\'s opals coming from Australia, understanding the different types can help you appreciate these natural wonders even more.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Black Opal - The King of Opals',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Black opal is the most valuable and sought-after type of opal. Found primarily in Lightning Ridge, NSW, these opals have a dark body tone that makes their play of colour appear exceptionally vibrant. The dark background enhances the spectral colours, creating a mesmerizing display of reds, oranges, yellows, greens, blues, and violets.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'White Opal - Classic Beauty',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'White opal, also known as light opal, has a white or light body tone. Primarily found in Coober Pedy, South Australia, white opals display a delicate play of colour against their pale background. While generally less valuable than black opals, high-quality white opals with brilliant colour play can still command significant prices.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Boulder Opal - Nature\'s Canvas',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Boulder opal forms within ironstone boulders in Queensland. These unique opals often retain some of their host rock, creating stunning natural patterns. The combination of precious opal and ironstone creates pieces that are both beautiful and durable, perfect for jewellery.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Crystal Opal - Transparent Wonder',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Crystal opal is transparent to semi-transparent, allowing light to pass through the stone. This transparency can create an ethereal, three-dimensional appearance to the play of colour. Crystal opals can have either a dark or light body tone, with dark crystal opals being particularly valuable.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          }
        ]
      }
    },
    status: 'published',
    publishedAt: new Date('2024-01-15').toISOString(),
    categories: ['education', 'opal-types'],
    meta: {
      title: 'Understanding Australian Opal Types: Black, White, Boulder & Crystal',
      description: 'Complete guide to Australian opal types including Black Opal, White Opal, Boulder Opal, and Crystal Opal. Learn what makes each type unique.',
    }
  },
  {
    title: 'How to Care for Your Opal Jewellery: Expert Tips',
    slug: 'how-to-care-for-opal-jewellery',
    excerpt: 'Learn the best practices for caring for your precious opal jewellery to ensure it maintains its beauty for generations.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Opals are unique gemstones that require special care to maintain their stunning play of colour. With a hardness of 5.5-6.5 on the Mohs scale, opals are softer than many other gemstones, making proper care essential for preserving their beauty.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Daily Care Tips',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Remove your opal jewellery before swimming, exercising, or doing household chores. Chemicals in pools, sweat, and cleaning products can damage the opal\'s surface. Always put your opal jewellery on last when getting ready, after applying makeup, perfume, or hairspray.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Cleaning Your Opals',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Clean your opals with lukewarm water and mild soap using a soft cloth or brush. Never use ultrasonic cleaners, steam cleaners, or harsh chemicals. After cleaning, pat dry with a soft cloth. Avoid prolonged soaking, though brief contact with water is perfectly fine for solid opals.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Storage Guidelines',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Store each piece separately in a soft cloth pouch or lined jewellery box to prevent scratching. Keep opals away from harder gemstones like diamonds or sapphires. Room temperature with normal humidity is ideal - extreme dryness or heat can damage opals over time.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          }
        ]
      }
    },
    status: 'published',
    publishedAt: new Date('2024-02-01').toISOString(),
    categories: ['care-guide', 'education'],
    meta: {
      title: 'Opal Care Guide: How to Clean and Maintain Your Opal Jewellery',
      description: 'Expert tips on caring for opal jewellery. Learn proper cleaning methods, storage guidelines, and daily care practices to preserve your opals.',
    }
  },
  {
    title: 'The History of Australian Opal Mining',
    slug: 'history-australian-opal-mining',
    excerpt: 'Journey through the fascinating history of opal mining in Australia, from the first discoveries to modern sustainable practices.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The story of Australian opal mining is one of adventure, hardship, and incredible discoveries. From accidental finds in the late 1800s to becoming the world\'s primary source of precious opal, Australia\'s opal mining history is as colorful as the stones themselves.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The First Discoveries',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Australian opal was first discovered in 1849, but commercial mining didn\'t begin until the 1890s. The first significant find was at White Cliffs in New South Wales in 1890, followed by the discovery of opal at Lightning Ridge in 1901, which would become famous for its black opal.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The Opal Rush Era',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The early 1900s saw opal rushes similar to gold rushes, with thousands of miners flocking to newly discovered fields. Coober Pedy was discovered in 1915, and its harsh desert conditions led to the development of underground homes, a practice that continues today.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          }
        ]
      }
    },
    status: 'published',
    publishedAt: new Date('2024-02-15').toISOString(),
    categories: ['history', 'mining'],
    meta: {
      title: 'The History of Australian Opal Mining: From 1849 to Today',
      description: 'Explore the rich history of Australian opal mining, from first discoveries to modern practices. Learn about Lightning Ridge, Coober Pedy, and more.',
    }
  },
  {
    title: 'Opal Buying Guide: What to Look For',
    slug: 'opal-buying-guide',
    excerpt: 'Essential tips for buying opals, including how to assess quality, understand pricing, and avoid common mistakes.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Buying an opal can be both exciting and overwhelming. With so many factors affecting value and quality, it\'s important to understand what to look for. This guide will help you make an informed decision when purchasing your next opal.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Body Tone',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Body tone refers to the background colour of the opal, ranging from black to white. Generally, darker body tones command higher prices as they make the play of colour appear more vibrant. Black opals are the most valuable, followed by dark opals, then light opals.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Brightness',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Brightness is perhaps the most important factor in determining an opal\'s value. It ranges from brilliant (the brightest) to dull. A brilliant opal will show vibrant colours even in low light, while a dull opal may only show colour in direct sunlight.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Pattern',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The pattern of colour play significantly affects value. Harlequin (large, angular blocks of colour) is the most valuable, followed by flagstone, floral, and pinfire patterns. The more rare and striking the pattern, the higher the value.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          }
        ]
      }
    },
    status: 'published',
    publishedAt: new Date('2024-03-01').toISOString(),
    categories: ['buying-guide', 'education'],
    meta: {
      title: 'Opal Buying Guide: Body Tone, Brightness, Pattern & Value',
      description: 'Complete guide to buying opals. Learn how to assess opal quality, understand pricing factors, and make informed purchases.',
    }
  },
  {
    title: 'Famous Australian Opals: Legendary Discoveries',
    slug: 'famous-australian-opals',
    excerpt: 'Discover the stories behind Australia\'s most famous opals, from the Olympic Australis to the Fire Queen Opal.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Throughout Australia\'s opal mining history, several stones have achieved legendary status due to their size, quality, or the stories surrounding their discovery. These famous opals have captivated collectors and gem enthusiasts worldwide.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The Olympic Australis',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Discovered in Coober Pedy in 1956, the Olympic Australis is the largest and most valuable opal ever found. Weighing 17,000 carats (3.4 kg) and measuring 280mm x 120mm x 115mm, this magnificent stone is valued at over $2.5 million AUD.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          },
          {
            type: 'heading',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'The Aurora Australis',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ],
            tag: 'h2'
          },
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: 'Found at Lightning Ridge in 1938, the Aurora Australis is considered the world\'s most valuable black opal. With a distinctive harlequin pattern and brilliant play of colour, this 180-carat gem showcases the full spectrum of colours in a mesmerizing display.',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1
              }
            ]
          }
        ]
      }
    },
    status: 'published',
    publishedAt: new Date('2024-03-15').toISOString(),
    categories: ['history', 'famous-opals'],
    meta: {
      title: 'Famous Australian Opals: Olympic Australis, Aurora Australis & More',
      description: 'Learn about Australia\'s most famous opals including the Olympic Australis and Aurora Australis. Discover legendary opal discoveries.',
    }
  }
]

async function seedBlogPosts() {
  try {
    console.log('🌱 Starting blog post seeding...')
    const payload = await getPayload()

    // Check if we already have blog posts
    const existingPosts = await payload.find({
      collection: 'posts',
      limit: 1
    })

    if (existingPosts.docs.length > 0) {
      console.log('⚠️  Blog posts already exist. Skipping seed.')
      return
    }

    // Create categories first
    const categories = ['education', 'opal-types', 'care-guide', 'history', 'mining', 'buying-guide', 'famous-opals']
    const categoryMap: Record<string, string> = {}

    for (const categoryName of categories) {
      try {
        const category = await payload.create({
          collection: 'categories',
          data: {
            name: categoryName.split('-').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            slug: categoryName
          }
        })
        categoryMap[categoryName] = String(category.id)
      } catch (error) {
        // Category might already exist
        const existing = await payload.find({
          collection: 'categories',
          where: { slug: { equals: categoryName } },
          limit: 1
        })
        if (existing.docs[0]) {
          categoryMap[categoryName] = String(existing.docs[0].id)
        }
      }
    }

    // Create blog posts
    for (const post of blogPosts) {
      const categoryIds = post.categories.map(cat => categoryMap[cat]).filter(Boolean)

      await payload.create({
        collection: 'posts',
        data: {
          ...post,
          categories: categoryIds,
          author: 'Stephanie Caruana',
          featuredImage: undefined, // Add image IDs if you have them
          relatedProducts: [], // Add product IDs if you want to link products
          _status: 'published' // Ensure posts are published when drafts are enabled
        }
      })

      console.log(`✅ Created post: ${post.title}`)
    }

    console.log('🎉 Blog posts seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error)
  }
}

// Run the seeder
seedBlogPosts()
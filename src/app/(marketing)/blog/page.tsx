import Link from 'next/link'
import { Container, Grid, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { BlogCard } from '@/components/blog/BlogCard'
import { Pagination } from '@/components/ui/pagination'
import { getPayload } from '@/lib/payload'
import type { BlogPost, Category } from '@/types'

const POSTS_PER_PAGE = 9

/**
 * Blog Listing Page
 * Fetches posts from Payload CMS and displays them with pagination
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const categorySlug = params.category

  // Fetch posts from Payload CMS
  const payload = await getPayload()

  const { docs: posts, totalPages } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      ...(categorySlug && {
        'categories.slug': { equals: categorySlug },
      }),
    },
    limit: POSTS_PER_PAGE,
    page: currentPage,
    sort: '-publishedAt',
    depth: 2, // Include related media and categories
  })

  // Transform posts to match BlogPost type
  const transformedPosts: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'featuredImage' | 'publishedAt' | 'categories'>[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: typeof post.excerpt === 'string' ? post.excerpt : undefined,
    featuredImage: post.featuredImage && typeof post.featuredImage === 'object' ? {
      id: String(post.featuredImage.id),
      url: post.featuredImage.url ?? '',
      alt: post.featuredImage.alt ?? post.title,
      width: post.featuredImage.width ?? 800,
      height: post.featuredImage.height ?? 600,
    } : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    categories: Array.isArray(post.categories)
      ? post.categories.map((cat): Category => {
          if (typeof cat === 'object' && cat !== null) {
            return {
              id: String(cat.id),
              tenantId: 'default',
              name: cat.name ?? '',
              slug: cat.slug ?? '',
            }
          }
          return { id: String(cat), tenantId: 'default', name: '', slug: '' }
        })
      : undefined,
  }))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation
        logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
        transparent
      />

      <main className="flex-1">
        {/* Header - Premium opal-inspired design */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-black-rich via-gray-900 to-black-rich overflow-hidden pt-32">
          {/* Enhanced background effects */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-opal-electric to-opal-deep" />
            <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl bg-gradient-to-tr from-fire-pink to-fire-orange" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full opacity-10 blur-3xl bg-gradient-to-r from-opal-turquoise to-opal-emerald" />
          </div>

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`
            }} />
          </div>

          <Container>
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <span className="mb-6 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-opal-electric via-fire-gold to-fire-pink">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-opal-electric"></span>
                Insights & Stories
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-fire-pink"></span>
              </span>
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-white leading-tight">
                The Opal <span className="text-gradient-prismatic">Journal</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                Discover the magic of Australian opals through our stories, expert guides,
                and behind-the-scenes glimpses into the world of precious gemstones.
              </p>

              {/* Quick stats */}
              <div className="flex justify-center gap-8 mt-12">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{posts.length}</p>
                  <p className="text-sm text-white/60 mt-1">Articles</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Expert</p>
                  <p className="text-sm text-white/60 mt-1">Insights</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Weekly</p>
                  <p className="text-sm text-white/60 mt-1">Updates</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Posts Grid */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <Container>
            {transformedPosts.length > 0 ? (
              <>
                <Grid cols={3} gap="lg">
                  {transformedPosts.map((post) => (
                    <BlogCard
                      key={post.slug}
                      post={post}
                    />
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={categorySlug ? `/blog?category=${categorySlug}` : '/blog'}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">Stories Coming Soon</h2>
                <p className="text-charcoal/60 max-w-md mx-auto mb-6">
                  We&apos;re crafting fascinating content about Australian opals. Check back soon!
                </p>
                <Link
                  href="/admin/collections/posts"
                  className="text-sm text-opal-electric-accessible hover:underline"
                >
                  Admin: Add blog posts →
                </Link>
              </div>
            )}
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}

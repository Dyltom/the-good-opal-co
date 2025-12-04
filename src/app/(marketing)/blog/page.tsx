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
        {/* Header - Dark opal-inspired */}
        <section className="relative py-20 md:py-28 bg-black-rich overflow-hidden pt-28">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-electric" />
            <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-pink" />
          </div>
          <Container>
            <div className="relative z-10 text-center">
              <span className="text-opal-light text-sm font-semibold uppercase tracking-wider mb-4 block">
                Insights & Stories
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                The Opal <span className="text-gradient-prismatic">Journal</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Discover the magic of Australian opals through our stories, guides, and behind-the-scenes glimpses.
              </p>
            </div>
          </Container>
        </section>

        {/* Posts Grid */}
        <Section padding="lg">
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
        </Section>
      </main>

      <Footer />
    </div>
  )
}

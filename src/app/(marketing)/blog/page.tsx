import { Container, Grid, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { BlogCard } from '@/components/blog/BlogCard'
import { Pagination } from '@/components/ui/pagination'
import type { BlogPost } from '@/types'

/**
 * Blog Listing Page
 * Displays all blog posts with pagination and filtering
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const category = params.category

  // TODO: Fetch from Payload CMS
  // For now, using mock data
  const mockPosts: BlogPost[] = []
  const totalPages = 1

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
            {mockPosts.length > 0 ? (
              <>
                <Grid cols={3} gap="lg">
                  {mockPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={category ? `/blog?category=${category}` : '/blog'}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">Coming Soon</h2>
                <p className="text-charcoal-60 max-w-md mx-auto">
                  We&apos;re working on some exciting content about Australian opals. Check back soon!
                </p>
              </div>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  )
}

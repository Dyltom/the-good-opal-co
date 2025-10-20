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
    <div className="min-h-screen flex flex-col">
      <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }]} />

      <main className="flex-1">
        {/* Header */}
        <Section padding="md" background="muted">
          <Container>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Blog</h1>
              <p className="text-lg text-muted-foreground">
                Latest updates, tutorials, and insights
              </p>
            </div>
          </Container>
        </Section>

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
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your database and create posts in the admin panel.
                </p>
              </div>
            )}
          </Container>
        </Section>
      </main>

      <Footer logoText="Rapid Sites" />
    </div>
  )
}

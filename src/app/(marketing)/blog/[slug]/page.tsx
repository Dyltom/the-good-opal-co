import { notFound } from 'next/navigation'
import { Navigation, Footer } from '@/components/navigation'

/**
 * Blog Post Detail Page
 * Displays individual blog post with full content
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: _slug } = await params

  // TODO: Fetch from Payload CMS based on slug
  // For now, always return not found until database is connected
  // Once DB is connected, use: const post = await getPayload().find({ collection: 'posts', where: { slug: { equals: _slug } } })
  notFound()

  // This code won't execute - just for type safety
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        logoText="The Good Opal Co"
        items={[
          { href: '/', label: 'Home' },
          { href: '/blog', label: 'Blog' },
        ]}
      />
      <main className="flex-1">
        {/* Content will be added when database is connected */}
      </main>
      <Footer logoText="The Good Opal Co" />
    </div>
  )
}

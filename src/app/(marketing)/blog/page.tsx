import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogCard } from '@/components/blog/BlogCard'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'

export const metadata = {
  title: 'Opal notes | The Good Opal Co',
  description: 'Practical notes about Australian opals, jewellery, buying, and care.',
  alternates: { canonical: '/blog' },
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const payload = await getPayload()
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    limit: 24,
    sort: '-publishedAt',
    depth: 2,
    overrideAccess: false,
  })

  const cards = posts.map((post) => {
    const image =
      post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null
    const author = post.author && typeof post.author === 'object' ? post.author : null
    const category = post.categories?.find((value) => typeof value === 'object')
    const imageUrl = resolveMediaUrl(image?.url)
    return {
      slug: post.slug,
      title: post.title,
      excerpt: typeof post.excerpt === 'string' ? post.excerpt : undefined,
      featuredImage: imageUrl ? { url: imageUrl, alt: image?.alt || post.title } : undefined,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
      author: author?.name,
      category: category && typeof category === 'object' ? category.name : undefined,
    }
  })

  return (
    <MarketingShell>
      <Container className="py-14 sm:py-20 lg:py-24">
        <PageHeader
          eyebrow="Field notes"
          title="Learn about opal before you choose."
          description="Straightforward guides on stone types, buying questions, jewellery care, and the details worth checking in a listing."
        />

        {cards.length > 0 ? (
          <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="mt-16 border-y border-warm-grey/70 py-14">
            <h2 className="font-serif text-3xl font-medium text-charcoal">
              No articles published yet.
            </h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-charcoal/65">
              The store and product notes remain available while the first guides are prepared.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
            >
              Browse available pieces <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </Container>
    </MarketingShell>
  )
}

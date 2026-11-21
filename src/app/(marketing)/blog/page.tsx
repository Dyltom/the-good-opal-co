import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogCard } from '@/components/blog/BlogCard'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { APP_URL } from '@/lib/constants'
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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${APP_URL}/blog#collection`,
          name: 'Opal notes',
          description: 'Practical notes about Australian opals, jewellery, buying, and care.',
          url: `${APP_URL}/blog`,
          isPartOf: { '@type': 'WebSite', '@id': `${APP_URL}/#website` },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: cards.length,
            itemListElement: cards.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${APP_URL}/blog/${post.slug}`,
              name: post.title,
            })),
          },
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Opal notes', url: '/blog' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title="Learn about opal before you choose."
          description="Straightforward guides on stone types, buying questions, jewellery care, and the details worth checking in a listing."
        />

        {cards.length > 0 ? (
          <div className="mt-8 grid gap-x-[clamp(20px,2.4vw,40px)] gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border-t border-rule pt-6">
            <h2>No articles published yet.</h2>
            <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
              The store and product notes remain available while the first guides are prepared.
            </p>
            <Button asChild variant="ghost" className="mt-5">
              <Link href="/store">
                Browse available pieces <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}
      </Container>
    </MarketingShell>
  )
}

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogCard, toBlogCardPost } from '@/components/blog/BlogCard'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { cn } from '@/lib/utils'

const DESCRIPTION =
  'Notes on Australian opal: the fields it comes from, how it is cut and set, and what to check before you buy.'

export const metadata = {
  title: 'Journal | The Good Opal Co',
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
}

export const dynamic = 'force-dynamic'

interface BlogPageProps {
  searchParams: Promise<{ category?: string | string[] }>
}

const topicLink =
  'inline-flex h-11 flex-none items-center whitespace-nowrap rounded-full border px-3 text-[13px] transition-colors md:h-[34px]'

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: categoryParam } = await searchParams
  const payload = await getPayload()
  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 100,
    sort: '-publishedAt',
    depth: 2,
    overrideAccess: false,
  })

  const topics = [
    ...new Map(
      posts
        .flatMap((post) => post.categories ?? [])
        .filter((category) => typeof category === 'object')
        .map((category) => [category.slug, category] as const)
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name))
  const activeTopic = topics.find((topic) => topic.slug === categoryParam)
  const shown = activeTopic
    ? posts.filter((post) =>
        post.categories?.some(
          (category) => typeof category === 'object' && category.id === activeTopic.id
        )
      )
    : posts
  const [lead, ...cards] = shown.map(toBlogCardPost)

  return (
    <MarketingShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${APP_URL}/blog#collection`,
          name: 'Journal',
          description: DESCRIPTION,
          url: `${APP_URL}/blog`,
          isPartOf: { '@type': 'WebSite', '@id': `${APP_URL}/#website` },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: shown.length,
            itemListElement: shown.map((post, index) => ({
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
          { name: 'Journal', url: '/blog' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
          <PageHeader title="Journal" description={DESCRIPTION} />

          {topics.length > 1 ? (
            <nav
              aria-label="Journal topics"
              className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:max-w-[40rem] lg:flex-wrap lg:justify-end lg:overflow-visible"
            >
              {[{ slug: undefined, name: 'All' }, ...topics].map((topic) => {
                const active = topic.slug === activeTopic?.slug
                return (
                  <Link
                    key={topic.slug ?? 'all'}
                    href={topic.slug ? `/blog?category=${encodeURIComponent(topic.slug)}` : '/blog'}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      topicLink,
                      active
                        ? 'border-ink text-ink'
                        : 'border-rule-2 text-ink-2 hover:border-ink-2 hover:text-ink'
                    )}
                  >
                    {topic.name}
                  </Link>
                )
              })}
            </nav>
          ) : null}
        </div>

        {lead ? (
          <>
            <div className="mt-8 border-b border-rule pb-10 md:mt-10 md:pb-12">
              <BlogCard post={lead} lead />
            </div>
            {cards.length > 0 ? (
              <div className="mt-10 grid gap-x-[clamp(20px,2.4vw,40px)] gap-y-10 md:mt-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : null}
          </>
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

import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Author, Category, Media, Post, Tag } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const getPublishedPost = cache(async (slug: string): Promise<Post | undefined> => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })

  return docs[0]
})

function populatedMedia(media: number | null | Media | undefined): Media | null {
  return media && typeof media === 'object' ? media : null
}

function populatedAuthor(author: number | Author | null | undefined): Author | null {
  return author && typeof author === 'object' ? author : null
}

function populatedCategories(categories: (number | Category)[] | null | undefined): Category[] {
  return categories?.filter((category): category is Category => typeof category === 'object') ?? []
}

function populatedTags(tags: (number | Tag)[] | null | undefined): Tag[] {
  return tags?.filter((tag): tag is Tag => typeof tag === 'object') ?? []
}

function withBrand(title: string): string {
  return title.toLocaleLowerCase('en-AU').includes(APP_NAME.toLocaleLowerCase('en-AU'))
    ? title
    : `${title} | ${APP_NAME}`
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) {
    return {
      title: `Article not found | ${APP_NAME}`,
      robots: { index: false, follow: false },
    }
  }

  const title = withBrand(post.seo?.title?.trim() || post.title)
  const description =
    post.seo?.description?.trim() ||
    post.excerpt?.trim() ||
    'Practical guidance about Australian opals, jewellery, buying, and care.'
  const canonical = new URL(`/blog/${encodeURIComponent(post.slug)}`, APP_URL).toString()
  const socialImage = populatedMedia(post.seo?.ogImage) || populatedMedia(post.featuredImage)
  const imageUrl = resolveMediaUrl(socialImage?.url) || `${APP_URL}/images/about-hero.jpg`
  const author = populatedAuthor(post.author)

  return {
    title,
    description,
    keywords: post.seo?.keywords ?? undefined,
    authors: author ? [{ name: author.name }] : undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: APP_NAME,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: author ? [author.name] : undefined,
      images: [{ url: imageUrl, alt: socialImage?.alt || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) notFound()

  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(post.publishedAt)
      )
    : null
  const featuredImage = populatedMedia(post.featuredImage)
  const imageUrl = resolveMediaUrl(featuredImage?.url)
  const structuredImageUrl = imageUrl ? new URL(imageUrl, APP_URL).toString() : undefined
  const author = populatedAuthor(post.author)
  const categories = populatedCategories(post.categories)
  const tags = populatedTags(post.tags)
  const canonical = new URL(`/blog/${encodeURIComponent(post.slug)}`, APP_URL).toString()
  const description =
    post.seo?.description?.trim() ||
    post.excerpt?.trim() ||
    'Practical guidance about Australian opals, jewellery, buying, and care.'
  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: post.title,
    description,
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    image: structuredImageUrl
      ? {
          '@type': 'ImageObject',
          url: structuredImageUrl,
          caption: featuredImage?.alt || post.title,
        }
      : undefined,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          ...(author.name === 'Stephanie Caruana' ? { url: `${APP_URL}/about` } : {}),
        }
      : { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: APP_NAME },
    publisher: { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: APP_NAME },
    isPartOf: { '@type': 'WebSite', '@id': `${APP_URL}/#website` },
    inLanguage: 'en-AU',
    articleSection: categories[0]?.name,
    keywords: tags.map((tag) => tag.name),
  }

  return (
    <MarketingShell>
      <JsonLd data={blogPosting} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Opal notes', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <Container className="py-14 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to opal notes
        </Link>
        <article className="mx-auto mt-12 max-w-4xl">
          {categories.length > 0 ? (
            <p className="font-sans text-sm font-semibold text-opal-electric-accessible">
              {categories.map((category) => category.name).join(' · ')}
            </p>
          ) : null}
          <h1 className="mt-4 text-balance font-serif text-5xl font-medium leading-none text-charcoal sm:text-6xl">
            {post.title}
          </h1>
          {author || publishedDate ? (
            <p className="mt-6 font-sans text-sm text-charcoal/60">
              {author ? `By ${author.name}` : null}
              {author && publishedDate ? ' · ' : null}
              {publishedDate ? <time>{publishedDate}</time> : null}
            </p>
          ) : null}
          {post.excerpt ? (
            <p className="mt-7 max-w-3xl font-sans text-lg leading-8 text-charcoal/70">
              {post.excerpt}
            </p>
          ) : null}
          {imageUrl ? (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-warm-grey/20">
              <Image
                src={imageUrl}
                alt={featuredImage?.alt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ) : null}
          {post.content ? (
            <div className="prose prose-lg mt-12 max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:text-charcoal prose-p:font-sans prose-p:leading-8 prose-p:text-charcoal/75 prose-a:text-opal-electric-accessible prose-blockquote:border-charcoal/30 prose-blockquote:text-charcoal/70">
              <RichText data={post.content as unknown as SerializedEditorState} />
            </div>
          ) : null}
          {tags.length > 0 ? (
            <div className="mt-12 border-t border-warm-grey/70 pt-6" aria-label="Article topics">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                Topics
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-warm-grey bg-cream px-3 py-1.5 font-sans text-xs text-charcoal/70"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </Container>
    </MarketingShell>
  )
}

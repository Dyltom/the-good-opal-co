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
import { rewriteLegacyPostLinks } from '@/lib/rich-text'
import { BreadcrumbJsonLd, founderId, JsonLd } from '@/components/seo'

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

const HERO_WIDTH = 896

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
          ...(author.name === 'Stephanie Caruana' ? { '@id': founderId, url: `${APP_URL}/about` } : {}),
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
      <Container className="pb-sec">
        <Link
          href="/blog"
          className="mt-[18px] inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink md:mt-5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to opal notes
        </Link>
        <article className="mx-auto mt-4 max-w-4xl">
          <header className="max-w-[65ch]">
            <h1 className="text-[2.375rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4.2vw,3.75rem)]">
              {post.title}
            </h1>
            {categories.length > 0 || author || publishedDate ? (
              <p className="mt-4 text-[13px] text-ink-3">
                {[
                  categories.map((category) => category.name).join(' \u00b7 '),
                  author ? `By ${author.name}` : '',
                ]
                  .filter(Boolean)
                  .join(' \u00b7 ')}
                {(categories.length > 0 || author) && publishedDate ? ' \u00b7 ' : null}
                {publishedDate ? (
                  <time dateTime={post.publishedAt ?? undefined}>{publishedDate}</time>
                ) : null}
              </p>
            ) : null}
          </header>
          {imageUrl &&
          featuredImage?.width &&
          featuredImage.height &&
          featuredImage.width < HERO_WIDTH ? (
            <Image
              src={imageUrl}
              alt={featuredImage.alt || post.title}
              width={featuredImage.width}
              height={featuredImage.height}
              priority
              sizes={`${featuredImage.width}px`}
              className="mt-8 h-auto max-w-full"
            />
          ) : imageUrl ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-plinth">
              <Image
                src={imageUrl}
                alt={featuredImage?.alt || post.title}
                fill
                priority
                sizes={`(max-width: 1024px) 100vw, ${HERO_WIDTH}px`}
                className="object-cover"
              />
            </div>
          ) : null}
          {post.content ? (
            <div className="prose mt-8 max-w-[65ch] break-words text-base prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-[-0.01em] prose-headings:text-ink prose-p:leading-[1.75] prose-p:text-ink prose-a:text-accent prose-a:underline-offset-4 prose-blockquote:border-rule-2 prose-blockquote:font-serif prose-blockquote:font-normal prose-blockquote:text-ink-2 prose-strong:font-medium prose-strong:text-ink prose-li:text-ink">
              <RichText
                data={rewriteLegacyPostLinks(
                  post.content as unknown as SerializedEditorState,
                  APP_URL
                )}
              />
            </div>
          ) : null}
          {tags.length > 0 ? (
            <div
              className="mt-10 max-w-[65ch] border-t border-rule pt-5"
              aria-label="Article topics"
            >
              <p className="text-[13px] text-ink-3">Topics</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="rounded-sm border border-rule px-2.5 py-1 text-xs text-ink-2"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </Container>
    </MarketingShell>
  )
}

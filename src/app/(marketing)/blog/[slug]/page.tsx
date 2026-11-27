import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache, Fragment, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Author, Category, Media, Post, Tag } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { APP_NAME, APP_URL, SHARE_IMAGE_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { extractPlainText, postSummary, rewriteLegacyPostLinks } from '@/lib/rich-text'
import { slugify } from '@/lib/utils'
import { FromTheShop, ShopPicksList, shopPicks } from '@/components/blog/FromTheShop'
import { RelatedReading } from '@/components/blog/RelatedReading'
import { BreadcrumbJsonLd, founderId, JsonLd } from '@/components/seo'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const getPublishedPost = cache(async (slug: string): Promise<Post | undefined> => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })

  return docs[0]
})

interface ContentNode {
  type?: string
  tag?: string
  children?: unknown[]
}

function sectionHeadings(content: unknown): { id: string; text: string }[] {
  const root = (content as { root?: ContentNode } | null)?.root
  return (root?.children ?? [])
    .filter((node): node is ContentNode => {
      const block = node as ContentNode
      return block?.type === 'heading' && block.tag === 'h2'
    })
    .map((node) => {
      const text = extractPlainText(node)
      return { id: slugify(text), text }
    })
    .filter((heading) => heading.id)
}

function faqEntries(content: unknown): { question: string; answer: string }[] {
  const nodes = ((content as { root?: ContentNode } | null)?.root?.children ?? []) as ContentNode[]
  const start = nodes.findIndex(
    (node) =>
      node.type === 'heading' &&
      node.tag === 'h2' &&
      /^questions people ask/i.test(extractPlainText(node))
  )
  if (start === -1) return []
  const entries: { question: string; answer: string }[] = []
  for (const node of nodes.slice(start + 1)) {
    if (node.type === 'heading' && node.tag === 'h2') break
    if (node.type === 'heading' && node.tag === 'h3') {
      entries.push({ question: extractPlainText(node), answer: '' })
    } else {
      const last = entries.at(-1)
      if (last) last.answer = [last.answer, extractPlainText(node)].filter(Boolean).join(' ')
    }
  }
  return entries.filter((entry) => entry.question && entry.answer)
}

const postConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag
    const children = nodesToJSX({ nodes: node.children })
    return Tag === 'h2' ? (
      <h2 id={slugify(extractPlainText(node)) || undefined}>{children}</h2>
    ) : (
      <Tag>{children}</Tag>
    )
  },
  upload: (args) => {
    const media = args.node.value as Media | number
    const src = typeof media === 'object' ? resolveMediaUrl(media.url) : undefined
    if (
      typeof media !== 'object' ||
      !src ||
      !media.width ||
      !media.height ||
      !media.mimeType?.startsWith('image/')
    ) {
      return typeof defaultConverters.upload === 'function' ? defaultConverters.upload(args) : null
    }
    const fields = args.node.fields as { alt?: string } | undefined
    return (
      <Image
        src={src}
        alt={fields?.alt || media.alt || ''}
        width={media.width}
        height={media.height}
        sizes="(max-width: 760px) 100vw, 704px"
        className="mx-auto h-auto max-h-[min(36rem,80vh)] w-auto"
      />
    )
  },
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
  const branded = `${title} | ${APP_NAME}`
  return title.toLocaleLowerCase('en-AU').includes(APP_NAME.toLocaleLowerCase('en-AU')) || branded.length > 65
    ? title
    : branded
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
    postSummary(post.excerpt, post.content, 160) ||
    'Practical guidance about Australian opals, jewellery, buying, and care.'
  const canonical = new URL(`/blog/${encodeURIComponent(post.slug)}`, APP_URL).toString()
  const socialImage = populatedMedia(post.seo?.ogImage) || populatedMedia(post.featuredImage)
  const imageUrl = resolveMediaUrl(socialImage?.url) || SHARE_IMAGE_URL
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
    postSummary(post.excerpt, post.content, 160) ||
    'Practical guidance about Australian opals, jewellery, buying, and care.'
  const excerpt = post.excerpt?.trim()
  const standfirst = excerpt && !/(…|\.\.\.|\[\s*…\s*\])$/.test(excerpt) ? excerpt : undefined
  const headings = sectionHeadings(post.content)
  const picks = await shopPicks(post)
  const faqs = faqEntries(post.content)
  const metaParts: ReactNode[] = [
    ...categories.map((category) => (
      <Link
        key={category.id}
        href={`/blog?category=${encodeURIComponent(category.slug)}`}
        className="underline decoration-rule-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
      >
        {category.name}
      </Link>
    )),
    author ? `By ${author.name}` : null,
    publishedDate ? <time dateTime={post.publishedAt ?? undefined}>{publishedDate}</time> : null,
  ].filter(Boolean)
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
          ...(author.name === 'Stephanie Caruana'
            ? { '@id': founderId, url: `${APP_URL}/about` }
            : {}),
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
      {faqs.length >= 2 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      ) : null}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <Container>
        <article className="mx-auto max-w-[72rem]">
          <Link
            href="/blog"
            className="mt-[18px] inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink md:mt-5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the Journal
          </Link>
          <header className="mt-4 lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(40px,5vw,88px)]">
            <div>
              <h1 className="text-[2.375rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4.2vw,3.75rem)]">
                {post.title}
              </h1>
              {standfirst ? (
                <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.7] text-ink-2">
                  {standfirst}
                </p>
              ) : null}
              {metaParts.length > 0 ? (
                <p className="mt-5 text-[13px] text-ink-3">
                  {metaParts.map((part, index) => (
                    <Fragment key={index}>
                      {index > 0 ? ' \u00b7 ' : null}
                      {part}
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </div>
            {imageUrl && featuredImage?.width && featuredImage.height ? (
              <Image
                src={imageUrl}
                alt={featuredImage.alt || post.title}
                width={featuredImage.width}
                height={featuredImage.height}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="mx-auto mt-8 h-auto max-h-[75vh] w-auto lg:mr-0 lg:mt-0 lg:max-h-[min(36rem,72vh)]"
              />
            ) : null}
          </header>
          {post.content ? (
            <div className="mt-10 lg:mt-[clamp(56px,6vw,88px)] lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 xl:gap-20">
              <div className="prose mx-auto max-w-[44rem] text-[1.0625rem] [overflow-wrap:anywhere] prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-[-0.01em] prose-headings:text-ink prose-h2:mb-4 prose-h2:mt-12 prose-h2:scroll-mt-24 prose-h2:text-[1.875rem] prose-h2:leading-[1.15] prose-h3:mb-3 prose-h3:mt-10 prose-h3:text-[1.4rem] prose-h3:leading-[1.2] prose-h4:mt-8 prose-p:leading-[1.75] prose-p:text-ink prose-a:font-normal prose-a:text-accent prose-a:decoration-accent/40 prose-a:underline-offset-4 hover:prose-a:decoration-accent prose-blockquote:border-rule-2 prose-blockquote:font-serif prose-blockquote:font-normal prose-blockquote:text-ink-2 prose-strong:font-medium prose-strong:text-ink prose-ol:list-decimal prose-ul:list-disc prose-li:my-1.5 prose-li:text-ink prose-li:marker:normal-nums prose-li:marker:text-ink-2 md:text-[1.125rem] lg:mx-0 [&>:first-child]:mt-0 [&_li>p]:my-0">
                <RichText
                  converters={postConverters}
                  data={rewriteLegacyPostLinks(
                    post.content as unknown as SerializedEditorState,
                    APP_URL
                  )}
                />
              </div>
              <aside className="hidden lg:block">
                <div className="sticky top-[92px] max-h-[calc(100vh-112px)] space-y-8 overflow-y-auto border-t border-rule pt-5 text-sm [scrollbar-width:thin]">
                  {headings.length >= 3 ? (
                    <nav aria-label="In this article">
                      <h2 className="text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
                        In this article
                      </h2>
                      <ol className="mt-3 space-y-2">
                        {headings.map((heading) => (
                          <li key={heading.id}>
                            <a
                              href={`#${heading.id}`}
                              className="leading-snug text-ink-2 transition-colors hover:text-ink"
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  ) : null}
                  {picks ? <ShopPicksList picks={picks} /> : null}
                </div>
              </aside>
            </div>
          ) : null}
        </article>
        <div className="mx-auto mt-[clamp(56px,7vw,96px)] grid max-w-[72rem] gap-[clamp(48px,6vw,80px)]">
          <RelatedReading post={post} />
          {picks ? <FromTheShop picks={picks} className="lg:hidden" /> : null}
        </div>
      </Container>
    </MarketingShell>
  )
}

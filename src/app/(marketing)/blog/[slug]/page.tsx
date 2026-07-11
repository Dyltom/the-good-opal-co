import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media, Post } from '@/types/payload-types'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const getPublishedPost = cache(async (slug: string): Promise<Post | undefined> => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })

  return docs[0]
})

function populatedMedia(media: number | null | Media | undefined): Media | null {
  return media && typeof media === 'object' ? media : null
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
  const imageUrl = resolveMediaUrl(socialImage?.url)

  return {
    title,
    description,
    keywords: post.seo?.keywords ?? undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: APP_NAME,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: imageUrl ? [{ url: imageUrl, alt: socialImage?.alt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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

  return (
    <MarketingShell>
      <Container className="py-14 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to opal notes
        </Link>
        <article className="mx-auto mt-12 max-w-4xl">
          {publishedDate ? (
            <time className="font-sans text-xs uppercase tracking-[0.12em] text-charcoal/50">
              {publishedDate}
            </time>
          ) : null}
          <h1 className="mt-4 text-balance font-serif text-5xl font-medium leading-none text-charcoal sm:text-6xl">
            {post.title}
          </h1>
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
        </article>
      </Container>
    </MarketingShell>
  )
}

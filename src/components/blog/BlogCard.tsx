import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/types/payload-types'
import { resolveMediaUrl } from '@/lib/media-url'
import { postSummary } from '@/lib/rich-text'
import { cn, formatDate } from '@/lib/utils'

export interface BlogCardPost {
  slug: string
  title: string
  excerpt?: string
  featuredImage?: { url: string; alt: string }
  publishedAt?: Date | null
  author?: string
  category?: string
}

export function toBlogCardPost(post: Post): BlogCardPost {
  const image =
    post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null
  const author = post.author && typeof post.author === 'object' ? post.author : null
  const category = post.categories?.find((value) => typeof value === 'object')
  const imageUrl = resolveMediaUrl(image?.url)
  return {
    slug: post.slug,
    title: post.title,
    excerpt: postSummary(post.excerpt, post.content) || undefined,
    featuredImage: imageUrl ? { url: imageUrl, alt: image?.alt || post.title } : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    author: author?.name,
    category: category && typeof category === 'object' ? category.name : undefined,
  }
}

interface BlogCardProps {
  post: BlogCardPost
  lead?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function BlogCard({ post, lead = false, headingLevel: Heading = 'h2' }: BlogCardProps) {
  const meta = [
    post.category,
    post.publishedAt
      ? formatDate(post.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })
      : undefined,
    lead && post.author ? `By ${post.author}` : undefined,
  ].filter(Boolean)

  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          'block',
          lead &&
            'md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center md:gap-[clamp(24px,3.2vw,56px)]'
        )}
      >
        {post.featuredImage ? (
          <div
            className={cn(
              'relative overflow-hidden bg-plinth',
              lead ? 'mb-5 aspect-[4/3] md:mb-0 md:aspect-[16/10]' : 'mb-4 aspect-[3/2]'
            )}
          >
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              priority={lead}
              sizes={
                lead
                  ? '(max-width: 768px) 100vw, 58vw'
                  : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
              }
              className="object-cover transition-transform duration-700 ease-gallery group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="mb-4 border-t border-rule-2" />
        )}
        <div>
          {meta.length > 0 ? (
            <p className="text-[13px] text-ink-3">{meta.join(' \u00b7 ')}</p>
          ) : null}
          <Heading
            className={cn(
              'mt-2 decoration-rule-2 underline-offset-4 group-hover:underline',
              lead
                ? 'text-[clamp(1.875rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.02em]'
                : 'text-[1.375rem] leading-[1.15]'
            )}
          >
            {post.title}
          </Heading>
          {post.excerpt ? (
            <p
              className={cn(
                'mt-2 max-w-[60ch] text-ink-2',
                lead ? 'mt-3 text-base leading-7' : 'line-clamp-3 text-sm leading-6'
              )}
            >
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

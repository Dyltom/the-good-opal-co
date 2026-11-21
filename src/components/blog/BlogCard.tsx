import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  post: {
    slug: string
    title: string
    excerpt?: string
    featuredImage?: { url: string; alt: string }
    publishedAt?: Date | null
    author?: string
    category?: string
  }
}

export function BlogCard({ post }: BlogCardProps) {
  const meta = [
    post.category,
    post.publishedAt
      ? formatDate(post.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })
      : undefined,
    post.author ? `By ${post.author}` : undefined,
  ].filter(Boolean)

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.featuredImage ? (
          <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-plinth">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-gallery group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="mb-4 border-t border-rule-2" />
        )}
        {meta.length > 0 ? <p className="text-[13px] text-ink-3">{meta.join(' \u00b7 ')}</p> : null}
        <h2 className="mt-2 text-[1.5rem] leading-[1.15] decoration-rule-2 underline-offset-4 group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 max-w-[60ch] text-sm leading-6 text-ink-2">
            {post.excerpt}
          </p>
        ) : null}
      </Link>
    </article>
  )
}

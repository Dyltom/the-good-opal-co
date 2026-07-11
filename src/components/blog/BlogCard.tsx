import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  post: {
    slug: string
    title: string
    excerpt?: string
    featuredImage?: { url: string; alt: string }
    publishedAt?: Date | null
  }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group border-t border-warm-grey/70 pt-5">
      <Link href={`/blog/${post.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible">
        {post.featuredImage ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-warm-grey/20">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        {post.publishedAt ? (
          <time className="mt-5 block font-sans text-xs uppercase tracking-[0.12em] text-charcoal/50">
            {formatDate(post.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        ) : null}
        <h2 className="mt-3 font-serif text-2xl font-medium leading-tight text-charcoal">{post.title}</h2>
        {post.excerpt ? <p className="mt-3 line-clamp-3 font-sans text-sm leading-6 text-charcoal/65">{post.excerpt}</p> : null}
        <span className="mt-5 inline-flex items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold text-charcoal">
          Read article <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </article>
  )
}

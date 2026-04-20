'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
/**
 * Blog Card Props
 */
interface BlogCardProps {
  post: {
    slug: string
    title: string
    excerpt?: string
    featuredImage?: {
      id: string
      url: string
      alt: string
      width: number
      height: number
    }
    publishedAt?: Date | null
  }
  showImage?: boolean
  showExcerpt?: boolean
  showDate?: boolean
}

/**
 * Blog Card Component
 * Premium card design for blog posts
 */
export function BlogCard({
  post,
  showImage = true,
  showExcerpt = true,
  showDate = true,
}: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl hover:border-transparent">
          {/* Gradient border on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
            <div className="absolute inset-[1px] rounded-2xl bg-white" />
          </div>

          {/* Featured Image */}
          {showImage && post.featuredImage && (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          )}

          <div className="relative p-6">

            {/* Title */}
            <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 line-clamp-2 text-charcoal group-hover:text-opal-electric transition-all duration-300">
              {post.title}
            </h3>

            {/* Date */}
            {showDate && post.publishedAt && (
              <time className="text-sm text-gray-500 mb-3 block flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            )}

            {/* Excerpt */}
            {showExcerpt && post.excerpt && (
              <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>
            )}

            {/* Read more link */}
            <span className="inline-flex items-center gap-2 text-sm font-medium text-opal-electric-accessible group-hover:text-opal-deep transition-colors">
              Read Article
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

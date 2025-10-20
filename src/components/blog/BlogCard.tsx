import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types'

/**
 * Blog Card Props
 */
interface BlogCardProps {
  post: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'featuredImage' | 'publishedAt' | 'categories'>
  showImage?: boolean
  showExcerpt?: boolean
  showDate?: boolean
  showCategories?: boolean
}

/**
 * Blog Card Component
 * Reusable card for displaying blog post preview
 */
export function BlogCard({
  post,
  showImage = true,
  showExcerpt = true,
  showDate = true,
  showCategories = true,
}: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured Image */}
        {showImage && post.featuredImage && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        )}

        <div className="p-6">
          {/* Categories */}
          {showCategories && post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Date */}
          {showDate && post.publishedAt && (
            <time className="text-sm text-muted-foreground mb-3 block">
              {formatDate(post.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
          )}

          {/* Excerpt */}
          {showExcerpt && post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </Card>
  )
}

import { notFound } from 'next/navigation'
import { Navigation, Footer } from '@/components/navigation'
import { getPayload } from '@/lib/payload'
import type { Post } from '@/types/payload-types'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { PageTransition } from '@/components/layout/PageTransition'

/**
 * Blog Post Detail Page
 * Displays individual blog post with full content
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload()

  try {
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: 'published',
        },
      },
      limit: 1,
    })

    const post = docs[0] as Post | undefined

    if (!post) {
      notFound()
    }

    // Format the date
    const publishedDate = post.publishedAt
      ? new Intl.DateTimeFormat('en-AU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(post.publishedAt))
      : null

    const author = typeof post.author === 'object' ? post.author : null
    const categories = post.categories
      ?.map((cat) => (typeof cat === 'object' ? cat : null))
      .filter(Boolean) || []

    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-white">
          <Navigation
            logoText="The Good Opal Co"
            items={[
              { href: '/', label: 'Home' },
              { href: '/blog', label: 'Blog' },
            ]}
          />
          <main className="flex-1">
            <article className="max-w-4xl mx-auto px-4 py-20">
              {/* Hero Image */}
              {post.featuredImage && typeof post.featuredImage === 'object' && (
                <div className="aspect-video relative rounded-lg overflow-hidden mb-12">
                  <Image
                    src={post.featuredImage.url!}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <span
                      key={category!.id}
                      className="text-sm font-medium text-opal-electric-accessible bg-opal-light px-3 py-1 rounded-full"
                    >
                      {category!.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-content-muted mb-12 pb-8 border-b">
                {author && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{author.name}</span>
                  </div>
                )}
                {publishedDate && (
                  <>
                    <span className="text-content-muted/50">•</span>
                    <time dateTime={post.publishedAt || ''}>
                      {publishedDate}
                    </time>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg prose-stone max-w-none">
                {post.content && (
                  <RichText
                    data={post.content as SerializedEditorState}
                    converters={({
                      defaultConverters,
                    }) => [...defaultConverters]}
                  />
                )}
              </div>

              {/* Related Products */}
              {post.relatedProducts && post.relatedProducts.length > 0 && (
                <div className="mt-16 pt-16 border-t">
                  <h2 className="text-2xl font-display font-bold text-charcoal mb-8">
                    Featured Products
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {post.relatedProducts.map((productRel) => {
                      const product = typeof productRel === 'object' ? productRel : null
                      if (!product) return null

                      const mainImage = product.images?.[0]
                      const imageUrl = typeof mainImage === 'object' ? mainImage.url : mainImage

                      return (
                        <a
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                          {imageUrl && (
                            <div className="aspect-square relative overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-medium text-charcoal mb-2 group-hover:text-opal-electric-accessible transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-lg font-bold text-charcoal">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* Back to Blog */}
            <div className="bg-surface-soft py-12">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 text-opal-electric-accessible hover:text-opal-electric-accessible font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to All Articles
                </a>
              </div>
            </div>
          </main>
          <Footer logoText="The Good Opal Co" />
        </div>
      </PageTransition>
    )
  } catch (error) {
    console.error('Error fetching blog post:', error)
    notFound()
  }
}

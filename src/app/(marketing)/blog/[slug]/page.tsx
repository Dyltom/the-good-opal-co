import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navigation, Footer } from '@/components/navigation'
import { getPayload } from '@/lib/payload'
import type { Post } from '@/types/payload-types'
import Image from 'next/image'
import { formatCurrency, cn } from '@/lib/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { PageTransition } from '@/components/layout/PageTransition'
import { Clock, User, Calendar } from 'lucide-react'

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
      <>
        <Navigation
          logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
          items={[
            { href: '/store', label: 'Shop' },
            { href: '/blog', label: 'Blog' },
            { href: '/faq', label: 'FAQ' },
          ]}
        />

        <PageTransition>
          <div className="min-h-screen bg-white">
            <main className="flex-1">
              {/* Hero Section */}
              <section className="relative py-20 md:py-32 bg-gradient-to-b from-black-rich via-charcoal to-black-rich overflow-hidden -mt-24">
                {/* Background effects */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-opal-turquoise/20 to-opal-emerald/20 blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6 justify-center">
                      {categories.map((category) => (
                        <span
                          key={category!.id}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-opal-electric to-fire-pink" />
                          {category!.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white text-center mb-8 leading-tight">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-xl text-white/80 text-center max-w-3xl mx-auto mb-8 font-light">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center justify-center gap-6 text-white/60">
                    {author && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-accent text-sm uppercase tracking-wider">{author.name || 'Stephanie Caruana'}</span>
                      </div>
                    )}
                    {publishedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.publishedAt || ''} className="font-accent text-sm uppercase tracking-wider">
                          {publishedDate}
                        </time>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Featured Image */}
              {post.featuredImage && typeof post.featuredImage === 'object' && (
                <div className="max-w-6xl mx-auto px-4 -mt-16 mb-16 relative z-20">
                  <div className="aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={post.featuredImage.url!}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                  </div>
                </div>
              )}

              {/* Article Content */}
              <article className="max-w-4xl mx-auto px-4 pb-20">
                {/* Content */}
                <div className="prose prose-lg prose-stone max-w-none
                  prose-headings:font-serif prose-headings:text-charcoal
                  prose-h1:text-4xl prose-h1:mb-8
                  prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
                  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                  prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-opal-electric-accessible prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-charcoal prose-strong:font-semibold
                  prose-ul:mb-6 prose-ol:mb-6
                  prose-li:text-charcoal/80 prose-li:mb-2
                  prose-blockquote:border-l-4 prose-blockquote:border-opal-electric prose-blockquote:pl-6 prose-blockquote:italic
                  prose-blockquote:text-charcoal/70 prose-blockquote:my-8
                  prose-img:rounded-lg prose-img:shadow-xl">
                  {post.content && (
                    <RichText
                      data={post.content as SerializedEditorState}
                    />
                  )}
                </div>

                {/* Related Products */}
                {post.relatedProducts && post.relatedProducts.length > 0 && (
                  <div className="mt-20 pt-20 border-t border-gray-200">
                    <div className="text-center mb-12">
                      <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
                        Featured Products
                      </h2>
                      <p className="text-lg text-charcoal/60">
                        Handpicked opals that complement this article
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {post.relatedProducts.map((productRel) => {
                        const product = typeof productRel === 'object' ? productRel : null
                        if (!product) return null

                        const mainImage = product.images?.[0]
                        const imageUrl = typeof mainImage === 'object' ? mainImage.url : mainImage

                        return (
                          <a
                            key={product.id}
                            href={`/store/${product.slug}`}
                            className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                          >
                            {imageUrl && (
                              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="font-serif text-xl text-charcoal mb-2 group-hover:text-opal-electric transition-colors">
                                {product.name}
                              </h3>
                              <p className="font-accent text-2xl font-semibold text-gradient-prismatic">
                                {formatCurrency(product.price, 'AUD')}
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
              <div className="bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-opal-electric to-fire-pink text-white font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
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
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </PageTransition>

        <Footer />
      </>
    )
}

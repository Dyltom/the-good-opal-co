import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Package, ArrowRight } from 'lucide-react'
import { searchProducts } from './actions'

interface SearchResultsProps {
  query: string
  page: number
}

export async function SearchResults({ query, page }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal/70 text-lg">
          Enter a search term to explore our entire site
        </p>
      </div>
    )
  }

  const results = await searchProducts(query, page)

  if (results.totalResults === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
          No treasures found
        </h2>
        <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
          We couldn&apos;t find anything matching &quot;{query}&quot;.
          Try searching with different keywords or explore our collections.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/store">Browse Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">Read Our Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Results Overview */}
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
          Found <span className="text-opal-electric">{results.products.length + results.posts.length + results.pages.length}</span> treasures for &quot;{query}&quot;
          {results.totalProducts > results.products.length && (
            <span className="text-sm font-normal text-charcoal/70 block mt-1">
              Showing top results from {results.totalResults} total matches
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-charcoal/70">
          {results.products.length > 0 && (
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {results.totalProducts > results.products.length
                ? `${results.products.length} of ${results.totalProducts} Product${results.totalProducts !== 1 ? 's' : ''}`
                : `${results.products.length} Product${results.products.length !== 1 ? 's' : ''}`
              }
            </span>
          )}
          {results.posts.length > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {results.totalPosts > results.posts.length
                ? `${results.posts.length} of ${results.totalPosts} Blog Post${results.totalPosts !== 1 ? 's' : ''}`
                : `${results.posts.length} Blog Post${results.posts.length !== 1 ? 's' : ''}`
              }
            </span>
          )}
          {results.pages.length > 0 && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {results.pages.length} Page{results.pages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Products Section */}
      {results.products.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-semibold text-charcoal">Products</h3>
            {results.totalProducts > results.products.length && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/store?search=${encodeURIComponent(query)}`}>
                  View all {results.totalProducts} in shop
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.products.map((product, index) => {
              try {
                // Extract description safely
                let description = ''
                if (typeof product.description === 'string') {
                  description = product.description
                } else if (product.description && typeof product.description === 'object') {
                  description = 'Rich text content'
                }

                // Extract image URL safely
                let imageUrl = ''
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                  const firstImage = product.images[0]
                  if (firstImage && firstImage.image) {
                    if (typeof firstImage.image === 'string') {
                      imageUrl = firstImage.image
                    } else if (firstImage.image && typeof firstImage.image === 'object' && 'url' in firstImage.image) {
                      imageUrl = firstImage.image.url || ''
                    }
                  }
                }

                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: String(product.id),
                      slug: product.slug || '',
                      name: product.name || 'Unnamed Product',
                      description,
                      price: product.price || 0,
                      compareAtPrice: product.compareAtPrice || undefined,
                      stock: product.stock ?? 0,
                      featured: product.featured ?? false,
                      category: product.category || '',
                      image: imageUrl,
                      stoneOrigin: product.stoneOrigin || undefined,
                      stoneType: product.stoneType || undefined,
                      createdAt: product.createdAt || '',
                    }}
                    index={index}
                    variant="default"
                    animated
                  />
                )
              } catch (error) {
                console.error('Error rendering product:', product.id, error)
                return (
                  <div key={product.id} className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600">Error loading product: {product.name}</p>
                  </div>
                )
              }
            })}
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      {results.posts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-semibold text-charcoal">Blog Posts</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">
                View all posts
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.posts.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {post.featuredImage && typeof post.featuredImage === 'object' && post.featuredImage.url && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={post.featuredImage.url}
                      alt={post.title || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h4 className="font-serif text-lg font-semibold text-charcoal mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="text-charcoal/70 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {post.publishedAt && (
                      <time className="text-xs text-charcoal/50">
                        {new Date(post.publishedAt).toLocaleDateString('en-AU')}
                      </time>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read more
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pages Section */}
      {results.pages.length > 0 && (
        <section className="mb-12">
          <h3 className="font-serif text-xl font-semibold text-charcoal mb-6">Pages</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {results.pages.map((page, index) => (
              <Link
                key={index}
                href={page.slug}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-opal-electric/30 transition-colors"
              >
                <h4 className="font-serif text-lg font-semibold text-charcoal mb-2">
                  {page.title}
                </h4>
                {page.excerpt && (
                  <p className="text-charcoal/70 text-sm">
                    {page.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
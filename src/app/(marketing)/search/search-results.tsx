import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { searchProducts } from './actions'
import { cn } from '@/lib/utils'

interface SearchResultsProps {
  query: string
  page: number
}

export async function SearchResults({ query, page }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-content text-lg">
          Enter a search term to find products
        </p>
      </div>
    )
  }

  const results = await searchProducts(query, page)

  if (results.products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-charcoal mb-4">
          No results found
        </h2>
        <p className="text-content mb-8 max-w-md mx-auto">
          We couldn't find any products matching "{query}".
          Try searching with different keywords or browse our collections.
        </p>
        <Button asChild>
          <Link href="/store">Browse All Products</Link>
        </Button>
      </div>
    )
  }

  const totalPages = Math.ceil(results.totalResults / 12)
  const showPagination = totalPages > 1

  return (
    <>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-content">
          Found <span className="font-semibold text-charcoal">{results.totalResults}</span>
          {results.totalResults === 1 ? ' result' : ' results'} for "{query}"
        </p>
      </div>

      {/* Product grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            variant="default"
            animated
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={page <= 1}
            className={cn(page <= 1 && 'pointer-events-none opacity-50')}
          >
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              const isActive = pageNum === page

              // Show first page, last page, current page, and adjacent pages
              const shouldShow =
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - page) <= 1

              if (!shouldShow && pageNum === 2) {
                return <span key={i} className="text-gray-400">...</span>
              }

              if (!shouldShow && pageNum === totalPages - 1) {
                return <span key={i} className="text-gray-400">...</span>
              }

              if (!shouldShow) return null

              return (
                <Button
                  key={i}
                  asChild
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'min-w-[40px]',
                    isActive && 'pointer-events-none'
                  )}
                >
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </Link>
                </Button>
              )
            })}
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            className={cn(page >= totalPages && 'pointer-events-none opacity-50')}
          >
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * Pagination Props
 */
interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

/**
 * Pagination Component
 * Reusable pagination with prev/next and page numbers
 */
export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const buildPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://localhost')
    url.searchParams.set('page', page.toString())
    return url.pathname + url.search
  }

  // Calculate page range to show
  const getPageRange = () => {
    const delta = 2 // Pages to show on each side
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const pages = getPageRange()

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage > 1}
        disabled={currentPage === 1}
      >
        {currentPage > 1 ? (
          <Link href={buildPageUrl(currentPage - 1)} aria-label="Previous page">
            Previous
          </Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`dots-${index}`} className="px-2">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              asChild={currentPage !== page}
              disabled={currentPage === page}
            >
              {currentPage === page ? (
                <span aria-current="page">{page}</span>
              ) : (
                <Link href={buildPageUrl(page as number)} aria-label={`Page ${page}`}>
                  {page}
                </Link>
              )}
            </Button>
          )
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage < totalPages}
        disabled={currentPage === totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildPageUrl(currentPage + 1)} aria-label="Next page">
            Next
          </Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </nav>
  )
}

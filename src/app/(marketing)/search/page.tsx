import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SearchResults } from './search-results'
import { SearchInput } from '@/components/search/SearchInput'

export const metadata: Metadata = {
  title: 'Search | The Good Opal Co',
  description: 'Search our collection of authentic Australian opals',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const page = params.page ? parseInt(params.page) : 1

  return (
    <div className="min-h-screen bg-white py-12">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search' },
          ]}
          className="mb-8"
        />

        {/* Search header */}
        <div className="mb-12">
          <h1 className="text-3xl font-display font-bold text-charcoal mb-6">
            {query ? `Search results for "${query}"` : 'Search Products'}
          </h1>

          <div className="max-w-xl">
            <SearchInput variant="default" />
          </div>
        </div>

        {/* Search results */}
        <Suspense
          fallback={
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg animate-pulse"
                  style={{ aspectRatio: '3/4' }}
                />
              ))}
            </div>
          }
        >
          <SearchResults query={query} page={page} />
        </Suspense>
      </Container>
    </div>
  )
}
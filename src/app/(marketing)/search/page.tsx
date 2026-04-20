import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { SearchResults } from './search-results'
import { SearchInput } from '@/components/search/SearchInput'
import { Sparkles } from 'lucide-react'

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
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation
          logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
          items={[
            { href: '/store', label: 'Shop' },
            { href: '/blog', label: 'Blog' },
            { href: '/courses', label: 'Courses' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
            { href: '/faq', label: 'FAQ' },
          ]}
          transparent
        />

        <main className="flex-1 pt-10">
          {/* Fairytale Search Header */}
          <section className="relative py-8 lg:py-12 bg-gradient-to-br from-slate-50 via-white to-opal-electric/5 overflow-hidden pt-32">
            {/* Magical sparkle effects */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-1/4 w-4 h-4 bg-opal-electric/30 rounded-full animate-pulse" />
              <div className="absolute top-32 right-1/3 w-2 h-2 bg-fire-pink/40 rounded-full animate-pulse delay-300" />
              <div className="absolute bottom-24 left-1/2 w-3 h-3 bg-opal-turquoise/30 rounded-full animate-pulse delay-700" />
            </div>

            <Container>
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles size={20} className="text-opal-electric" />
                  <span className="font-accent text-lg text-opal-electric">
                    Discover Your Treasure
                  </span>
                  <Sparkles size={20} className="text-opal-electric" />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-charcoal leading-tight">
                  {query ? (
                    <>
                      Results for <span className="font-accent text-opal-electric">&ldquo;{query}&rdquo;</span>
                    </>
                  ) : (
                    <>
                      Search Our <span className="font-accent text-opal-electric">Treasure Trove</span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-charcoal/70 leading-relaxed max-w-2xl mx-auto mb-8">
                  {query ?
                    "Discovering treasures across products, stories, and knowledge." :
                    "Search our entire collection: opals, jewellery, blog stories, courses, and helpful guides."
                  }
                </p>

                {/* Search Input */}
                <div className="max-w-2xl mx-auto">
                  <SearchInput variant="default" initialQuery={query} className="w-full" />
                </div>

                <p className="font-accent text-lg text-opal-electric/80 mt-6">
                  ~ Let the magic guide your search ~
                </p>
              </div>
            </Container>
          </section>

          {/* Search Results Section */}
          <section className="bg-white py-12">
            <Container>
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
          </section>
        </main>

        <Footer logoText="The Good Opal Co" />
      </div>
    </PageTransition>
  )
}
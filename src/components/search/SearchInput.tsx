'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSearchSuggestions } from '@/app/(marketing)/search/actions'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  variant?: 'default' | 'mobile'
  onClose?: () => void
  className?: string
  autoFocus?: boolean
  initialQuery?: string
}

export function SearchInput({
  variant = 'default',
  onClose,
  className,
  autoFocus = false,
  initialQuery,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setSuggestions([])
        setLoading(false)
        return
      }

      // Show loading only for longer queries to avoid flashing
      if (debouncedQuery.length >= 2) {
        setLoading(true)
      }

      try {
        const results = await getSearchSuggestions(debouncedQuery)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)

      // Don't reset query - keep it in the search box
      // setQuery('') // Removed this line
      setSuggestions([])
      setShowSuggestions(false)
      onClose?.()
    },
    [router, onClose]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex])
        } else {
          handleSearch(query)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative',
        variant === 'mobile' && 'w-full',
        className
      )}
    >
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-white transition-all',
          'focus-within:border-opal-electric focus-within:ring-2 focus-within:ring-opal-electric/20',
          variant === 'default' && 'w-80 h-10 border-gray-200',
          variant === 'mobile' && 'w-full h-12 border-gray-300',
          className?.includes('w-full') && 'w-full'
        )}
      >
        <Search
          className={cn(
            'absolute left-3 text-opal-electric/60',
            variant === 'default' && 'h-4 w-4',
            variant === 'mobile' && 'h-5 w-5'
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow suggestion clicks
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search opals, rings, parcels"
          className={cn(
            'h-full w-full bg-transparent outline-none placeholder:text-gray-400',
            variant === 'default' && 'pl-9 pr-9 text-sm',
            variant === 'mobile' && 'pl-11 pr-11 text-base'
          )}
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions && suggestions.length > 0}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className={cn(
              'absolute right-0 flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-400 transition-colors hover:text-gray-600',
              variant === 'default' && 'h-10 w-10 sm:min-h-8 sm:min-w-8',
              variant === 'mobile' && 'h-12 w-12'
            )}
            aria-label="Clear search"
          >
            <X className="h-full w-full" />
          </button>
        )}
        {loading && (
          <Loader2
            className={cn(
              'absolute right-3 animate-spin text-gray-400',
              variant === 'default' && 'h-4 w-4',
              variant === 'mobile' && 'h-5 w-5'
            )}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && query.length >= 2 && !loading && (
        <div
          id="search-suggestions"
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg',
            'border border-gray-200 py-2',
            'max-h-64 overflow-auto'
          )}
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  'hover:bg-gray-50',
                  index === selectedIndex && 'bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-opal-electric/60 shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>No results found</span>
              </div>
              <p className="text-xs text-gray-400">
                Try searching for &quot;black opal&quot; or &quot;rings&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

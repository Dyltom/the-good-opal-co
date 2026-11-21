'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { getSearchSuggestions } from '@/app/(marketing)/search/actions'
import type { SearchSuggestion } from '@/app/(marketing)/search/suggestions'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  onClose?: () => void
  className?: string
  autoFocus?: boolean
  initialQuery?: string
}

export function SearchInput({
  onClose,
  className,
  autoFocus = false,
  initialQuery,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || searchParams.get('search') || '')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setSuggestions([])
        setLoading(false)
        return
      }

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

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      router.push(`/store?search=${encodeURIComponent(searchQuery.trim())}`)
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
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          const suggestion = suggestions[selectedIndex]
          setQuery(suggestion.label)
          router.push(suggestion.href)
          setSuggestions([])
          setShowSuggestions(false)
          onClose?.()
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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label)
    router.push(suggestion.href)
    setSuggestions([])
    setShowSuggestions(false)
    onClose?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative w-full', className)}
    >
      <div
        className={cn(
          'relative flex h-12 w-full items-center rounded-sm border border-rule-2 bg-bg transition-colors',
          'focus-within:border-ink'
        )}
      >
        <Search className="absolute left-3.5 h-[18px] w-[18px] text-ink-3" aria-hidden="true" />
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
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search opals, rings, parcels"
          className={cn(
            'h-full w-full bg-transparent pl-11 pr-11 text-base outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:[-webkit-appearance:none]'
          )}
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-activedescendant={
            showSuggestions && selectedIndex >= 0 && suggestions[selectedIndex]
              ? `search-suggestion-${selectedIndex}`
              : undefined
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-0 flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center text-ink-2 transition-colors hover:text-ink"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 h-5 w-5 animate-spin text-ink-3" />
        )}
      </div>

      {showSuggestions && query.length >= 2 && !loading && (
        <div
          id="search-suggestions"
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-sm bg-bg shadow-lg',
            'border border-rule py-2',
            'max-h-[min(30rem,70vh)] overflow-auto'
          )}
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.href}
                id={`search-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  'hover:bg-plinth',
                  index === selectedIndex && 'bg-plinth'
                )}
              >
                <div className="flex items-center gap-3">
                  {suggestion.image ? (
                    <Image
                      src={suggestion.image}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-sm bg-plinth object-cover"
                    />
                  ) : suggestion.price === undefined ? (
                    <span className="flex h-8 w-12 shrink-0 items-center justify-center">
                      <Search className="h-4 w-4 text-accent" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="h-12 w-12 shrink-0 rounded-sm bg-plinth" aria-hidden="true" />
                  )}
                  <span className="line-clamp-2 min-w-0 flex-1">{suggestion.label}</span>
                  {suggestion.sold ? (
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">
                      Sold
                    </span>
                  ) : suggestion.price !== undefined ? (
                    <span className="shrink-0 font-semibold text-ink">
                      {formatCurrency(suggestion.price, 'AUD')}
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-sm text-ink-3">
              <div className="mb-1 flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>No results found</span>
              </div>
              <p className="text-xs text-ink-3">
                Try searching for &quot;black opal&quot; or &quot;rings&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

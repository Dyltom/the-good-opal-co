'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSearchSuggestions } from '@/app/(marketing)/search/actions'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  variant?: 'default' | 'mobile'
  onClose?: () => void
  className?: string
  autoFocus?: boolean
}

export function SearchInput({
  variant = 'default',
  onClose,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
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

      // Reset state
      setQuery('')
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
          variant === 'mobile' && 'w-full h-12 border-gray-300'
        )}
      >
        <Search
          className={cn(
            'absolute left-3 text-gray-400',
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
          placeholder="Search for opals..."
          className={cn(
            'w-full bg-transparent outline-none placeholder:text-gray-400',
            variant === 'default' && 'pl-9 pr-9 text-sm',
            variant === 'mobile' && 'pl-11 pr-11 text-base'
          )}
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
              'absolute right-3 text-gray-400 hover:text-gray-600 transition-colors',
              variant === 'default' && 'h-4 w-4',
              variant === 'mobile' && 'h-5 w-5'
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
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg',
            'border border-gray-200 py-2',
            'max-h-64 overflow-auto'
          )}
        >
          {suggestions.map((suggestion, index) => (
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
                <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
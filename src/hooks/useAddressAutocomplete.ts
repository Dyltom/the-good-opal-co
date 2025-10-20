import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Nominatim (OpenStreetMap) Address Result
 */
interface NominatimResult {
  display_name: string
  address: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country?: string
  }
  lat: string
  lon: string
}

/**
 * Parsed Address Components
 */
export interface AddressComponents {
  address: string
  city: string
  state: string
  zip: string
}

/**
 * Address Autocomplete Hook (Free using OpenStreetMap Nominatim)
 *
 * Provides address search and autocomplete using free Nominatim API
 * No API key required!
 */
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Search for addresses using our API proxy (avoids CORS)
   */
  const searchAddress = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      // Use our API proxy to avoid CORS issues
      const response = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Address search failed')
      }

      const data = await response.json()
      const results: NominatimResult[] = data.data?.results || []

      setSuggestions(results)
      setIsOpen(results.length > 0)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Address search error:', error)
        setSuggestions([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Parse Nominatim result into address components
   */
  const parseAddress = useCallback((result: NominatimResult): AddressComponents => {
    const addr = result.address
    const streetNumber = addr.house_number || ''
    const street = addr.road || ''
    const address = `${streetNumber} ${street}`.trim()

    const city = addr.city || addr.town || addr.village || addr.suburb || ''
    const state = addr.state || ''
    const zip = addr.postcode || ''

    return {
      address,
      city,
      state,
      zip,
    }
  }, [])

  /**
   * Close suggestions dropdown
   */
  const closeSuggestions = useCallback(() => {
    setIsOpen(false)
  }, [])

  /**
   * Clear suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setIsOpen(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestions,
    isLoading,
    isOpen,
    searchAddress,
    parseAddress,
    closeSuggestions,
    clearSuggestions,
  }
}

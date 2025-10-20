import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api'

/**
 * Address Search API (Nominatim Proxy)
 * Proxies requests to OpenStreetMap Nominatim to avoid CORS issues
 */
async function handleAddressSearch(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 3) {
    return errorResponse('Query must be at least 3 characters', 'INVALID_QUERY', 400)
  }

  try {
    // Call Nominatim API
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
    nominatimUrl.searchParams.set('q', query)
    nominatimUrl.searchParams.set('format', 'json')
    nominatimUrl.searchParams.set('addressdetails', '1')
    nominatimUrl.searchParams.set('limit', '5')

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'RapidSites/1.0 (Address Autocomplete)',
      },
    })

    if (!response.ok) {
      throw new Error('Nominatim API request failed')
    }

    const results = await response.json()

    return successResponse({
      results,
      count: results.length,
    })
  } catch (error) {
    console.error('Address search error:', error)
    return errorResponse('Address search failed', 'SEARCH_ERROR', 500)
  }
}

export const GET = withErrorHandler(handleAddressSearch)

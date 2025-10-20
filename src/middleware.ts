import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractSubdomain, getBaseDomain, isCustomDomain } from '@/lib/tenant'

/**
 * Next.js Middleware for tenant resolution
 * Runs on every request to identify the tenant from hostname
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Skip middleware for static files, API routes, and admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/media') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Extract tenant information
  const baseDomain = getBaseDomain()
  const subdomain = extractSubdomain(hostname)
  const customDomain = isCustomDomain(hostname, baseDomain)

  // If no tenant identifier, redirect to main site or show error
  if (!subdomain && !customDomain) {
    // This is the main marketing site (www or bare domain)
    // For now, just continue
    return NextResponse.next()
  }

  // Resolve tenant from subdomain or custom domain
  // In production, this would query the database
  // For now, we'll add tenant info to headers for downstream use

  const response = NextResponse.next()

  // Add tenant context to headers for use in server components
  if (subdomain) {
    response.headers.set('x-tenant-subdomain', subdomain)
    response.headers.set('x-tenant-type', 'subdomain')
  }

  if (customDomain) {
    response.headers.set('x-tenant-domain', hostname)
    response.headers.set('x-tenant-type', 'custom-domain')
  }

  return response
}

/**
 * Middleware configuration
 * Specify which routes to run middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

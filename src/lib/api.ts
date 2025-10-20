/**
 * API Route Helpers
 * DRY utilities for building API endpoints
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { ApiResponse, ValidationError } from '@/types'
import { HTTP_STATUS, ERROR_MESSAGES } from './constants'

/**
 * Success response helper
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success format
 */
export function successResponse<T>(data: T, status: number = HTTP_STATUS.OK): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }

  return NextResponse.json(response, { status })
}

/**
 * Error response helper
 * @param message - Error message
 * @param code - Error code
 * @param status - HTTP status code (default: 400)
 * @param details - Additional error details
 * @returns NextResponse with error format
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  status: number = HTTP_STATUS.BAD_REQUEST,
  details?: Record<string, unknown>
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    message,
  }

  return NextResponse.json(response, { status })
}

/**
 * Validation error response helper
 * @param errors - Array of validation errors
 * @returns NextResponse with validation error format
 */
export function validationErrorResponse(errors: ValidationError[]): NextResponse {
  return errorResponse(
    ERROR_MESSAGES.validation,
    'VALIDATION_ERROR',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    { errors }
  )
}

/**
 * Not found response helper
 * @param resource - Resource type (e.g., 'User', 'Post')
 * @returns NextResponse with 404
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(
    `${resource} not found`,
    'NOT_FOUND',
    HTTP_STATUS.NOT_FOUND
  )
}

/**
 * Unauthorized response helper
 * @returns NextResponse with 401
 */
export function unauthorizedResponse(): NextResponse {
  return errorResponse(
    ERROR_MESSAGES.unauthorized,
    'UNAUTHORIZED',
    HTTP_STATUS.UNAUTHORIZED
  )
}

/**
 * Forbidden response helper
 * @returns NextResponse with 403
 */
export function forbiddenResponse(): NextResponse {
  return errorResponse(
    ERROR_MESSAGES.forbidden,
    'FORBIDDEN',
    HTTP_STATUS.FORBIDDEN
  )
}

/**
 * Method not allowed response helper
 * @param allowedMethods - Array of allowed methods
 * @returns NextResponse with 405
 */
export function methodNotAllowedResponse(allowedMethods: string[]): NextResponse {
  const response = errorResponse(
    'Method not allowed',
    'METHOD_NOT_ALLOWED',
    HTTP_STATUS.METHOD_NOT_ALLOWED,
    { allowedMethods }
  )

  response.headers.set('Allow', allowedMethods.join(', '))
  return response
}

/**
 * Rate limit error response
 * @param retryAfter - Seconds until retry is allowed
 * @returns NextResponse with 429
 */
export function rateLimitResponse(retryAfter: number = 60): NextResponse {
  const response = errorResponse(
    'Too many requests',
    'RATE_LIMIT_EXCEEDED',
    HTTP_STATUS.TOO_MANY_REQUESTS,
    { retryAfter }
  )

  response.headers.set('Retry-After', retryAfter.toString())
  return response
}

/**
 * Parse request JSON body safely
 * @param request - NextRequest
 * @returns Parsed JSON or null if invalid
 */
export async function parseRequestBody<T = unknown>(
  request: NextRequest
): Promise<T | null> {
  try {
    const body = await request.json()
    return body as T
  } catch {
    return null
  }
}

/**
 * Get query parameter as string
 * @param request - NextRequest
 * @param param - Parameter name
 * @param defaultValue - Default value if not found
 * @returns Parameter value
 */
export function getQueryParam(
  request: NextRequest,
  param: string,
  defaultValue?: string
): string | undefined {
  return request.nextUrl.searchParams.get(param) || defaultValue
}

/**
 * Get query parameter as number
 * @param request - NextRequest
 * @param param - Parameter name
 * @param defaultValue - Default value if not found or invalid
 * @returns Parameter value as number
 */
export function getQueryParamNumber(
  request: NextRequest,
  param: string,
  defaultValue: number
): number {
  const value = request.nextUrl.searchParams.get(param)
  if (!value) return defaultValue

  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Get pagination params from request
 * @param request - NextRequest
 * @returns Pagination parameters
 */
export function getPaginationParams(request: NextRequest) {
  const page = getQueryParamNumber(request, 'page', 1)
  const limit = getQueryParamNumber(request, 'limit', 10)
  const sortBy = getQueryParam(request, 'sortBy')
  const sortOrder = getQueryParam(request, 'sortOrder', 'desc') as 'asc' | 'desc'

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    sortBy,
    sortOrder,
  }
}

/**
 * Async error handler wrapper for API routes
 * Catches errors and returns proper error responses
 * @param handler - Async handler function
 * @returns Wrapped handler
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof Error) {
        return errorResponse(
          process.env['NODE_ENV'] === 'development'
            ? error.message
            : ERROR_MESSAGES.serverError,
          'INTERNAL_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }

      return errorResponse(
        ERROR_MESSAGES.serverError,
        'INTERNAL_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }
}

/**
 * CORS headers helper
 * @param origins - Allowed origins (default: all in dev)
 * @returns Headers object
 */
export function getCORSHeaders(origins: string[] = ['*']): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origins.join(', '),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

/**
 * Handle OPTIONS request for CORS
 * @returns NextResponse with CORS headers
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCORSHeaders(),
  })
}

import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Health Check API Route
 * Used by Docker healthcheck and monitoring
 */
export async function GET() {
  try {
    const payload = await getPayload()
    await Promise.race([
      payload.count({ collection: 'products', overrideAccess: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database health check timed out')), 4_000)
      ),
    ])

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] || 'development',
      database: 'connected',
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'unavailable',
        error: process.env.NODE_ENV === 'production'
          ? 'A required dependency is unavailable'
          : error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

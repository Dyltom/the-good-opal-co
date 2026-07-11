import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { assessDeploymentReadiness } from '@/lib/deployment-readiness'

export const dynamic = 'force-dynamic'

/**
 * Health Check API Route
 * Used by Docker healthcheck and monitoring
 */
export async function GET() {
  const readiness = assessDeploymentReadiness()

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
      readiness,
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'unavailable',
        readiness,
        error:
          process.env.NODE_ENV === 'production'
            ? 'A required dependency is unavailable'
            : error instanceof Error
              ? error.message
              : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

import { NextResponse } from 'next/server'
import { assessDeploymentReadiness } from '@/lib/deployment-readiness'
import { checkDatabaseConnection } from '@/lib/database-health'

export const dynamic = 'force-dynamic'

/**
 * Health Check API Route
 * Used by Docker healthcheck and monitoring
 */
export async function GET() {
  const readiness = assessDeploymentReadiness()

  try {
    await checkDatabaseConnection()

    const health = {
      status: readiness.ready ? 'healthy' : 'degraded',
      liveness: 'healthy',
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
        liveness: 'unhealthy',
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

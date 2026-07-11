import { NextResponse } from 'next/server'
import { assessDeploymentReadiness } from '@/lib/deployment-readiness'
import { checkDatabaseConnection } from '@/lib/database-health'

export const dynamic = 'force-dynamic'

export async function GET() {
  const readiness = assessDeploymentReadiness()

  try {
    await checkDatabaseConnection()

    return NextResponse.json(
      {
        ...readiness,
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: readiness.ready ? 200 : 503 }
    )
  } catch {
    return NextResponse.json(
      {
        ...readiness,
        ready: false,
        revenueReady: false,
        status: 'degraded',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
        issues: [...readiness.issues, 'database_unavailable'],
      },
      { status: 503 }
    )
  }
}

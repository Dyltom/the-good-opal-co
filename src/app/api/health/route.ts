import { NextResponse } from 'next/server'
import { assessDeploymentReadiness } from '@/lib/deployment-readiness'
import { checkDatabaseConnection } from '@/lib/database-health'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await checkDatabaseConnection()
    const status = assessDeploymentReadiness().ready ? 'healthy' : 'degraded'
    return NextResponse.json({ status }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 })
  }
}

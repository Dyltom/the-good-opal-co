import { NextRequest, NextResponse } from 'next/server'
import { buildMyPostCsv } from '@/lib/mypost-labels'
import { getPayload } from '@/lib/payload'

export async function GET(request: NextRequest) {
  const payload = await getPayload()
  const auth = await payload.auth({ headers: request.headers, canSetHeaders: false })
  if (!auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  }

  const { docs } = await payload.find({
    collection: 'orders',
    where: { status: { equals: 'processing' } },
    sort: 'orderPlacedAt',
    limit: 1000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(buildMyPostCsv(docs), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="australia-post-labels-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

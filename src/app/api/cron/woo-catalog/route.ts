import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import { importProductImages } from '@/scripts/import-wordpress-product-images'
import { syncWooCatalog } from '@/scripts/sync-woocommerce-catalog'

export const maxDuration = 300

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(supplied)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (process.env.WOO_CATALOG_SYNC_ENABLED !== 'true') {
    return NextResponse.json({ error: 'WooCommerce catalogue sync is disabled' }, { status: 409 })
  }

  try {
    const catalog = await syncWooCatalog({
      apply: true,
      archiveMissing: true,
      // A paid local order must never be undone by the legacy storefront.
      restock: false,
    })
    const images = await retrySerializableTransaction(() =>
      importProductImages(true, {
        expectedProductCount: catalog.sourceProducts,
        expectedWooIds: catalog.sourceWooIds,
        publishWooIds: catalog.createdWooIds,
      })
    )
    return NextResponse.json({ catalog, images })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown WooCommerce sync error'
    console.error('WooCommerce recurring catalogue sync failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

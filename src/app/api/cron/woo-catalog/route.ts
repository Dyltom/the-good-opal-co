import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import { persistCanonicalFaceArtifact } from '@/lib/custom-builder/canonical-face-artifact-store'
import { processBuilderMappings } from '@/lib/custom-builder/mapping-processor'
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
    const publishWooIds = catalog.createdWooIds.filter((wooId) =>
      Number.isSafeInteger(catalog.sourceStockByWooId[wooId])
    )
    const images = await retrySerializableTransaction(() =>
      importProductImages(true, {
        expectedProductCount: catalog.sourceProducts,
        expectedWooIds: catalog.sourceWooIds,
        publishWooIds,
        publishStockByWooId: catalog.sourceStockByWooId,
      })
    )
    // The image import can create a new raw-opal listing or mark an approved
    // mapping stale. Analyze that exact post-import state in the same guarded
    // pipeline so no individual stone reaches the builder before review.
    const builderMappings = await processBuilderMappings({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: 25,
    })
    const degradedReasons = [
      ...(catalog.blockedPublicationWooIds.length > 0 ? ['blocked-publications'] : []),
      ...(images.failed > 0 ? ['image-reconciliation-failures'] : []),
      ...(images.missing > 0 ? ['unmatched-gallery-products'] : []),
      ...(images.withoutImages > 0 ? ['missing-product-images'] : []),
      ...(builderMappings.failed > 0 ? ['builder-mapping-failures'] : []),
      ...(builderMappings.coverage.failedCurrent > 0 ? ['builder-coverage-failures'] : []),
    ]
    const degraded = degradedReasons.length > 0
    return NextResponse.json(
      {
        blockedPublicationWooIds: catalog.blockedPublicationWooIds,
        builderMappings,
        catalog,
        degraded,
        degradedReasons,
        images,
      },
      { status: degraded ? 207 : 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown WooCommerce sync error'
    console.error('WooCommerce recurring catalogue sync failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

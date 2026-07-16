import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  importProductImages,
  persistCanonicalFaceArtifact,
  processBuilderMappings,
  syncWooCatalog,
} = vi.hoisted(() => ({
  importProductImages: vi.fn(),
  persistCanonicalFaceArtifact: vi.fn(),
  processBuilderMappings: vi.fn(),
  syncWooCatalog: vi.fn(),
}))

vi.mock('@/scripts/sync-woocommerce-catalog', () => ({ syncWooCatalog }))
vi.mock('@/scripts/import-wordpress-product-images', () => ({ importProductImages }))
vi.mock('@/lib/custom-builder/canonical-face-artifact-store', () => ({
  persistCanonicalFaceArtifact,
}))
vi.mock('@/lib/custom-builder/mapping-processor', () => ({ processBuilderMappings }))

import { GET } from '../route'

function request(secret = 'cron-test-secret') {
  return new NextRequest('https://example.com/api/cron/woo-catalog', {
    headers: { authorization: `Bearer ${secret}` },
  })
}

describe('WooCommerce catalogue cron', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-test-secret')
    vi.stubEnv('WOO_CATALOG_SYNC_ENABLED', 'true')
    syncWooCatalog.mockResolvedValue({
      blockedPublicationWooIds: [],
      createdWooIds: [],
      sourceStockByWooId: { 5000: 3, 5001: 1 },
      sourceProducts: 2,
      sourceWooIds: [5000, 5001],
      stockReconciliation: {
        authenticatedSource: true,
        managedProducts: 2,
        mismatchCount: 1,
        mismatches: [{ localStock: 5, reconciledStock: 3, sourceStock: 3, wooId: 5000 }],
        productsWithExactQuantity: 2,
      },
      updated: 2,
    })
    importProductImages.mockResolvedValue({
      changed: 1,
      failed: 0,
      failures: [],
      missing: 0,
      quarantined: 0,
      withoutImages: 0,
    })
    processBuilderMappings.mockResolvedValue({
      analyzed: 1,
      checked: 1,
      coverage: { failedCurrent: 0 },
      failed: 0,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('requires the Vercel cron bearer secret', async () => {
    const response = await GET(request('wrong-secret'))

    expect(response.status).toBe(401)
    expect(syncWooCatalog).not.toHaveBeenCalled()
  })

  it('stays inert until the guarded identity migration is enabled', async () => {
    vi.stubEnv('WOO_CATALOG_SYNC_ENABLED', 'false')

    const response = await GET(request())

    expect(response.status).toBe(409)
    expect(syncWooCatalog).not.toHaveBeenCalled()
  })

  it('syncs catalogue truth before refreshing ordered product galleries', async () => {
    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(syncWooCatalog).toHaveBeenCalledWith({
      apply: true,
      archiveMissing: true,
      restock: false,
    })
    expect(importProductImages).toHaveBeenCalledWith(true, {
      expectedProductCount: 2,
      expectedWooIds: [5000, 5001],
      publishWooIds: [],
      publishStockByWooId: { 5000: 3, 5001: 1 },
    })
    expect(processBuilderMappings).toHaveBeenCalledWith({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: 25,
    })
    await expect(response.json()).resolves.toEqual({
      blockedPublicationWooIds: [],
      builderMappings: {
        analyzed: 1,
        checked: 1,
        coverage: { failedCurrent: 0 },
        failed: 0,
      },
      catalog: {
        blockedPublicationWooIds: [],
        createdWooIds: [],
        sourceStockByWooId: { 5000: 3, 5001: 1 },
        sourceProducts: 2,
        sourceWooIds: [5000, 5001],
        stockReconciliation: {
          authenticatedSource: true,
          managedProducts: 2,
          mismatchCount: 1,
          mismatches: [{ localStock: 5, reconciledStock: 3, sourceStock: 3, wooId: 5000 }],
          productsWithExactQuantity: 2,
        },
        updated: 2,
      },
      degraded: false,
      degradedReasons: [],
      images: {
        changed: 1,
        failed: 0,
        failures: [],
        missing: 0,
        quarantined: 0,
        withoutImages: 0,
      },
    })
  })

  it('reports a degraded run while still analyzing later successful image mappings', async () => {
    importProductImages.mockResolvedValue({
      changed: 1,
      failed: 1,
      failures: [
        {
          message: 'Source image returned HTTP 404',
          productId: 5000,
          productName: 'Broken opal',
        },
      ],
      missing: 0,
      quarantined: 0,
      withoutImages: 0,
    })

    const response = await GET(request())

    expect(response.status).toBe(207)
    expect(processBuilderMappings).toHaveBeenCalledWith({
      canonicalFaceArtifactSink: persistCanonicalFaceArtifact,
      limit: 25,
    })
    await expect(response.json()).resolves.toMatchObject({
      degraded: true,
      degradedReasons: ['image-reconciliation-failures'],
      images: {
        failed: 1,
        failures: [{ productId: 5000 }],
      },
    })
  })

  it('imports a new gallery as draft and reports blocked publication without Woo auth', async () => {
    syncWooCatalog.mockResolvedValue({
      blockedPublicationWooIds: [5002],
      createdWooIds: [5002],
      sourceStockByWooId: {},
      sourceProducts: 1,
      sourceWooIds: [5002],
      stockReconciliation: {
        authenticatedSource: false,
        managedProducts: 0,
        mismatchCount: 0,
        mismatches: [],
        productsWithExactQuantity: 0,
        productsWithoutExactQuantity: [],
      },
      updated: 0,
    })

    const response = await GET(request())

    expect(response.status).toBe(207)
    expect(importProductImages).toHaveBeenCalledWith(true, {
      expectedProductCount: 1,
      expectedWooIds: [5002],
      publishWooIds: [],
      publishStockByWooId: {},
    })
    await expect(response.json()).resolves.toMatchObject({
      blockedPublicationWooIds: [5002],
      degraded: true,
      degradedReasons: ['blocked-publications'],
    })
  })

  it('reports missing galleries and builder mapping coverage failures', async () => {
    importProductImages.mockResolvedValue({
      changed: 1,
      failed: 0,
      failures: [],
      missing: 1,
      quarantined: 1,
      withoutImages: 1,
    })
    processBuilderMappings.mockResolvedValue({
      analyzed: 1,
      checked: 2,
      coverage: { failedCurrent: 1 },
      failed: 1,
    })

    const response = await GET(request())

    expect(response.status).toBe(207)
    await expect(response.json()).resolves.toMatchObject({
      degraded: true,
      degradedReasons: [
        'unmatched-gallery-products',
        'missing-product-images',
        'builder-mapping-failures',
        'builder-coverage-failures',
      ],
    })
  })

  it('does not refresh images after catalogue reconciliation fails', async () => {
    syncWooCatalog.mockRejectedValue(new Error('identity migration required'))

    const response = await GET(request())

    expect(response.status).toBe(500)
    expect(importProductImages).not.toHaveBeenCalled()
    expect(processBuilderMappings).not.toHaveBeenCalled()
  })

  it('does not analyze builder mappings before image reconciliation succeeds', async () => {
    importProductImages.mockRejectedValue(new Error('image import failed'))

    const response = await GET(request())

    expect(response.status).toBe(500)
    expect(processBuilderMappings).not.toHaveBeenCalled()
  })

  it('retries image reconciliation after a Postgres serialization conflict', async () => {
    importProductImages
      .mockRejectedValueOnce({ code: '40001' })
      .mockResolvedValueOnce({
        changed: 1,
        failed: 0,
        failures: [],
        missing: 0,
        quarantined: 0,
        withoutImages: 0,
      })

    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(importProductImages).toHaveBeenCalledTimes(2)
  })
})

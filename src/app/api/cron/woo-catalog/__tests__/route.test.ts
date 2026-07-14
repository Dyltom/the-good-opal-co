import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { importProductImages, processBuilderMappings, syncWooCatalog } = vi.hoisted(() => ({
  importProductImages: vi.fn(),
  processBuilderMappings: vi.fn(),
  syncWooCatalog: vi.fn(),
}))

vi.mock('@/scripts/sync-woocommerce-catalog', () => ({ syncWooCatalog }))
vi.mock('@/scripts/import-wordpress-product-images', () => ({ importProductImages }))
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
      createdWooIds: [],
      sourceStockByWooId: { 5000: 3, 5001: 1 },
      sourceProducts: 2,
      sourceWooIds: [5000, 5001],
      updated: 2,
    })
    importProductImages.mockResolvedValue({ changed: 1 })
    processBuilderMappings.mockResolvedValue({ analyzed: 1, checked: 1 })
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
    expect(processBuilderMappings).toHaveBeenCalledWith({ limit: 25 })
    await expect(response.json()).resolves.toEqual({
      builderMappings: { analyzed: 1, checked: 1 },
      catalog: {
        createdWooIds: [],
        sourceStockByWooId: { 5000: 3, 5001: 1 },
        sourceProducts: 2,
        sourceWooIds: [5000, 5001],
        updated: 2,
      },
      images: { changed: 1 },
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
      .mockResolvedValueOnce({ changed: 1 })

    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(importProductImages).toHaveBeenCalledTimes(2)
  })
})

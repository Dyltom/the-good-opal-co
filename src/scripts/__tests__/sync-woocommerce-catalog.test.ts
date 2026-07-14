import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  fetchWooCatalog: vi.fn(),
  find: vi.fn(),
  getPayload: vi.fn(),
  logger: { info: vi.fn() },
  update: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@/lib/woocommerce/catalog-sync', () => ({
  fetchWooCatalog: mocks.fetchWooCatalog,
  reconciledStock: (stock: number | null | undefined, inStock: boolean, restock: boolean) =>
    !inStock ? 0 : restock ? 1 : Math.max(0, stock ?? 0),
}))

import { syncWooCatalog } from '../sync-woocommerce-catalog'

describe('WooCommerce catalogue mutation retries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPayload.mockResolvedValue({
      create: mocks.create,
      find: mocks.find,
      logger: mocks.logger,
      update: mocks.update,
    })
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          legacyWooId: 5681,
          name: 'Existing opal',
          price: 95,
          sku: 'WP-5681',
          slug: 'existing-opal',
          stock: 1,
        },
      ],
      hasNextPage: false,
    })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Exact product copy',
        inStock: true,
        name: 'Existing opal',
        price: 95,
        sku: 'WP-5681',
        slug: 'existing-opal',
        tags: ['opal'],
        wooId: 5681,
      },
    ])
  })

  test('retries one product mutation after a Postgres serialization conflict', async () => {
    mocks.update.mockRejectedValueOnce({ code: '40001' }).mockResolvedValueOnce({ id: 42 })

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: false, restock: false })
    ).resolves.toMatchObject({ created: 0, updated: 1 })

    expect(mocks.update).toHaveBeenCalledTimes(2)
    expect(mocks.create).not.toHaveBeenCalled()
  })
})

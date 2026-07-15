import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

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
  reconciledStock: (
    stock: number | null | undefined,
    inStock: boolean,
    restock: boolean,
    sourceQuantity?: number | null
  ) =>
    !inStock
      ? 0
      : sourceQuantity !== undefined && sourceQuantity !== null
        ? restock
          ? sourceQuantity
          : Math.min(Math.max(0, stock ?? 0), sourceQuantity)
        : restock
          ? 1
          : Math.max(0, stock ?? 0),
}))

import { syncWooCatalog } from '../sync-woocommerce-catalog'

describe('WooCommerce catalogue mutation retries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('WOO_CONSUMER_KEY', '')
    vi.stubEnv('WOO_CONSUMER_SECRET', '')
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

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('reports public fallback without claiming exact quantity coverage', async () => {
    await expect(
      syncWooCatalog({ apply: false, archiveMissing: false, restock: false })
    ).resolves.toMatchObject({
      sourceStockByWooId: {},
      stockReconciliation: {
        authenticatedSource: false,
        managedProducts: 1,
        mismatchCount: 0,
        mismatches: [],
        productsWithExactQuantity: 0,
        productsWithoutExactQuantity: [{ slug: 'existing-opal', wooId: 5681 }],
      },
    })

    expect(mocks.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('stock source public fallback, exact quantities 0/1')
    )
    expect(mocks.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('missing exact quantities 1 (5681:existing-opal)')
    )
  })

  test('retries one product mutation after a Postgres serialization conflict', async () => {
    mocks.update.mockRejectedValueOnce({ code: '40001' }).mockResolvedValueOnce({ id: 42 })

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: false, restock: false })
    ).resolves.toMatchObject({ created: 0, updated: 1 })

    expect(mocks.update).toHaveBeenCalledTimes(2)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  test('writes exact authenticated Woo stock quantity for an imaged product', async () => {
    vi.stubEnv('WOO_CONSUMER_KEY', 'ck_read_only')
    vi.stubEnv('WOO_CONSUMER_SECRET', 'cs_private')
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          images: [{ image: 211 }],
          legacyWooId: 5681,
          name: 'Existing opal',
          price: 95,
          sku: 'WP-5681',
          slug: 'existing-opal',
          stock: 5,
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
        manageStock: true,
        name: 'Existing opal',
        price: 95,
        sku: 'WP-5681',
        slug: 'existing-opal',
        stockQuantity: 3,
        tags: ['opal'],
        wooId: 5681,
      },
    ])
    mocks.update.mockResolvedValue({ id: 42 })

    const result = await syncWooCatalog({ apply: true, archiveMissing: false, restock: false })

    expect(mocks.fetchWooCatalog).toHaveBeenCalledWith({
      baseUrl: undefined,
      consumerKey: 'ck_read_only',
      consumerSecret: 'cs_private',
    })
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stock: 3, wooManageStock: true }),
      })
    )
    expect(result.stockReconciliation).toEqual({
      authenticatedSource: true,
      managedProducts: 1,
      mismatchCount: 1,
      mismatches: [{ localStock: 5, reconciledStock: 3, sourceStock: 3, wooId: 5681 }],
      productsWithExactQuantity: 1,
      productsWithoutExactQuantity: [],
    })
    const log = String(mocks.logger.info.mock.calls.at(-1)?.[0])
    expect(log).toContain('stock source authenticated, exact quantities 1/1')
    expect(log).toContain('missing exact quantities 0 (none)')
    expect(log).toContain('local/source mismatches 1 (5681:5->3=>3)')
    expect(log).not.toContain('ck_read_only')
    expect(log).not.toContain('cs_private')
  })

  test('does not resurrect locally sold inventory from a higher Woo quantity', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          images: [{ image: 211 }],
          legacyWooId: 5681,
          name: 'Sold opal',
          price: 95,
          sku: 'WP-5681',
          slug: 'sold-opal',
          stock: 0,
        },
      ],
      hasNextPage: false,
    })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'One-off opal sold locally',
        inStock: true,
        name: 'Sold opal',
        price: 95,
        sku: 'WP-5681',
        slug: 'sold-opal',
        stockQuantity: 1,
        tags: ['opal'],
        wooId: 5681,
      },
    ])
    mocks.update.mockResolvedValue({ id: 42 })

    await syncWooCatalog({ apply: true, archiveMissing: false, restock: false })

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stock: 0 }) })
    )
  })

  test('refuses an empty source snapshot before mutating managed products', async () => {
    mocks.fetchWooCatalog.mockResolvedValue([])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).rejects.toThrow('empty WooCommerce catalogue snapshot')

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test('refuses a severe managed-product drop before any stock or archive mutation', async () => {
    mocks.find.mockResolvedValue({
      docs: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        legacyWooId: 5_000 + index,
        sku: `WP-${5_000 + index}`,
        slug: `opal-${index}`,
        stock: 1,
      })),
      hasNextPage: false,
    })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Only one product unexpectedly returned',
        inStock: false,
        name: 'Opal 0',
        price: 95,
        sku: 'WP-5000',
        slug: 'opal-0',
        tags: [],
        wooId: 5_000,
      },
    ])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).rejects.toThrow('severe WooCommerce catalogue drop')

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test('stages a new product at draft with zero stock until its gallery succeeds', async () => {
    vi.stubEnv('WOO_CONSUMER_KEY', 'ck_read_only')
    vi.stubEnv('WOO_CONSUMER_SECRET', 'cs_private')
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 91 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Exact product copy',
        inStock: true,
        name: 'New opal parcel',
        price: 95,
        sku: 'WP-5681',
        slug: 'new-opal-parcel',
        stockQuantity: 7,
        tags: ['opal'],
        wooId: 5681,
      },
    ])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).resolves.toMatchObject({
      created: 1,
      createdWooIds: [5681],
      sourceStockByWooId: { 5681: 7 },
    })

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          material: 'none',
          status: 'draft',
          stock: 0,
        }),
      })
    )
  })

  test('persists builder facts inferred from a new individual opal name', async () => {
    vi.stubEnv('WOO_CONSUMER_KEY', 'ck_read_only')
    vi.stubEnv('WOO_CONSUMER_SECRET', 'cs_private')
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 93 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'New individual stone',
        inStock: true,
        name: 'Lightning Ridge Black Opal 1.25 ct',
        price: 180,
        sku: 'WP-5683',
        slug: 'lightning-ridge-black-opal-1-25-ct',
        stockQuantity: 1,
        tags: ['opal'],
        wooId: 5683,
      },
    ])

    await syncWooCatalog({ apply: true, archiveMissing: true, restock: false })

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          material: 'none',
          stoneOrigin: 'lightning-ridge',
          stoneType: 'black-opal',
          weight: 1.25,
          weightUnit: 'carats',
        }),
      })
    )
  })

  test('does not persist the unsupported unknown-opal inference sentinel', async () => {
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 94 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Natural Australian opal with type awaiting review',
        inStock: true,
        name: 'Australian Opal 1.10 ct',
        price: 160,
        sku: 'WP-5688',
        slug: 'australian-opal-1-10-ct',
        tags: ['opal'],
        wooId: 5688,
      },
    ])

    await syncWooCatalog({ apply: true, archiveMissing: false, restock: false })

    const createData = mocks.create.mock.calls[0]?.[0]?.data
    expect(createData).not.toHaveProperty('stoneType')
    expect(createData).toMatchObject({ material: 'none', status: 'draft', stock: 0 })
  })

  test('publishes authenticated status-managed stock and persists its Woo mode', async () => {
    vi.stubEnv('WOO_CONSUMER_KEY', 'ck_read_only')
    vi.stubEnv('WOO_CONSUMER_SECRET', 'cs_private')
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 92 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'One-off opal with Woo stock status management',
        inStock: true,
        manageStock: false,
        name: 'New status-managed opal',
        price: 125,
        sku: 'WP-5682',
        slug: 'new-status-managed-opal',
        stockQuantity: 1,
        tags: ['opal'],
        wooId: 5682,
      },
    ])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).resolves.toMatchObject({
      created: 1,
      createdWooIds: [5682],
      sourceStockByWooId: { 5682: 1 },
    })

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ wooManageStock: false }),
      })
    )
  })

  test('uses authenticated status-derived stock for every non-managed Woo listing', async () => {
    vi.stubEnv('WOO_CONSUMER_KEY', 'ck_read_only')
    vi.stubEnv('WOO_CONSUMER_SECRET', 'cs_private')
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 94 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Multiple stones, priced as a parcel',
        inStock: true,
        manageStock: false,
        name: 'Coober Pedy opal parcel',
        price: 125,
        sku: 'WP-5684',
        slug: 'coober-pedy-opal-parcel',
        stockQuantity: 1,
        tags: ['opal'],
        wooId: 5684,
      },
      {
        category: 'opal-rings',
        compareAtPrice: null,
        description: 'Made-to-order ring',
        inStock: true,
        manageStock: false,
        name: 'Made-to-order Aurora ring',
        price: 425,
        sku: 'WP-5685',
        slug: 'made-to-order-aurora-ring',
        stockQuantity: 1,
        tags: ['ring'],
        wooId: 5685,
      },
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Legacy uncategorized voucher',
        inStock: true,
        manageStock: false,
        name: 'Gift Voucher',
        price: 100,
        sku: 'WP-5686',
        slug: 'gift-voucher',
        stockQuantity: 1,
        tags: ['gift'],
        wooId: 5686,
      },
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Legacy uncategorized education product',
        inStock: false,
        manageStock: false,
        name: 'Opal Workshop',
        price: 180,
        sku: 'WP-5687',
        slug: 'opal-workshop',
        stockQuantity: 0,
        tags: ['course'],
        wooId: 5687,
      },
    ])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).resolves.toMatchObject({
      created: 4,
      sourceStockByWooId: { 5684: 1, 5685: 1, 5686: 1, 5687: 0 },
    })
  })

  test('does not expose synthetic public availability as exact publish stock', async () => {
    mocks.find.mockResolvedValue({ docs: [], hasNextPage: false })
    mocks.create.mockResolvedValue({ id: 91 })
    mocks.fetchWooCatalog.mockResolvedValue([
      {
        category: 'raw-opals',
        compareAtPrice: null,
        description: 'Exact product copy',
        inStock: true,
        name: 'New opal parcel',
        price: 95,
        sku: 'WP-5681',
        slug: 'new-opal-parcel',
        tags: ['opal'],
        wooId: 5681,
      },
    ])

    await expect(
      syncWooCatalog({ apply: true, archiveMissing: true, restock: false })
    ).resolves.toMatchObject({
      created: 1,
      createdWooIds: [5681],
      sourceStockByWooId: {},
    })
  })
})

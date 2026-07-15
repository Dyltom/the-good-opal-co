import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from '@/lib/payload'
import { downloadWordPressMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'
import { importProductImages } from '../import-wordpress-product-images'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))
vi.mock('@/lib/wordpress/content-import', () => ({ downloadWordPressMedia: vi.fn() }))
vi.mock('@/lib/wordpress/product-images', () => ({ fetchWordPressProductImages: vi.fn() }))

describe('WordPress product image script', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('recovers a media row committed before a post-create hook error', async () => {
    let mediaLookup = 0
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'products') {
        return { docs: [{ id: 44, images: [] }] }
      }
      mediaLookup += 1
      return {
        docs:
          mediaLookup === 3
            ? [
                {
                  id: 211,
                  legacyWordPressId: 5350,
                  legacySourceUrl:
                    'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg',
                },
              ]
            : [],
      }
    })
    const create = vi.fn().mockRejectedValue(new Error('The following field is invalid'))
    const update = vi.fn().mockResolvedValue({ id: 44 })
    const payload = { create, find, logger: { info: vi.fn() }, update }

    vi.mocked(getPayload).mockResolvedValue(payload as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Mintabie opal parcel',
        media: [
          {
            id: 5350,
            alt: 'Mintabie opal parcel',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg',
            title: 'Opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal.jpg',
      data: Buffer.from([1]),
      mimetype: 'image/jpeg',
      size: 1,
    })

    await expect(importProductImages(true)).resolves.toMatchObject({ changed: 1 })
    expect(create).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { images: [{ image: 211 }] }, id: 44 })
    )
  })

  it('clears a removed source gallery and quarantines the product', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 44,
          images: [
            {
              image: {
                id: 211,
                legacyWordPressId: 5350,
                legacySourceUrl:
                  'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg',
              },
            },
          ],
          status: 'published',
          stock: 1,
        },
      ],
    })
    const update = vi.fn().mockResolvedValue({ id: 44 })
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: false,
        productId: 4481,
        productName: 'Removed gallery',
        media: [],
      },
    ])

    await expect(importProductImages(true)).resolves.toMatchObject({
      changed: 1,
      quarantined: 1,
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [], status: 'draft', stock: 0 },
        id: 44,
      })
    )
  })

  it('refuses an incomplete gallery snapshot before clearing or publishing products', async () => {
    const update = vi.fn()
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find: vi.fn(),
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([])

    await expect(
      importProductImages(true, { expectedProductCount: 53 })
    ).rejects.toThrow('incomplete WordPress gallery snapshot')
    expect(update).not.toHaveBeenCalled()
  })

  it('refuses a same-size gallery snapshot with different product identities', async () => {
    const update = vi.fn()
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find: vi.fn(),
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      { inStock: true, media: [], productId: 5001, productName: 'Unexpected opal' },
    ])

    await expect(
      importProductImages(true, { expectedProductCount: 1, expectedWooIds: [5000] })
    ).rejects.toThrow('mismatched WordPress gallery snapshot product identities')
    expect(update).not.toHaveBeenCalled()
  })

  it('refreshes owned media when an attachment keeps its ID but changes source URL', async () => {
    const oldUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg'
    const newUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal-new.jpg'
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [
              {
                id: 44,
                images: [
                  {
                    image: {
                      id: 211,
                      legacyWordPressId: 5350,
                      legacySourceUrl: oldUrl,
                    },
                  },
                ],
                status: 'published',
                stock: 1,
              },
            ]
          : [
              {
                id: 211,
                legacyWordPressId: 5350,
                legacySourceUrl: oldUrl,
              },
            ],
    }))
    const update = vi.fn(async ({ collection }: { collection: string }) => ({
      id: collection === 'media' ? 211 : 44,
    }))
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Changed opal',
        media: [
          {
            id: 5350,
            alt: 'Changed opal',
            mimeType: 'image/jpeg',
            sourceUrl: newUrl,
            title: 'Changed opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal-new.jpg',
      data: Buffer.from([2]),
      mimetype: 'image/jpeg',
      size: 1,
    })

    await expect(importProductImages(true)).resolves.toMatchObject({ changed: 1 })
    expect(downloadWordPressMedia).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        data: expect.objectContaining({ legacySourceUrl: newUrl, legacyWordPressId: 5350 }),
        file: expect.objectContaining({ name: 'wp-5350-opal-new.jpg' }),
        id: 211,
      })
    )
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('reconciles attachment order even when the media records are unchanged', async () => {
    const firstUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/first.jpg'
    const secondUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/second.jpg'
    let mediaLookup = 0
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'products') {
        return {
          docs: [
            {
              id: 44,
              images: [
                {
                  image: {
                    id: 211,
                    alt: 'First',
                    caption: 'First',
                    legacyWordPressId: 5350,
                    legacySourceUrl: firstUrl,
                    tenantId: 'good-opal-co',
                    url: '/api/media/file/first.jpg',
                  },
                },
                {
                  image: {
                    id: 212,
                    alt: 'Second',
                    caption: 'Second',
                    legacyWordPressId: 5351,
                    legacySourceUrl: secondUrl,
                    tenantId: 'good-opal-co',
                    url: '/api/media/file/second.jpg',
                  },
                },
              ],
              status: 'published',
              stock: 1,
            },
          ],
        }
      }
      mediaLookup += 1
      return {
        docs: [
          mediaLookup === 1
            ? {
                id: 212,
                alt: 'Second',
                caption: 'Second',
                legacyWordPressId: 5351,
                legacySourceUrl: secondUrl,
                tenantId: 'good-opal-co',
                url: '/api/media/file/second.jpg',
              }
            : {
                id: 211,
                alt: 'First',
                caption: 'First',
                legacyWordPressId: 5350,
                legacySourceUrl: firstUrl,
                tenantId: 'good-opal-co',
                url: '/api/media/file/first.jpg',
              },
        ],
      }
    })
    const update = vi.fn().mockResolvedValue({ id: 44 })
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Reordered opal',
        media: [
          {
            id: 5351,
            alt: 'Second',
            mimeType: 'image/jpeg',
            sourceUrl: secondUrl,
            title: 'Second',
          },
          {
            id: 5350,
            alt: 'First',
            mimeType: 'image/jpeg',
            sourceUrl: firstUrl,
            title: 'First',
          },
        ],
      },
    ])
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example.com')
    vi.mocked(downloadWordPressMedia).mockImplementation(async (media) => ({
      name: `wp-${media.id}.jpg`,
      data: Buffer.from([media.id === 5350 ? 1 : 2]),
      mimetype: 'image/jpeg',
      size: 1,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: URL | RequestInfo) =>
        new Response(Buffer.from([String(input).includes('first.jpg') ? 1 : 2]), {
          headers: { 'content-type': 'image/jpeg' },
        })
      )
    )

    await importProductImages(true)

    expect(downloadWordPressMedia).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 212 }, { image: 211 }] },
        id: 44,
      })
    )
  })

  it('refreshes owned bytes when attachment ID and source URL stay unchanged', async () => {
    const sourceUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg'
    const media = {
      id: 211,
      alt: 'Opal',
      caption: 'Opal',
      legacyWordPressId: 5350,
      legacySourceUrl: sourceUrl,
      tenantId: 'good-opal-co',
      url: '/api/media/file/opal.jpg',
    }
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [{ id: 44, images: [{ image: media }], status: 'published', stock: 1 }]
          : [media],
    }))
    const update = vi.fn(async ({ collection }: { collection: string }) => ({
      id: collection === 'media' ? 211 : 44,
    }))
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Opal',
        media: [
          {
            id: 5350,
            alt: 'Opal',
            mimeType: 'image/jpeg',
            sourceUrl,
            title: 'Opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal.jpg',
      data: Buffer.from([2]),
      mimetype: 'image/jpeg',
      size: 1,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example.com')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(Buffer.from([1]))))

    await expect(importProductImages(true)).resolves.toMatchObject({ changed: 1 })

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        file: expect.objectContaining({ data: Buffer.from([2]) }),
        id: 211,
      })
    )
  })

  it('requeues a reviewed raw-opal mapping when selected source bytes change', async () => {
    const sourceUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg'
    const oldBytes = Buffer.from([1])
    const newBytes = Buffer.from([2])
    const media = {
      id: 211,
      alt: 'Opal',
      caption: 'Opal',
      legacyWordPressId: 5350,
      legacySourceUrl: sourceUrl,
      tenantId: 'good-opal-co',
      url: '/api/media/file/opal.jpg',
    }
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [
              {
                id: 44,
                builderEligible: true,
                builderMappedImageIndex: 0,
                builderMappingAnalyzedImageHash: createHash('sha256')
                  .update(oldBytes)
                  .digest('hex'),
                builderMappingStatus: 'reviewed',
                category: 'raw-opals',
                images: [{ image: media }],
                status: 'published',
                stock: 1,
              },
            ]
          : [media],
    }))
    const update = vi.fn(async ({ collection }: { collection: string }) => ({
      id: collection === 'media' ? 211 : 44,
    }))
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Opal',
        media: [
          {
            id: 5350,
            alt: 'Opal',
            mimeType: 'image/jpeg',
            sourceUrl,
            title: 'Opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal.jpg',
      data: newBytes,
      mimetype: 'image/jpeg',
      size: 1,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example.com')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(oldBytes)))

    await expect(importProductImages(true)).resolves.toMatchObject({
      changed: 1,
      mappingRequeued: 1,
    })

    expect(update).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'products',
        data: expect.objectContaining({
          builderContourCandidate: null,
          builderEligible: false,
          builderMappingAnalyzedImageHash: null,
          builderMappingAnalysisError: null,
          builderMappingStatus: 'stale',
          builderPhotoAnalysisVersion: null,
        }),
        id: 44,
      })
    )
  })

  it('does not re-upload owned media when source and owned byte hashes match', async () => {
    const sourceUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg'
    const media = {
      id: 211,
      alt: 'Opal',
      caption: 'Opal',
      legacyWordPressId: 5350,
      legacySourceUrl: sourceUrl,
      tenantId: 'good-opal-co',
      url: '/api/media/file/opal.jpg',
    }
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [
              {
                id: 44,
                builderMappingAnalyzedImageHash: createHash('sha256')
                  .update(Buffer.from([7, 8, 9]))
                  .digest('hex'),
                category: 'raw-opals',
                images: [{ image: media }],
                status: 'published',
                stock: 1,
              },
            ]
          : [media],
    }))
    const update = vi.fn()
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Opal',
        media: [
          {
            id: 5350,
            alt: 'Opal',
            mimeType: 'image/jpeg',
            sourceUrl,
            title: 'Opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal.jpg',
      data: Buffer.from([7, 8, 9]),
      mimetype: 'image/jpeg',
      size: 3,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example.com')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(Buffer.from([7, 8, 9]))))

    await expect(importProductImages(true)).resolves.toMatchObject({ changed: 0 })

    expect(downloadWordPressMedia).toHaveBeenCalledTimes(1)
    expect(update).not.toHaveBeenCalled()
  })

  it('updates source metadata without re-uploading unchanged bytes', async () => {
    const sourceUrl = 'https://goodopalco.com/wp-content/uploads/2021/09/opal.jpg'
    const media = {
      id: 211,
      alt: 'Old alt',
      caption: 'Old title',
      legacyWordPressId: 5350,
      legacySourceUrl: sourceUrl,
      tenantId: 'good-opal-co',
      url: '/api/media/file/opal.jpg',
    }
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [{ id: 44, images: [{ image: media }], status: 'published', stock: 1 }]
          : [media],
    }))
    const update = vi.fn().mockResolvedValue({ id: 211 })
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Opal',
        media: [
          {
            id: 5350,
            alt: 'New alt',
            mimeType: 'image/jpeg',
            sourceUrl,
            title: 'New title',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-opal.jpg',
      data: Buffer.from([7, 8, 9]),
      mimetype: 'image/jpeg',
      size: 3,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example.com')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(Buffer.from([7, 8, 9]))))

    await importProductImages(true)

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        data: expect.objectContaining({ alt: 'New alt', caption: 'New title' }),
        id: 211,
      })
    )
    expect(update.mock.calls[0]?.[0]).not.toHaveProperty('file')
  })

  it('publishes a staged product only after its owned gallery succeeds', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [{ id: 44, images: [], status: 'draft', stock: 0 }]
          : [],
    }))
    const create = vi.fn().mockResolvedValue({ id: 211 })
    const update = vi.fn().mockResolvedValue({ id: 44 })
    vi.mocked(getPayload).mockResolvedValue({
      create,
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'New opal',
        media: [
          {
            id: 5350,
            alt: 'New opal',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2021/09/new-opal.jpg',
            title: 'New opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-new-opal.jpg',
      data: Buffer.from([3]),
      mimetype: 'image/jpeg',
      size: 1,
    })

    await expect(
      importProductImages(true, {
        publishWooIds: [4481],
        publishStockByWooId: { 4481: 7 },
      })
    ).resolves.toMatchObject({ published: 1 })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 211 }], status: 'published', stock: 7 },
        id: 44,
      })
    )
  })

  it('does not publish staged stock from the unauthenticated gallery availability flag', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [{ id: 44, images: [], status: 'draft', stock: 0 }]
          : [],
    }))
    const create = vi.fn().mockResolvedValue({ id: 211 })
    const update = vi.fn().mockResolvedValue({ id: 44 })
    vi.mocked(getPayload).mockResolvedValue({
      create,
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'New opal',
        media: [
          {
            id: 5350,
            alt: 'New opal',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2021/09/new-opal.jpg',
            title: 'New opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-new-opal.jpg',
      data: Buffer.from([3]),
      mimetype: 'image/jpeg',
      size: 1,
    })

    await expect(importProductImages(true)).resolves.toMatchObject({ published: 0 })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 211 }] },
        id: 44,
      })
    )
  })

  it('recovers a staged product using exact authenticated stock on a later cron run', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'products'
          ? [{ id: 44, images: [], status: 'draft', stock: 0 }]
          : [],
    }))
    const create = vi.fn().mockResolvedValue({ id: 211 })
    const update = vi.fn().mockResolvedValue({ id: 44 })
    vi.mocked(getPayload).mockResolvedValue({
      create,
      find,
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'New opal',
        media: [
          {
            id: 5350,
            alt: 'New opal',
            mimeType: 'image/jpeg',
            sourceUrl: 'https://goodopalco.com/wp-content/uploads/2021/09/new-opal.jpg',
            title: 'New opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockResolvedValue({
      name: 'wp-5350-new-opal.jpg',
      data: Buffer.from([3]),
      mimetype: 'image/jpeg',
      size: 1,
    })

    await expect(
      importProductImages(true, { publishStockByWooId: { 4481: 7 } })
    ).resolves.toMatchObject({ published: 1 })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 211 }], status: 'published', stock: 7 },
        id: 44,
      })
    )
  })

  it('isolates one broken gallery, preserves its existing product, and continues later products', async () => {
    const firstSourceUrl =
      'https://goodopalco.com/wp-content/uploads/2021/09/broken-opal.jpg'
    const secondSourceUrl =
      'https://goodopalco.com/wp-content/uploads/2021/09/healthy-opal.jpg'
    const find = vi.fn(
      async ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => {
        if (collection === 'media') return { docs: [] }
        const wooId = (
          where as { legacyWooId?: { equals?: number } } | undefined
        )?.legacyWooId?.equals
        return {
          docs:
            wooId === 4481
              ? [
                  {
                    id: 44,
                    images: [
                      {
                        image: {
                          id: 210,
                          legacyWordPressId: 5349,
                          legacySourceUrl:
                            'https://goodopalco.com/wp-content/uploads/2021/09/verified-opal.jpg',
                        },
                      },
                    ],
                    status: 'published',
                    stock: 1,
                  },
                ]
              : [{ id: 45, images: [], status: 'draft', stock: 0 }],
        }
      }
    )
    const create = vi.fn().mockResolvedValue({ id: 212 })
    const update = vi.fn().mockResolvedValue({ id: 45 })
    const logger = { error: vi.fn(), info: vi.fn() }
    vi.mocked(getPayload).mockResolvedValue({ create, find, logger, update } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'Broken existing opal',
        media: [
          {
            id: 5350,
            alt: 'Broken existing opal',
            mimeType: 'image/jpeg',
            sourceUrl: firstSourceUrl,
            title: 'Broken existing opal',
          },
        ],
      },
      {
        inStock: true,
        productId: 4482,
        productName: 'Healthy new opal',
        media: [
          {
            id: 5351,
            alt: 'Healthy new opal',
            mimeType: 'image/jpeg',
            sourceUrl: secondSourceUrl,
            title: 'Healthy new opal',
          },
        ],
      },
    ])
    vi.mocked(downloadWordPressMedia).mockImplementation(async (media) => {
      if (media.id === 5350) throw new Error('Source image returned HTTP 404')
      return {
        name: 'wp-5351-healthy-opal.jpg',
        data: Buffer.from([4]),
        mimetype: 'image/jpeg',
        size: 1,
      }
    })

    await expect(
      importProductImages(true, {
        publishWooIds: [4481, 4482],
        publishStockByWooId: { 4481: 1, 4482: 6 },
      })
    ).resolves.toMatchObject({
      changed: 1,
      failed: 1,
      failures: [
        {
          message: 'Source image returned HTTP 404',
          productId: 4481,
          productName: 'Broken existing opal',
        },
      ],
      published: 1,
    })
    expect(update).not.toHaveBeenCalledWith(expect.objectContaining({ id: 44 }))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 212 }], status: 'published', stock: 6 },
        id: 45,
      })
    )
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'WordPress product gallery reconciliation failed; continuing later products',
        productId: 4481,
      })
    )
  })

  it('refuses an explicit publish without exact authenticated stock', async () => {
    const update = vi.fn()
    vi.mocked(getPayload).mockResolvedValue({
      create: vi.fn(),
      find: vi.fn(),
      logger: { info: vi.fn() },
      update,
    } as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
        inStock: true,
        productId: 4481,
        productName: 'New opal',
        media: [],
      },
    ])

    await expect(
      importProductImages(true, { publishWooIds: [4481] })
    ).rejects.toThrow('without exact authenticated stock')
    expect(update).not.toHaveBeenCalled()
  })
})

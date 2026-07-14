import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from '@/lib/payload'
import { downloadWordPressMedia } from '@/lib/wordpress/content-import'
import { fetchWordPressProductImages } from '@/lib/wordpress/product-images'
import { importProductImages } from '../import-wordpress-product-images'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))
vi.mock('@/lib/wordpress/content-import', () => ({ downloadWordPressMedia: vi.fn() }))
vi.mock('@/lib/wordpress/product-images', () => ({ fetchWordPressProductImages: vi.fn() }))

describe('WordPress product image script', () => {
  beforeEach(() => vi.clearAllMocks())

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
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 211 }] },
        id: 44,
      })
    )
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
                  image: { id: 211, legacyWordPressId: 5350, legacySourceUrl: firstUrl },
                },
                {
                  image: { id: 212, legacyWordPressId: 5351, legacySourceUrl: secondUrl },
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
            ? { id: 212, legacyWordPressId: 5351, legacySourceUrl: secondUrl }
            : { id: 211, legacyWordPressId: 5350, legacySourceUrl: firstUrl },
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

    await importProductImages(true)

    expect(downloadWordPressMedia).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 212 }, { image: 211 }] },
        id: 44,
      })
    )
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
      importProductImages(true, { publishWooIds: [4481] })
    ).resolves.toMatchObject({ published: 1 })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        data: { images: [{ image: 211 }], status: 'published', stock: 1 },
        id: 44,
      })
    )
  })
})

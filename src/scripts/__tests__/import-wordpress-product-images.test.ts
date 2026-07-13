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
      return { docs: mediaLookup === 3 ? [{ id: 211 }] : [] }
    })
    const create = vi.fn().mockRejectedValue(new Error('The following field is invalid'))
    const update = vi.fn().mockResolvedValue({ id: 44 })
    const payload = { create, find, logger: { info: vi.fn() }, update }

    vi.mocked(getPayload).mockResolvedValue(payload as never)
    vi.mocked(fetchWordPressProductImages).mockResolvedValue([
      {
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
})

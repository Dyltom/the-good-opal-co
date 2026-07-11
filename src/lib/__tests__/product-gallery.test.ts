import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  legacyGalleryAssetPaths,
  legacyGalleryImageCount,
  mergeProductGallery,
} from '@/lib/product-gallery'

describe('legacy product gallery completion', () => {
  test('preserves all 29 current Woo secondary images', () => {
    expect(legacyGalleryImageCount()).toBe(29)
  })

  test('adds missing images and does not duplicate images later imported into CMS', () => {
    const gallery = mergeProductGallery('coral-ring-2', 'Coral Ring 2', [
      { url: '/api/media/file/20210819_102402-1.jpg', alt: 'CMS image' },
    ])

    expect(gallery).toEqual([
      { url: '/api/media/file/20210819_102402-1.jpg', alt: 'CMS image' },
      { url: '/images/products/20210819_101705.jpg', alt: 'Coral Ring 2 additional view' },
    ])
  })

  test('all fallback assets are deployed from the public product directory', () => {
    for (const image of legacyGalleryAssetPaths()) {
      expect(existsSync(resolve(process.cwd(), 'public', image.replace(/^\//, '')))).toBe(true)
    }
  })
})

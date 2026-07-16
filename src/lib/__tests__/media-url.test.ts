import { describe, expect, test } from 'vitest'
import { resolveMediaUrl } from '../media-url'

describe('resolveMediaUrl', () => {
  test('turns stale localhost media origins into same-origin URLs', () => {
    expect(resolveMediaUrl('http://localhost:3000/api/media/file/opal.jpg')).toBe(
      '/api/media/file/opal.jpg'
    )
    expect(resolveMediaUrl('http://127.0.0.1:8412/api/media/file/opal.jpg?size=card')).toBe(
      '/api/media/file/opal.jpg?size=card'
    )
  })

  test('preserves Blob and relative URLs', () => {
    expect(resolveMediaUrl('https://example.public.blob.vercel-storage.com/opal.jpg')).toBe(
      'https://example.public.blob.vercel-storage.com/opal.jpg'
    )
    expect(resolveMediaUrl('/images/products/opal.jpg')).toBe('/images/products/opal.jpg')
  })

  test('turns absolute Payload media origins into same-origin URLs', () => {
    expect(
      resolveMediaUrl(
        'https://the-good-opal-co.vercel.app/api/media/file/opal.jpg?size=card'
      )
    ).toBe('/api/media/file/opal.jpg?size=card')
  })

  test('does not rewrite generic media based only on an IMG_0810 filename', () => {
    expect(
      resolveMediaUrl('https://the-good-opal-co.vercel.app/api/media/file/IMG_0810.jpg')
    ).toBe('/api/media/file/IMG_0810.jpg')
    expect(resolveMediaUrl('/api/media/file/IMG_0810.jpg')).toBe('/api/media/file/IMG_0810.jpg')
    expect(
      resolveMediaUrl('https://example.public.blob.vercel-storage.com/IMG_0810.jpg')
    ).toBe(
      'https://example.public.blob.vercel-storage.com/IMG_0810.jpg'
    )
  })
})

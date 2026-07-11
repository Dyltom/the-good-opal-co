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
})

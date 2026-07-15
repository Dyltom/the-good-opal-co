import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const source = Buffer.from('verified-opal-image')
const sourceHash = createHash('sha256').update(source).digest('hex')
const inputHash = 'b'.repeat(64)

const mocks = vi.hoisted(() => ({
  findByID: vi.fn(),
  generateCanonicalFaceTexture: vi.fn(),
  getPayload: vi.fn(),
  resolveCanonicalFaceMapping: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@/lib/custom-builder/canonical-face-mapping', () => ({
  resolveCanonicalFaceMapping: mocks.resolveCanonicalFaceMapping,
}))
vi.mock('@/lib/custom-builder/canonical-face-texture', () => ({
  generateCanonicalFaceTexture: mocks.generateCanonicalFaceTexture,
}))

import { GET } from '../route'

const product = {
  builderMappedImageIndex: 0,
  category: 'raw-opals',
  id: 52,
  images: [
    {
      image: {
        alt: 'Opal',
        id: 7,
        url: '/api/media/file/opal.jpg',
      },
    },
  ],
  name: 'Lightning Ridge black opal',
  slug: 'lightning-ridge-black-opal',
  status: 'published',
  stock: 1,
}

function request(headers?: HeadersInit) {
  return new NextRequest('https://shop.example/api/builder/opal-face/v1/52/hash', { headers })
}

function context(hash = inputHash) {
  return { params: Promise.resolve({ inputHash: hash, productId: '52' }) }
}

describe('canonical opal face route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPayload.mockResolvedValue({ findByID: mocks.findByID })
    mocks.findByID.mockResolvedValue(product)
    mocks.resolveCanonicalFaceMapping.mockReturnValue({
      analysis: { source: 'image' },
      identity: { inputHash },
      sourceImageHash: sourceHash,
    })
    mocks.generateCanonicalFaceTexture.mockResolvedValue({
      bytes: Buffer.from('png-bytes'),
      metadata: { contentHash: 'c'.repeat(64), inputHash },
      status: 'generated',
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(source, {
          headers: { 'content-length': String(source.length), 'content-type': 'image/jpeg' },
        })
      )
    )
  })

  test('returns the verified generated PNG with immutable content-addressed caching', async () => {
    const response = await GET(request(), context())

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toContain('immutable')
    expect(response.headers.get('etag')).toBe(`"${'c'.repeat(64)}"`)
    expect(Buffer.from(await response.arrayBuffer())).toEqual(Buffer.from('png-bytes'))
    expect(fetch).toHaveBeenCalledWith(
      'https://shop.example/api/media/file/opal.jpg',
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  test('returns 304 for the generated artifact ETag', async () => {
    const response = await GET(request({ 'if-none-match': `"${'c'.repeat(64)}"` }), context())
    expect(response.status).toBe(304)
    expect(response.headers.get('etag')).toBe(`"${'c'.repeat(64)}"`)
  })

  test('rejects a URL hash that does not match the current approved mapping', async () => {
    const response = await GET(request(), context('d'.repeat(64)))
    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('rejects stored remote media URLs without making a request', async () => {
    mocks.findByID.mockResolvedValue({
      ...product,
      images: [{ image: { id: 7, url: 'https://internal.example/opal.jpg' } }],
    })
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('rejects source bytes that no longer match the approved hash', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response('changed', { headers: { 'content-type': 'image/jpeg' } }))
    )
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(mocks.generateCanonicalFaceTexture).not.toHaveBeenCalled()
  })
})

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CANONICAL_FACE_TEXTURE_VERSION } from '@/lib/custom-builder/canonical-face-texture'

const inputHash = 'b'.repeat(64)
const pathname = `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${inputHash}.png`

const mocks = vi.hoisted(() => ({
  findByID: vi.fn(),
  getPayload: vi.fn(),
  lookupCanonicalFaceArtifact: vi.fn(),
  resolveCanonicalFaceMapping: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@/lib/custom-builder/canonical-face-mapping', () => ({
  resolveCanonicalFaceMapping: mocks.resolveCanonicalFaceMapping,
}))
vi.mock('@/lib/custom-builder/canonical-face-artifact-store', () => ({
  lookupCanonicalFaceArtifact: mocks.lookupCanonicalFaceArtifact,
}))

import { GET } from '../route'

const product = {
  category: 'raw-opals',
  id: 52,
  name: 'Lightning Ridge black opal',
  slug: 'lightning-ridge-black-opal',
  status: 'published',
  stock: 1,
}

function request() {
  return new NextRequest(
    `https://shop.example/api/builder/opal-face/v1/52/${inputHash}`
  )
}

function context(hash = inputHash, productId = '52') {
  return { params: Promise.resolve({ inputHash: hash, productId }) }
}

describe('canonical opal face route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPayload.mockResolvedValue({ findByID: mocks.findByID })
    mocks.findByID.mockResolvedValue(product)
    mocks.resolveCanonicalFaceMapping.mockReturnValue({ identity: { inputHash } })
    mocks.lookupCanonicalFaceArtifact.mockResolvedValue({
      pathname,
      url: `https://store.public.blob.vercel-storage.com/${pathname}`,
    })
  })

  test('redirects the approved immutable mapping to its durable Blob artifact', async () => {
    const response = await GET(request(), context())

    expect(response.status).toBe(307)
    expect(response.headers.get('cache-control')).toContain('immutable')
    expect(response.headers.get('location')).toBe(
      `https://store.public.blob.vercel-storage.com/${pathname}`
    )
    expect(mocks.lookupCanonicalFaceArtifact).toHaveBeenCalledWith(pathname)
  })

  test.each([
    ['invalid product id', inputHash, '0'],
    ['invalid hash', 'not-a-hash', '52'],
    ['stale mapping hash', 'd'.repeat(64), '52'],
  ])('rejects %s', async (_label, hash, productId) => {
    if (hash !== 'not-a-hash') {
      mocks.resolveCanonicalFaceMapping.mockReturnValue({ identity: { inputHash } })
    }
    const response = await GET(request(), context(hash, productId))
    expect(response.status).toBe(404)
  })

  test.each([
    { ...product, category: 'rings' },
    { ...product, status: 'draft' },
    { ...product, stock: 0 },
  ])('does not expose an unavailable product artifact', async (unavailableProduct) => {
    mocks.findByID.mockResolvedValue(unavailableProduct)
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(mocks.lookupCanonicalFaceArtifact).not.toHaveBeenCalled()
  })

  test.each([
    'https://internal.example/face.png',
    'https://owned.public.blob.vercel-storage.com.evil.example/face.png',
    'https://blob.vercel-storage.com/face.png',
    'https://user:password@owned.public.blob.vercel-storage.com/face.png',
    'http://owned.public.blob.vercel-storage.com/face.png',
  ])('rejects an invalid artifact URL %s', async (url) => {
    mocks.lookupCanonicalFaceArtifact.mockResolvedValue({ pathname, url })
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
  })

  test('rejects an artifact stored under a mismatched pathname', async () => {
    mocks.lookupCanonicalFaceArtifact.mockResolvedValue({
      pathname: `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${'a'.repeat(64)}.png`,
      url: `https://store.public.blob.vercel-storage.com/${pathname}`,
    })
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
  })

  test('fails closed when durable storage is unavailable', async () => {
    mocks.lookupCanonicalFaceArtifact.mockRejectedValue(new Error('blob unavailable'))
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CANONICAL_FACE_TEXTURE_VERSION } from '@/lib/custom-builder/canonical-face-texture'

const inputHash = 'b'.repeat(64)
const pngBytes = Buffer.from('canonical-face-png')
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
    mocks.lookupCanonicalFaceArtifact.mockResolvedValue(pngBytes)
  })

  test('serves the approved immutable mapping PNG from durable storage', async () => {
    const response = await GET(request(), context())

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toContain('immutable')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(pngBytes)
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

  test('returns 404 when the artifact has not been generated', async () => {
    mocks.lookupCanonicalFaceArtifact.mockResolvedValue(undefined)
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  test('fails closed when durable storage is unavailable', async () => {
    mocks.lookupCanonicalFaceArtifact.mockRejectedValue(new Error('disk unavailable'))
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})

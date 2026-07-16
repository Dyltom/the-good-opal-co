import { NextRequest } from 'next/server'
import { resolveCanonicalFaceMapping } from '@/lib/custom-builder/canonical-face-mapping'
import { lookupCanonicalFaceArtifact } from '@/lib/custom-builder/canonical-face-artifact-store'
import { CANONICAL_FACE_TEXTURE_VERSION } from '@/lib/custom-builder/canonical-face-texture'
import { createOpalVisualProfile, inferBuilderStoneType } from '@/lib/custom-builder/opal-visual'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 10

const immutableHeaders = {
  'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
}
const noStoreHeaders = { 'Cache-Control': 'private, no-store' }

function publicBlobUrl(value: unknown, expectedPathname: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as { pathname?: unknown; url?: unknown }
  if (record.pathname !== expectedPathname || typeof record.url !== 'string') return undefined

  try {
    const url = new URL(record.url)
    if (
      url.protocol !== 'https:' ||
      url.port !== '' ||
      url.username ||
      url.password ||
      !url.hostname.endsWith('.blob.vercel-storage.com') ||
      url.hostname === 'blob.vercel-storage.com'
    ) {
      return undefined
    }
    return url.toString()
  } catch {
    return undefined
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ inputHash: string; productId: string }> }
) {
  const { inputHash, productId } = await params
  const id = Number(productId)
  if (!Number.isSafeInteger(id) || id < 1 || !/^[a-f0-9]{64}$/.test(inputHash)) {
    return new Response('Not found', { headers: noStoreHeaders, status: 404 })
  }

  try {
    const payload = await getPayload()
    const product = await payload.findByID({
      collection: 'products',
      depth: 0,
      id,
      overrideAccess: true,
    })
    if (
      product.category !== 'raw-opals' ||
      product.status !== 'published' ||
      typeof product.stock !== 'number' ||
      product.stock < 1
    ) {
      return new Response('Not found', { headers: noStoreHeaders, status: 404 })
    }

    const stoneType = inferBuilderStoneType(product.stoneType, product.name)
    const profile = createOpalVisualProfile(product.slug, product.name, stoneType, product)
    const mapping = resolveCanonicalFaceMapping(id, product, 1 / profile.visual.aspectRatio)
    if (!mapping || mapping.identity.inputHash !== inputHash) {
      return new Response('Not found', { headers: noStoreHeaders, status: 404 })
    }

    const pathname = `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${inputHash}.png`
    const artifact = await lookupCanonicalFaceArtifact(pathname)
    const url = publicBlobUrl(artifact, pathname)
    if (!url) return new Response('Not found', { headers: noStoreHeaders, status: 404 })

    return new Response(null, {
      headers: { ...immutableHeaders, Location: url },
      status: 307,
    })
  } catch (error: unknown) {
    console.error('Canonical opal face lookup failed', error)
    return new Response('Not found', { headers: noStoreHeaders, status: 404 })
  }
}

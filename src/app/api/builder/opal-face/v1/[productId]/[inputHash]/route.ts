import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'
import { resolveCanonicalFaceMapping } from '@/lib/custom-builder/canonical-face-mapping'
import { generateCanonicalFaceTexture } from '@/lib/custom-builder/canonical-face-texture'
import { createOpalVisualProfile, inferBuilderStoneType } from '@/lib/custom-builder/opal-visual'
import { resolveMediaUrl } from '@/lib/media-url'
import { getPayload } from '@/lib/payload'
import type { Media, Product } from '@/types/payload-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const MAXIMUM_SOURCE_BYTES = 25 * 1024 * 1024
const immutableHeaders = {
  'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
  'Content-Type': 'image/png',
  'X-Content-Type-Options': 'nosniff',
}
const noStoreHeaders = { 'Cache-Control': 'private, no-store' }

function selectedImage(product: Product): number | Media | undefined {
  const images = product.images ?? []
  const requested = product.builderMappedImageIndex
  const index =
    typeof requested === 'number' &&
    Number.isInteger(requested) &&
    requested >= 0 &&
    requested < images.length
      ? requested
      : 0
  return (images[index] ?? images[0])?.image ?? undefined
}

async function selectedMedia(product: Product): Promise<Media | undefined> {
  const relationship = selectedImage(product)
  if (relationship && typeof relationship === 'object') return relationship
  if (typeof relationship !== 'number') return undefined
  const payload = await getPayload()
  return payload.findByID({
    collection: 'media',
    depth: 0,
    id: relationship,
    overrideAccess: true,
  })
}

function sourceUrl(request: NextRequest, media: Media): string | undefined {
  const resolved = resolveMediaUrl(media.url)
  if (!resolved || resolved.startsWith('//')) return undefined
  try {
    const url = new URL(resolved, request.nextUrl.origin)
    // Public generation must not become a stored-URL SSRF primitive. Imported
    // media is served by this application; remote originals are copied first.
    if (url.origin !== request.nextUrl.origin || url.username || url.password) return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

async function fetchSource(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { accept: 'image/*' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Source image request failed (${response.status})`)
  const mediaType = response.headers.get('content-type')?.toLowerCase()
  if (mediaType && !mediaType.startsWith('image/')) throw new Error('Source media is not an image')
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAXIMUM_SOURCE_BYTES) {
    throw new Error('Source image exceeds 25 MB generation limit')
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length === 0) throw new Error('Source image is empty')
  if (bytes.length > MAXIMUM_SOURCE_BYTES) {
    throw new Error('Source image exceeds 25 MB generation limit')
  }
  return bytes
}

export async function GET(
  request: NextRequest,
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
      depth: 1,
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

    const media = await selectedMedia(product)
    const url = media ? sourceUrl(request, media) : undefined
    if (!url) return new Response('Not found', { headers: noStoreHeaders, status: 404 })

    const source = await fetchSource(url)
    const sourceHash = createHash('sha256').update(source).digest('hex')
    if (sourceHash !== mapping.sourceImageHash) {
      return new Response('Not found', { headers: noStoreHeaders, status: 404 })
    }

    const generated = await generateCanonicalFaceTexture({ analysis: mapping.analysis, source })
    if (generated.status !== 'generated' || generated.metadata.inputHash !== inputHash) {
      return new Response('Not found', { headers: noStoreHeaders, status: 404 })
    }

    const etag = `"${generated.metadata.contentHash}"`
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { headers: { ...immutableHeaders, ETag: etag }, status: 304 })
    }
    return new Response(Uint8Array.from(generated.bytes), {
      headers: { ...immutableHeaders, ETag: etag },
      status: 200,
    })
  } catch (error: unknown) {
    console.error('Canonical opal face generation failed', error)
    return new Response('Not found', { headers: noStoreHeaders, status: 404 })
  }
}

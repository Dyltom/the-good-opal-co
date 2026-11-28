import type { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { findShopAdmin, readPhotoUploadToken, type ShopAdmin } from '@/lib/mcp-oauth'
import { getPayload } from '@/lib/payload'
import { escapeHtml, page } from '@/lib/plain-page'
import { isSameOriginRequest } from '@/lib/same-origin'
import type { Media, Product, User } from '@/types/payload-types'

const MEGABYTE = 1024 * 1024
const MAX_PHOTO_MB = 30
const MAX_UPLOAD_MB = 90
const MAX_PHOTOS_PER_UPLOAD = 12
const PHOTO_TYPES: Record<string, { mimetype: string; extension: string }> = {
  jpeg: { mimetype: 'image/jpeg', extension: 'jpg' },
  png: { mimetype: 'image/png', extension: 'png' },
  webp: { mimetype: 'image/webp', extension: 'webp' },
}

const UPLOAD_SCRIPT = `
const form = document.querySelector('form')
const tooBig = document.getElementById('too-big')
form.addEventListener('submit', (event) => {
  const total = [...form.photos.files].reduce((sum, file) => sum + file.size, 0)
  tooBig.hidden = total <= ${MAX_UPLOAD_MB * MEGABYTE}
  if (!tooBig.hidden) return event.preventDefault()
  const button = form.querySelector('button')
  button.disabled = true
  button.textContent = 'Uploading, keep this page open...'
})
form.photos.addEventListener('change', () => { tooBig.hidden = true })
`

type UploadTarget = { admin: ShopAdmin; product: Product | null }
type RouteContext = { params: Promise<{ token: string }> }

function problemPage(message: string, status: number): Response {
  return page(
    'Cannot add photos',
    `<h1>Cannot add photos</h1><p class="error">${escapeHtml(message)}</p>`,
    status
  )
}

async function uploadTarget(payload: Payload, token: string): Promise<UploadTarget | string> {
  const claims = readPhotoUploadToken(token)
  const admin = claims && (await findShopAdmin(payload, claims.userId, claims.sessionVersion))
  if (!claims || !admin) return 'This photo link has expired. Ask Claude for a new one.'
  if (claims.productId === null) return { admin, product: null }
  const product = await payload.findByID({
    collection: 'products',
    id: claims.productId,
    depth: 1,
    user: admin.user,
    overrideAccess: false,
    disableErrors: true,
  })
  if (!product) return 'That listing no longer exists. Ask Claude for a new photo link.'
  return { admin, product }
}

function galleryMedia(product: Product): Media[] {
  return (product.images ?? []).flatMap(({ image }) =>
    typeof image === 'object' && image ? [image] : []
  )
}

function galleryIds(product: Product): number[] {
  return (product.images ?? []).flatMap(({ image }) =>
    typeof image === 'number' ? [image] : image ? [image.id] : []
  )
}

function addedNotice(product: Product | null, added: number): string {
  const count = `${added} photo${added === 1 ? '' : 's'}`
  const where =
    product?.status === 'draft'
      ? 'added to this draft'
      : product
        ? `saved to your Media library. ${product.name} is no longer a draft, so they were not added to it`
        : 'saved to your Media library'
  return `<p class="done" role="status">${escapeHtml(`${count} ${where}.`)} Go back to Claude and tell it they are uploaded.</p>`
}

function uploadPage({ product }: UploadTarget, notice = '', status = 200): Response {
  const gallery = product ? galleryMedia(product) : []
  const thumbnails = gallery.length
    ? `<p>On this listing now (${gallery.length}):</p><div class="photos">${gallery
        .map(
          (media) =>
            `<img src="${escapeHtml(media.sizes?.thumbnail?.url ?? media.url ?? '')}" alt="${escapeHtml(media.alt ?? '')}">`
        )
        .join('')}</div>`
    : ''
  const heading = product ? `Add photos to ${escapeHtml(product.name)}` : 'Add photos to your shop'
  const destination = product
    ? 'They are added to the end of this draft listing, in the order you pick them.'
    : 'They go into your Media library for Claude to use.'
  return page(
    'Add photos',
    `<h1>${heading}</h1>
${notice}
<p>${destination} Up to ${MAX_PHOTOS_PER_UPLOAD} at a time. Photos are saved exactly as they are, never edited.</p>
${thumbnails}
<form method="post" enctype="multipart/form-data">
<label for="photos">Photos</label>
<input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required>
<p class="error" role="alert" id="too-big" hidden>Those photos add up to more than ${MAX_UPLOAD_MB} MB. Pick fewer, add them, then add the rest.</p>
<button type="submit">Add photos</button>
</form>
<script>${UPLOAD_SCRIPT}</script>`,
    status
  )
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'photo'
  )
}

async function readPhotos(
  form: FormData
): Promise<{ file: File; data: Buffer; format: string }[] | string> {
  const files = form
    .getAll('photos')
    .filter((value): value is File => value instanceof File && value.size > 0)
  if (files.length === 0) return 'Pick at least one photo.'
  if (files.length > MAX_PHOTOS_PER_UPLOAD)
    return `Pick up to ${MAX_PHOTOS_PER_UPLOAD} photos at a time, then add the rest.`
  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > MAX_UPLOAD_MB * MEGABYTE)
    return `Those photos add up to more than ${MAX_UPLOAD_MB} MB. Pick fewer, add them, then add the rest.`
  const photos = []
  for (const file of files) {
    if (file.size > MAX_PHOTO_MB * MEGABYTE) return `${file.name} is over ${MAX_PHOTO_MB} MB.`
    const data = Buffer.from(await file.arrayBuffer())
    const format = (
      await sharp(data)
        .metadata()
        .catch(() => null)
    )?.format
    if (!format || !PHOTO_TYPES[format])
      return `${file.name} is not a JPEG, PNG or WebP photo. On an iPhone, pick it from Photos rather than Files.`
    photos.push({ file, data, format })
  }
  return photos
}

async function savePhotos(
  payload: Payload,
  user: User,
  product: Product | null,
  photos: { file: File; data: Buffer; format: string }[]
): Promise<number[]> {
  const startAt = product ? galleryMedia(product).length + 1 : 1
  const ids: number[] = []
  for (const [index, { file, data, format }] of photos.entries()) {
    const type = PHOTO_TYPES[format]!
    const alt = product
      ? `${product.name}, photo ${startAt + index}`
      : `Shop photo ${slug(file.name)}`
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data,
        mimetype: type.mimetype,
        name: `${slug(product?.name ?? file.name)}.${type.extension}`,
        size: data.byteLength,
      },
      user,
      overrideAccess: false,
    })
    ids.push(media.id)
  }
  return ids
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const { token } = await params
  const payload = await getPayload()
  const target = await uploadTarget(payload, token)
  if (typeof target === 'string') return problemPage(target, 410)
  const added = Number(request.nextUrl.searchParams.get('added'))
  return uploadPage(target, added > 0 ? addedNotice(target.product, added) : '')
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<Response> {
  if (!isSameOriginRequest(request))
    return problemPage('Open this page from the link Claude gave you.', 403)
  const { token } = await params
  const payload = await getPayload()
  const target = await uploadTarget(payload, token)
  if (typeof target === 'string') return problemPage(target, 410)

  const photos = await readPhotos(await request.formData())
  if (typeof photos === 'string')
    return uploadPage(target, `<p class="error" role="alert">${escapeHtml(photos)}</p>`, 400)

  const { user } = target.admin
  const ids = await savePhotos(payload, user, target.product, photos)
  const { product } = target
  if (product?.status === 'draft') {
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: [...galleryIds(product), ...ids].map((image) => ({ image })) },
      user,
      overrideAccess: false,
    })
  }
  const back = new URL(request.nextUrl.pathname, request.nextUrl.origin)
  back.searchParams.set('added', String(ids.length))
  return new Response(null, {
    status: 303,
    headers: { Location: `${back.pathname}${back.search}` },
  })
}

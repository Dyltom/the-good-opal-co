import sharp from 'sharp'
import { getPayload as bootPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databaseUrl = process.env.DATABASE_URL
let payload: Payload
const created: number[] = []

async function upload(filename: string, data: Record<string, unknown> = {}) {
  const photo = await sharp({
    create: { width: 40, height: 30, channels: 3, background: '#2a6f97' },
  })
    .jpeg()
    .toBuffer()
  const media = await payload.create({
    collection: 'media',
    data,
    file: { data: photo, mimetype: 'image/jpeg', name: filename, size: photo.byteLength },
    overrideAccess: true,
  })
  created.push(media.id)
  return media
}

describe.skipIf(!databaseUrl)('media uploads against Postgres', () => {
  beforeAll(async () => {
    process.env.PAYLOAD_SECRET ??= 'media-upload-test-secret'
    process.env.RESEND_API_KEY ??= 're_test'
    const { default: config } = await import('@/payload.config')
    payload = await bootPayload({ config })
  }, 120_000)

  afterAll(async () => {
    for (const id of created) {
      await payload.delete({ collection: 'media', id, overrideAccess: true })
    }
    await payload?.destroy()
  })

  it('saves a bulk-uploaded phone photo with no description', async () => {
    const media = await upload('IMG_4821.jpg')
    expect(media.alt).toBe('')
  })

  it('describes a photo from a descriptive filename when none is typed', async () => {
    const media = await upload('black-opal_ring.jpg')
    expect(media.alt).toBe('black opal ring')
  })

  it('keeps a typed description and lets it be cleared later', async () => {
    const media = await upload('IMG_4822.jpg', { alt: 'Boulder opal pendant' })
    expect(media.alt).toBe('Boulder opal pendant')
    const cleared = await payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: null },
      overrideAccess: true,
    })
    expect(cleared.alt).toBe('')
  })

  it('saves the upload with its fallback when the photo describer cannot run', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    try {
      const media = await upload('opal-pendant.jpg')
      expect(media.alt).toBe('opal pendant')
    } finally {
      delete process.env.ANTHROPIC_API_KEY
    }
  })
})

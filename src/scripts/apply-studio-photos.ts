import { readdir, readFile } from 'node:fs/promises'
import { join, parse } from 'node:path'
import type { Media } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import { BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT } from '@/lib/custom-builder/builder-mapping-trigger'

const STUDIO_DIR = join(process.cwd(), 'data/studio-photos')
const SOURCE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const STUDIO_CAPTION = 'Studio shot: background replaced, stone not retouched'

async function studioMediaFor(original: Media): Promise<number> {
  const payload = await getPayload()
  const stem = parse(original.filename ?? '').name
  const filename = `studio-${stem}.jpg`
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id
  const data = await readFile(join(STUDIO_DIR, `${stem}.jpg`))
  const created = await payload.create({
    collection: 'media',
    data: { alt: original.alt, caption: STUDIO_CAPTION, tenantId: original.tenantId },
    file: { data, mimetype: 'image/jpeg', name: filename, size: data.byteLength },
    context: { [BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT]: true },
    overrideAccess: true,
  })
  return created.id
}

async function main() {
  const payload = await getPayload()
  const stems = (await readdir(STUDIO_DIR))
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => parse(f).name)
  const originals = await payload.find({
    collection: 'media',
    where: {
      filename: { in: stems.flatMap((stem) => SOURCE_EXTENSIONS.map((ext) => stem + ext)) },
    },
    pagination: false,
    overrideAccess: true,
  })
  const studioFor = new Map<number, number>()
  for (const original of originals.docs) studioFor.set(original.id, await studioMediaFor(original))

  const products = await payload.find({
    collection: 'products',
    where: { 'images.image': { in: [...studioFor.keys()] } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  for (const product of products.docs) {
    const ids = (product.images ?? []).map((entry) =>
      typeof entry.image === 'object' && entry.image ? entry.image.id : entry.image
    )
    const images = [...new Set(ids.flatMap((id) => (id == null ? [] : [studioFor.get(id) ?? id])))]
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: images.map((image) => ({ image })) },
      overrideAccess: true,
    })
    console.log(`${product.slug}: ${images.length} photos`)
  }
  console.log(`${studioFor.size} studio photos, ${products.docs.length} products updated`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

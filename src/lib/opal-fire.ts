import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const BACKGROUND_DISTANCE = 40
const BRIGHTEST_SHARE = 0.15

const scores = new Map<string, Promise<number>>()

async function measure(filename: string): Promise<number> {
  const uploads = process.env['UPLOAD_DIR']?.trim() || process.cwd()
  const input = await readFile(path.join(uploads, 'media', path.basename(filename)))
  const { data } = await sharp(input)
    .resize(64, 64, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const [r0 = 0, g0 = 0, b0 = 0] = data
  const chroma: number[] = []
  for (let i = 0; i + 2 < data.length; i += 3) {
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    if (Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0) < BACKGROUND_DISTANCE) continue
    chroma.push(Math.max(r, g, b) - Math.min(r, g, b))
  }
  if (chroma.length === 0) return 0
  const brightest = chroma.sort((a, b) => b - a).slice(0, Math.ceil(chroma.length * BRIGHTEST_SHARE))
  return brightest.reduce((sum, value) => sum + value, 0) / brightest.length
}

export function opalFire(filename: string): Promise<number> {
  let score = scores.get(filename)
  if (!score) {
    score = measure(filename).catch(() => 0)
    scores.set(filename, score)
  }
  return score
}

import { readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/data/products'

function detectedExtension(bytes: Buffer): '.jpg' | '.png' | '.webp' | '.unknown' {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return '.jpg'
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return '.png'
  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return '.webp'
  return '.unknown'
}

describe('seed product images', () => {
  test('contains unique live Woo identities without invented quantities', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0)
    expect(new Set(PRODUCTS.map(({ id }) => id)).size).toBe(PRODUCTS.length)
    expect(new Set(PRODUCTS.map(({ slug }) => slug)).size).toBe(PRODUCTS.length)
    expect(PRODUCTS.every(({ available }) => typeof available === 'boolean')).toBe(true)
    expect(PRODUCTS.every((product) => !('stock' in product))).toBe(true)
  })

  test('exist and use a filename extension matching their encoded format', () => {
    for (const product of PRODUCTS) {
      if (!product.image?.startsWith('/images/products/')) continue
      const filePath = resolve(process.cwd(), 'public', product.image.replace(/^\//, ''))
      const bytes = readFileSync(filePath).subarray(0, 12)
      const expected =
        extname(filePath).toLowerCase() === '.jpeg' ? '.jpg' : extname(filePath).toLowerCase()

      expect(detectedExtension(bytes), `${product.slug}: ${product.image}`).toBe(expected)
    }
  })
})

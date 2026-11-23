import type { Field, FieldHook } from 'payload'
import { describe, expect, it } from 'vitest'
import { Products } from '../collections/Products'
import { duplicateSafe } from '../duplicate-safe'

function findField(fields: Field[], name: string): Field | undefined {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if ('fields' in field) {
      const nested = findField(field.fields, name)
      if (nested) return nested
    }
  }
  return undefined
}

function duplicatedValue(name: string, value: unknown): unknown {
  const field = findField(duplicateSafe(Products).fields, name) as { hooks?: { beforeDuplicate?: FieldHook[] } }
  return (field.hooks?.beforeDuplicate ?? []).reduce<unknown>(
    (current, hook) => {
      const next = hook({ value: current } as Parameters<FieldHook>[0])
      return next === undefined ? current : next
    },
    value
  )
}

describe('duplicating a product', () => {
  it('drops the old shop id and sku so the copy does not clash with the original', () => {
    expect(duplicatedValue('legacyWooId', 4821)).toBeNull()
    expect(duplicatedValue('sku', 'GOC-RING-12')).toBeNull()
  })

  it('gives the copy a new url-safe slug each time', () => {
    const first = duplicatedValue('slug', 'sun-and-moon-ring')
    const second = duplicatedValue('slug', 'sun-and-moon-ring')
    expect(first).toMatch(/^sun-and-moon-ring-copy-[a-z0-9]+$/)
    expect(second).not.toBe(first)
  })

  it('keeps the copy as a draft until it is edited and published', () => {
    expect(duplicatedValue('status', 'published')).toBe('draft')
  })
})

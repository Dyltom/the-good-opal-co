import { describe, expect, test } from 'vitest'
import { summarize } from '../catalog'

describe('summarize', () => {
  test('keeps short descriptions whole and cuts long ones at a word boundary', () => {
    expect(summarize('  A  bright\nopal. ')).toBe('A bright opal.')

    const source = 'Lightning Ridge black opal with rolling flash of red and green across the face, '.repeat(4).trim()
    const long = summarize(source)
    const kept = long.slice(0, -1)
    expect(long.length).toBeLessThanOrEqual(160)
    expect(long.endsWith('…')).toBe(true)
    expect(source.startsWith(kept)).toBe(true)
    expect(source[kept.length]).toMatch(/[\s,]/)
  })
})

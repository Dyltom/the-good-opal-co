import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

describe('builder candidate image selection migration', () => {
  test('adds and removes the separate gallery candidate index', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/migrations/20260715_070000_builder_candidate_image_selection.ts'
      ),
      'utf8'
    )

    expect(source).toContain('ADD COLUMN IF NOT EXISTS "builder_photo_candidate_image_index"')
    expect(source).toContain('DROP COLUMN IF EXISTS "builder_photo_candidate_image_index"')
  })
})

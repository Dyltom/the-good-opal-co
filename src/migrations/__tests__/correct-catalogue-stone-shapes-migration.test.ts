import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import { down, up } from '../20260715_063000_correct_catalogue_stone_shapes'

describe('correct catalogue stone shapes migration', () => {
  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('keeps crop data intact and protects the reviewed result', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/migrations/20260715_063000_correct_catalogue_stone_shapes.ts'),
      'utf8'
    )

    expect(source).toContain("THEN 'elongated'")
    expect(source).toContain("THEN 'cushion'")
    expect(source).toContain("THEN 'coral'")
    expect(source).toContain('"builder_mapping_status" = \'reviewed\'')
    expect(source).toContain('"builder_mapping_mode" = \'manual\'')
    expect(source).not.toContain('"builder_mapping_notes" =')
    expect(source).not.toContain('"builder_photo_focal_x" =')
    expect(source).not.toContain('"builder_photo_zoom" =')
  })
})

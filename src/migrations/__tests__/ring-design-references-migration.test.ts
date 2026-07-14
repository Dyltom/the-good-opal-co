import type { MigrateUpArgs } from '@payloadcms/db-postgres'
import { describe, expect, test, vi } from 'vitest'
import { up } from '../20260714_224500_ring_design_references'

describe('ring design reference migration', () => {
  test('separates parameterized seed data from schema DDL', async () => {
    const execute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute } } as unknown as MigrateUpArgs)

    expect(execute).toHaveBeenCalledTimes(2)
  })
})

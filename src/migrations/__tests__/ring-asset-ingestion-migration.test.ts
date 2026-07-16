import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import { down, up } from '../20260716_120000_ring_asset_ingestion'

describe('ring asset ingestion migration', () => {
  test('executes one atomic schema statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('persists immutable identity, parsed geometry metadata, and document locking', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/migrations/20260716_120000_ring_asset_ingestion.ts'),
      'utf8'
    )
    const index = readFileSync(resolve(process.cwd(), 'src/migrations/index.ts'), 'utf8')

    expect(source).toContain('CREATE TABLE "ring_assets"')
    expect(source).toContain('CREATE UNIQUE INDEX "ring_assets_sha256_idx"')
    expect(source).toContain('"node_names" jsonb NOT NULL')
    expect(source).toContain('"material_names" jsonb NOT NULL')
    expect(source).toContain('"bounds" jsonb NOT NULL')
    expect(source).toContain('payload_locked_documents_rels_ring_assets_fk')
    expect(index).toContain("name: '20260716_120000_ring_asset_ingestion'")
  })
})

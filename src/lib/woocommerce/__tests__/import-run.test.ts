import { describe, expect, it } from 'vitest'
import { claimWooImportRun, parseWooImportRunConfiguration } from '../import-run'

describe('WooCommerce import run configuration', () => {
  it('does not require a ledger identity for dry runs', () => {
    expect(parseWooImportRunConfiguration({}, false)).toBeNull()
  })

  it('requires an explicit unique run ID and mode for mutations', () => {
    expect(() => parseWooImportRunConfiguration({}, true)).toThrow('WOO_IMPORT_RUN_ID')
    expect(() =>
      parseWooImportRunConfiguration({ WOO_IMPORT_RUN_ID: 'cutover-20260712' }, true)
    ).toThrow('WOO_IMPORT_MODE')
  })

  it('accepts a deliberate final delta and records its deployment', () => {
    expect(
      parseWooImportRunConfiguration(
        {
          WOO_IMPORT_RUN_ID: 'final-delta-20260712-01',
          WOO_IMPORT_MODE: 'final-delta',
          VERCEL_DEPLOYMENT_ID: 'dpl_123',
        },
        true
      )
    ).toEqual({
      runId: 'final-delta-20260712-01',
      mode: 'final-delta',
      deploymentId: 'dpl_123',
    })
  })

  it('refuses every reuse of a claimed run ID', async () => {
    await expect(
      claimWooImportRun(
        { runId: 'final-delta-20260712-01', mode: 'final-delta' },
        {
          create: () => Promise.reject(new Error('unique constraint')),
          findStatus: () => Promise.resolve('completed'),
        }
      )
    ).rejects.toThrow('already claimed (completed)')
  })

  it('does not disguise an unrelated ledger write failure', async () => {
    const databaseError = new Error('database unavailable')
    await expect(
      claimWooImportRun(
        { runId: 'initial-20260712-01', mode: 'initial' },
        {
          create: () => Promise.reject(databaseError),
          findStatus: () => Promise.resolve(null),
        }
      )
    ).rejects.toBe(databaseError)
  })
})

import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { loadWooCommerceSnapshotDirectory } from '../snapshot-file'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

describe('WooCommerce snapshot files', () => {
  test('rejects a snapshot with an invalid refund order key', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'woo-snapshot-'))
    directories.push(directory)
    await Promise.all([
      writeFile(path.join(directory, 'products.json'), '[]'),
      writeFile(path.join(directory, 'orders.json'), '[]'),
      writeFile(path.join(directory, 'customers.json'), '[]'),
      writeFile(path.join(directory, 'refunds.json'), '{"not-an-order":[]}'),
    ])

    await expect(loadWooCommerceSnapshotDirectory(directory)).rejects.toThrow(
      'Invalid WooCommerce refund order ID'
    )
  })
})

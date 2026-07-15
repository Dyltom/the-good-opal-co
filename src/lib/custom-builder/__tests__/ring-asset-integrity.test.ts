import { describe, expect, test } from 'vitest'
import { verifyRingAssetSha256 } from '../ring-asset-integrity'

describe('ring asset integrity', () => {
  test('accepts only bytes matching the approved SHA-256 digest', async () => {
    const bytes = new TextEncoder().encode('approved ring asset').buffer

    await expect(
      verifyRingAssetSha256(
        bytes,
        'b605ed8daf15603150ac85048894807bff1d10e293567821df8ddef22936544b'
      )
    ).resolves.toBe(true)
    await expect(verifyRingAssetSha256(bytes, '0'.repeat(64))).resolves.toBe(false)
    await expect(verifyRingAssetSha256(bytes, 'invalid')).resolves.toBe(false)
  })
})

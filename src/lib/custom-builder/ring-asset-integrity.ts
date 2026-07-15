/** Verifies fetched GLB bytes before an approved asset is parsed or displayed. */
export async function verifyRingAssetSha256(
  bytes: ArrayBuffer,
  expectedSha256: string
): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(expectedSha256) || !globalThis.crypto?.subtle) return false
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  const actual = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0')
  ).join('')
  return actual === expectedSha256
}

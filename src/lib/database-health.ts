import { getPayload } from '@/lib/payload'

export async function checkDatabaseConnection(timeoutMs = 4_000): Promise<void> {
  const payload = await getPayload()
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    await Promise.race([
      payload.count({ collection: 'products', overrideAccess: true }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Database health check timed out')), timeoutMs)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

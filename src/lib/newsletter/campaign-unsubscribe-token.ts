import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_VERSION = 'v1'

function signatureFor(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createCampaignUnsubscribeToken(
  customerId: string | number,
  secret: string
): string {
  if (!secret.trim()) throw new Error('Newsletter token secret is required')

  const payload = Buffer.from(
    JSON.stringify({ id: String(customerId), version: TOKEN_VERSION }),
    'utf8'
  ).toString('base64url')

  return `${payload}.${signatureFor(payload, secret)}`
}

export function readCampaignUnsubscribeToken(token: string, secret: string): string | null {
  if (!secret.trim()) return null

  const [payload, suppliedSignature, extra] = token.split('.')
  if (!payload || !suppliedSignature || extra) return null

  const expectedSignature = signatureFor(payload, secret)
  const supplied = Buffer.from(suppliedSignature, 'utf8')
  const expected = Buffer.from(expectedSignature, 'utf8')

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('id' in parsed) ||
      !('version' in parsed) ||
      typeof parsed.id !== 'string' ||
      parsed.id.length === 0 ||
      parsed.version !== TOKEN_VERSION
    ) {
      return null
    }

    return parsed.id
  } catch {
    return null
  }
}

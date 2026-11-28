import {
  clientRedirectUris,
  clientSecretMatches,
  findShopAdmin,
  issueTokens,
  readRefreshToken,
  redeemCode,
} from '@/lib/mcp-oauth'
import { getPayload } from '@/lib/payload'

const NO_STORE = { 'Cache-Control': 'no-store', Pragma: 'no-cache' }

function refuse(status: 400 | 401, error: string, description: string): Response {
  return Response.json({ error, error_description: description }, { status, headers: NO_STORE })
}

function basicCredentials(header: string | null): { id: string; secret: string } | null {
  const encoded = header?.match(/^Basic\s+(\S+)\s*$/i)?.[1]
  if (!encoded) return null
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const split = decoded.indexOf(':')
  if (split < 0) return null
  try {
    return {
      id: decodeURIComponent(decoded.slice(0, split)),
      secret: decodeURIComponent(decoded.slice(split + 1)),
    }
  } catch {
    return null
  }
}

export async function POST(request: Request): Promise<Response> {
  const form = new URLSearchParams(await request.text())
  const basic = basicCredentials(request.headers.get('authorization'))
  const clientId = basic?.id ?? form.get('client_id')
  const secret = basic?.secret ?? form.get('client_secret')
  if (!clientId || !clientRedirectUris(clientId))
    return refuse(401, 'invalid_client', 'Unknown client. Remove the connector and add it again.')
  if (secret && !clientSecretMatches(clientId, secret))
    return refuse(401, 'invalid_client', 'The client secret does not match.')

  const payload = await getPayload()
  const grantType = form.get('grant_type')

  if (grantType === 'authorization_code') {
    const userId = redeemCode(form.get('code'), {
      clientId,
      redirectUri: form.get('redirect_uri'),
      codeVerifier: form.get('code_verifier'),
    })
    const admin = userId === null ? null : await findShopAdmin(payload, userId)
    if (!admin) return refuse(400, 'invalid_grant', 'The sign-in code is invalid or expired.')
    return Response.json(issueTokens(admin, clientId), { headers: NO_STORE })
  }

  if (grantType === 'refresh_token') {
    const refresh = readRefreshToken(form.get('refresh_token'), clientId)
    const admin = refresh && (await findShopAdmin(payload, refresh.userId, refresh.sessionVersion))
    if (!admin) return refuse(400, 'invalid_grant', 'Sign in to the shop again.')
    return Response.json(issueTokens(admin, clientId), { headers: NO_STORE })
  }

  return refuse(400, 'unsupported_grant_type', 'Use authorization_code or refresh_token.')
}

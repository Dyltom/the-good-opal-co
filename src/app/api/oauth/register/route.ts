import { z } from 'zod'
import {
  CLIENT_AUTH_METHODS,
  clientSecretFor,
  isAllowedRedirectUri,
  registerClient,
} from '@/lib/mcp-oauth'

const ClientMetadata = z.object({
  redirect_uris: z.array(z.string()).min(1),
  client_name: z.string().optional(),
  token_endpoint_auth_method: z.string().optional(),
})

function refuse(error: string, description: string): Response {
  return Response.json({ error, error_description: description }, { status: 400 })
}

export async function POST(request: Request): Promise<Response> {
  const parsed = ClientMetadata.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return refuse('invalid_client_metadata', 'Send redirect_uris as JSON.')
  const { redirect_uris, client_name, token_endpoint_auth_method } = parsed.data
  if (!redirect_uris.every(isAllowedRedirectUri))
    return refuse('invalid_redirect_uri', 'Only Claude and local callback addresses can connect.')

  const authMethod =
    CLIENT_AUTH_METHODS.find((method) => method === token_endpoint_auth_method) ?? 'none'
  const clientId = registerClient(redirect_uris)
  return Response.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      ...(authMethod === 'none'
        ? {}
        : { client_secret: clientSecretFor(clientId), client_secret_expires_at: 0 }),
      client_name,
      redirect_uris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: authMethod,
    },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  )
}

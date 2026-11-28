import { authorizationServerMetadata } from '@/lib/mcp-oauth'

export function GET(): Response {
  return Response.json(authorizationServerMetadata())
}

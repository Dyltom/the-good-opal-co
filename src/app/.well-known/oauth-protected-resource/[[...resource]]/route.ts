import { protectedResourceMetadata } from '@/lib/mcp-oauth'

export function GET(): Response {
  return Response.json(protectedResourceMetadata())
}

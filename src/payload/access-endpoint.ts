import { accessOperation, type Endpoint } from 'payload'

export const signedInAccessEndpoint: Endpoint = {
  path: '/access',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })
    return Response.json(await accessOperation({ req }))
  },
}

import type { Where } from 'payload'

export const LISTED_PRODUCTS: Where = {
  and: [{ status: { equals: 'published' } }, { slug: { not_like: 'deposit' } }],
}

import { z } from 'zod'

export const cartProductIdSchema = z.string().trim().min(1).max(128)

export const cartItemInputSchema = z.object({
  productId: cartProductIdSchema,
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(300),
  price: z.number().finite().nonnegative(),
  image: z.string().trim().max(2048).optional(),
})

export const cartAddQuantitySchema = z.number().int().min(1).max(99)
export const cartUpdateQuantitySchema = z.number().int().min(0).max(99)
